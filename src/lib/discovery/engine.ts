import "server-only";
import { textSearch, nearbySearch, GoogleApiError } from "@/lib/google/client";
import { googleEnabled, DEFAULT_NEARBY_RADIUS_KM, EXPANDED_NEARBY_RADIUS_KM, MIN_NEARBY_RESULTS, MAX_QUERIES_PER_DISCOVERY, MAX_DISCOVERED_ITEMS } from "@/lib/google/config";
import { toGooglePlace, toDiscoveredPlace, classifyTemple, isOtherWorship } from "@/lib/google/normalize";
import { dedupeById, findNearDuplicates, mergeWithVerified, isTempleLike } from "@/lib/google/dedupe";
import { getCached, setCached } from "@/lib/google/cache";
import { SEARCH_CACHE_TTL_MS } from "@/lib/google/types";
import { haversineKm, withinRadius } from "@/lib/geo/distance";
import { regionLabel } from "@/lib/geo/india";
import { TEMPLES, getState, templeUrl } from "@/lib/registry";
import type { DiscoveredPlace, DiscoveryResult } from "@/lib/google/types";
import type { Temple } from "@/lib/types";

export interface DiscoveryOptions {
  query?: string;
  center?: { latitude: number; longitude: number };
  radiusKm?: number;
  limit?: number;
  maxQueries?: number;
  forceLive?: boolean;
}

const DEITY_CUES: Record<string, string[]> = {
  Shiva: ["shiva", "mahadev", "siva", "bholenath", "shiv"],
  Vishnu: ["vishnu", "narayan", "narayana"],
  Krishna: ["krishna", "govind", "gopal"],
  Rama: ["ram", "ramji", "ramayan"],
  Hanuman: ["hanuman", "munjal", "hanumanji", "maruti", "anjani"],
  Devi: ["devi", "durga", "ambika", "kali", "goddess", "mata", "amman", "shakti"],
  Ganesha: ["ganesh", "ganapat", "vinayak", "siddhivinayak", "ganapati"],
  Murugan: ["murugan", "kartikeya", "subramanya", "subramaniam"],
  Ayyappa: ["ayyappa", "sabari"],
  Venkateswara: ["venkateswara", "balaji", "tirumala", "srinivasa"],
  Jain: ["jain", "tirthankar", "digambar", "swetambar", "derasar"],
  Buddhist: ["buddha", "bodh", "buddhist", "vihara"],
};

const TEMPLE_NOISE = /\b(temples?|mandirs?|devasthanams?|devalayas?|shrines?|pilgrimage|darshan|tirtha|complex|all|list)\b/gi;
const CONNECTORS = /\b(in|near|at|around|of|around|top|famous-s?)\b/gi;

/** Types allowed in the Nearby (New) includedTypes filter for temple discovery. */
const NEARBY_TEMPLE_TYPES = ["hindu_temple", "tourist_attraction"];

function extractCore(query: string): { core: string; deity?: string } {
  let rest = query.replace(TEMPLE_NOISE, " ").replace(CONNECTORS, " ").replace(/\s+/g, " ").trim();
  let deity: string | undefined;
  const lower = rest.toLowerCase();
  for (const [d, cues] of Object.entries(DEITY_CUES)) {
    if (cues.some((c) => lower === c || lower.startsWith(`${c} `) || lower.includes(` ${c} `))) {
      deity = d;
    }
  }
  if (deity) {
    const cues = DEITY_CUES[deity];
    for (const c of cues) {
      const re = new RegExp(`\\b${c}\\b`, "gi");
      rest = rest.replace(re, " ").trim();
    }
  }
  rest = rest.replace(/\s+/g, " ").trim();
  return { core: rest, deity };
}

function buildQuerySet(core: string, max: number, deity?: string): string[] {
  const base = core ? `temples in ${core}` : "temples in India";
  const candidates: string[] = [base];
  if (deity) candidates.push(`${deity} temples in ${core || "India"}`);
  if (core) {
    candidates.push(`Hindu temples in ${core}`);
    candidates.push(`famous temples in ${core}`);
    candidates.push(`ancient temples in ${core}`);
    candidates.push(`historic temples in ${core}`);
  }
  return candidates.slice(0, Math.max(1, max));
}

function verifiedAsDiscovered(t: Temple, center?: DiscoveryOptions["center"]): DiscoveredPlace {
  const state = getState(t.stateCode);
  return {
    id: `verified:${t.slug}`,
    name: t.name,
    address: `${t.location}, ${t.district}, ${state?.name ?? t.stateCode}`,
    latitude: t.latitude,
    longitude: t.longitude,
    types: ["hindu_temple"],
    openNow: null,
    mapsUrl: `/temples/${state?.slug ?? t.stateCode}/${t.slug}`,
    source: "verified",
    certainty: "temple",
    region: state?.name,
    verified: { slug: t.slug, href: templeUrl(t), name: t.name },
    deity: t.mainDeity,
    description: t.description,
    distanceKm: center ? haversineKm(t.latitude, t.longitude, center.latitude, center.longitude) : undefined,
  };
}

function verifiedWithin(center: { latitude: number; longitude: number }, radiusKm: number): DiscoveredPlace[] {
  return TEMPLES.filter((t) => withinRadius(t.latitude, t.longitude, center, radiusKm)).map((t) => verifiedAsDiscovered(t, center));
}

function cacheKeyFor(opts: DiscoveryOptions): string {
  return JSON.stringify({
    q: (opts.query ?? "").toLowerCase().trim(),
    c: opts.center ? `${opts.center.latitude.toFixed(3)},${opts.center.longitude.toFixed(3)}` : null,
    r: opts.radiusKm ?? null,
  });
}

function reduced(opts: DiscoveryOptions): DiscoveryResult {
  const query = (opts.query ?? "").trim();
  const center = opts.center;
  const radiusKm = opts.radiusKm ?? DEFAULT_NEARBY_RADIUS_KM;
  const verified = center ? verifiedWithin(center, radiusKm) : [];
  const { core, deity } = extractCore(query);
  let matched = verified;
  if (center) {
    matched = [...verified].sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  } else if (core) {
    const hay = `${deity ?? ""} ${core}`.toLowerCase();
    matched = TEMPLES.filter((t) => {
      const name = `${t.name} ${t.mainDeity} ${t.location} ${t.district} ${t.deities.join(" ")}`.toLowerCase();
      return name.includes(hay) || hay.split(" ").every((w) => w && name.includes(w));
    }).map((t) => verifiedAsDiscovered(t));
  }

  const items = dedupeById<DiscoveredPlace>(matched.slice(0, opts.limit ?? MAX_DISCOVERED_ITEMS));
  return {
    query: query || "nearby",
    queryType: center && !query ? "nearby" : "text",
    region: center ? { latitude: center.latitude, longitude: center.longitude, radiusKm } : undefined,
    items,
    count: items.length,
    mode: "degraded",
    stale: false,
    sharedHits: false,
    usedQueries: [],
    via: ["verified"],
    warnings: ["Live place discovery is temporarily unavailable. Showing verified temples on Devyatra."],
    retrievedAt: new Date().toISOString(),
  };
}

async function runLive(opts: DiscoveryOptions): Promise<DiscoveryResult> {
  const query = (opts.query ?? "").trim();
  const center = opts.center;
  const radiusKm = opts.radiusKm ?? DEFAULT_NEARBY_RADIUS_KM;
  const limit = opts.limit ?? MAX_DISCOVERED_ITEMS;
  const maxQueries = opts.maxQueries ?? MAX_QUERIES_PER_DISCOVERY;
  const warnings: string[] = [];

  const rawGooglePlaces: DiscoveredPlace[] = [];
  const usedQueries: string[] = [];

  if (center && !query) {
    // Nearby-first discovery with radius expansion when too few results.
    let radius = radiusKm;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await nearbySearch({
          latitude: center.latitude,
          longitude: center.longitude,
          radiusKm: radius,
          includedTypes: NEARBY_TEMPLE_TYPES,
          maxResults: Math.min(limit, 20),
        });
        for (const raw of res.places ?? []) {
          const gp = toGooglePlace(raw);
          if (gp && classifyTemple({ name: gp.displayName, types: gp.types }).templeLike && !isOtherWorship(gp.types)) {
            rawGooglePlaces.push(toDiscoveredPlace(gp, { source: "google", distanceKm: haversineKm(gp.latitude, gp.longitude, center.latitude, center.longitude) }));
          }
        }
        const enough = rawGooglePlaces.length >= MIN_NEARBY_RESULTS;
        if (enough) break;
        radius = Math.min(radius + EXPANDED_NEARBY_RADIUS_KM, 60);
        if (radius >= 60) break;
      } catch (err) {
        if (attempt === 0) warnings.push(`Nearby search failed: ${(err as Error).message}`);
        break;
      }
    }
  } else if (query) {
    const { core, deity } = extractCore(query);
    const queries = buildQuerySet(core, maxQueries, deity);
    usedQueries.push(...queries);
    const bias = center ? { latitude: center.latitude, longitude: center.longitude, radiusKm } : undefined;
    const settled = await Promise.allSettled(
      queries.map((q) => textSearch({ query: q, locationBias: bias, maxResults: Math.min(limit, 10) }))
    );
    settled.forEach((s, i) => {
      if (s.status === "fulfilled") {
        for (const raw of s.value.places ?? []) {
          const gp = toGooglePlace(raw);
          if (!gp || !classifyTemple({ name: gp.displayName, types: gp.types }).templeLike || isOtherWorship(gp.types)) continue;
          rawGooglePlaces.push(
            toDiscoveredPlace(gp, {
              source: "google",
              distanceKm: center ? haversineKm(gp.latitude, gp.longitude, center.latitude, center.longitude) : undefined,
            })
          );
        }
      } else {
        warnings.push(`Query "${queries[i]}" failed: ${s.reason instanceof GoogleApiError ? s.reason.kind : "error"}`);
      }
    });
  } else {
    return reduced(opts);
  }

  const uniqueGoogle = dedupeById<DiscoveredPlace>(
    rawGooglePlaces.map((p) => ({ ...p, region: p.region ?? regionLabel(p.latitude, p.longitude) ?? undefined }))
  );
  const dupes = findNearDuplicates(uniqueGoogle);
  const sharedHits = dupes.length > 0;
  if (sharedHits) {
    const drop = new Set(dupes.map((d) => d.b));
    warnings.push(`Merged ${dupes.length} near-duplicate result(s) into their parent place.`);
    for (let i = 0; i < uniqueGoogle.length; i++) {
      if (drop.has(uniqueGoogle[i].id)) {
        uniqueGoogle.splice(i, 1);
        i--;
      }
    }
  }

  const verified = center ? verifiedWithin(center, radiusKm) : [];
  const { items: merged } = mergeWithVerified(uniqueGoogle, verified, { radiusKm: center ? radiusKm : 1.5 });
  const sorted = merged.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  const items = sorted.slice(0, limit);

  return {
    query: query || "nearby",
    queryType: center && !query ? "nearby" : "text",
    region: center ? { latitude: center.latitude, longitude: center.longitude, radiusKm } : undefined,
    items,
    count: items.length,
    mode: "live",
    stale: false,
    sharedHits,
    usedQueries,
    via: ["google", ...(verified.length ? (["verified"] as const) : [])],
    warnings,
    retrievedAt: new Date().toISOString(),
  };
}

export async function discoverTemples(opts: DiscoveryOptions): Promise<DiscoveryResult> {
  if (!googleEnabled()) return reduced(opts);

  const key = `discover:${cacheKeyFor(opts)}`;
  const cached = getCached<DiscoveryResult>(key, SEARCH_CACHE_TTL_MS);
  if (cached && cached.fresh && !opts.forceLive) {
    return { ...cached.payload, mode: "cache", stale: false, retrievedAt: new Date().toISOString() };
  }

  let live: DiscoveryResult;
  try {
    live = await runLive(opts);
  } catch (err) {
    const fallback = reduced(opts);
    if (cached?.payload.items.length) {
      return {
        ...cached.payload,
        mode: "degraded",
        stale: true,
        warnings: ["Live place discovery is temporarily unavailable. Showing cached results from the last lookup."],
        retrievedAt: new Date().toISOString(),
      };
    }
    fallback.warnings = [`Live place discovery is temporarily unavailable (${err instanceof GoogleApiError ? err.kind : "error"}). Showing verified temples.`];
    return fallback;
  }

  // Stale-while-revalidate: serve fresh data, but keep cache warm for offline.
  setCached(key, live, SEARCH_CACHE_TTL_MS);
  return live;
}

export { isTempleLike }; // re-exported convenience for tests/UI