import type { DiscoveredPlace, DiscoveredPlace as Place } from "./types";
import { classifyTemple } from "./normalize";
import { haversineKm } from "@/lib/geo/distance";

export function stripNameNoise(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(sri|shri|sr|sh|m\.|bhagwan|bhagwanjee|bhagavathi|jee|ji|the)\b/g, " ")
    .split(/[\s,'’.-]+/)
    .filter((w) => w && w.length > 1)
    .join(" ");
}

/** Deduplicate within a source list by Google Place ID (and exact normalized name as a fallback). */
export function dedupeById<T extends Pick<Place, "id" | "googlePlaceId" | "name">>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const keyId = item.googlePlaceId ?? item.id;
    const keyName = item.name.toLowerCase();
    if (seen.has(keyId)) continue;
    seen.add(keyId);
    if (seen.has(`n:${keyName}`)) continue;
    seen.add(`n:${keyName}`);
    out.push(item);
  }
  return out;
}

export interface DuplicatePair {
  a: string;
  b: string;
  reason: string;
}

/**
 * Flags near-duplicates within a discovery batch: same place returned under
 * slightly different names/coordinates but different Place IDs.
 */
export function findNearDuplicates(items: DiscoveredPlace[], opts?: { maxKm?: number; tolerance?: number }): DuplicatePair[] {
  const maxKm = opts?.maxKm ?? 0.4;
  const tolerance = opts?.tolerance ?? 0.9;
  const pairs: DuplicatePair[] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      const d = haversineKm(a.latitude, a.longitude, b.latitude, b.longitude);
      if (d > maxKm) continue;
      const sim = nameSimilarity(a.name, b.name);
      if (sim >= tolerance) {
        pairs.push({ a: a.id, b: b.id, reason: `same name (${sim.toFixed(2)}) within ${d.toFixed(2)} km` });
      } else if (d < 0.15 && Math.max(a.name.length, b.name.length) > 12) {
        pairs.push({ a: a.id, b: b.id, reason: `very close (${d.toFixed(2)} km) to another result` });
      }
    }
  }
  return pairs;
}

/** Simple bigram Dice coefficient over normalized names. */
export function nameSimilarity(a: string, b: string): number {
  const na = normalizeNameForMatch(a);
  const nb = normalizeNameForMatch(b);
  if (na === nb) return 1;
  if (na.length < 2 || nb.length < 2) return 0;
  const bigrams = (s: string) => {
    const set = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
    return set;
  };
  const A = bigrams(na);
  const B = bigrams(nb);
  let inter = 0;
  for (const bgram of A) if (B.has(bgram)) inter++;
  return (2 * inter) / (A.size + B.size);
}

export function normalizeNameForMatch(name: string): string {
  const token = stripNameNoise(name)
    .split(" ")
    .filter((w) => !["temple", "mandir", "devasthanam", "devalaya", "kovil", "koil", "the", "of", "and", "jee", "ji", "tirumala"].includes(w))
    .join(" ");
  return token;
}

export interface VerifiedMergeCandidate {
  google?: DiscoveredPlace;
  verified?: DiscoveredPlace;
}

/**
 * Merge verified directory temples with Google-discovered places within the
 * search radius. Google results keep their live fields; verified data adds
 * (never overwrites) profile links, deity and curated description.
 */
export function mergeWithVerified(
  googleItems: DiscoveredPlace[],
  verifiedItems: DiscoveredPlace[],
  opts?: { radiusKm?: number }
): { items: DiscoveredPlace[]; mergedCount: number } {
  const radiusKm = opts?.radiusKm ?? Number.MAX_SAFE_INTEGER / 2;
  const merged = [...verifiedItems];
  let mergedCount = 0;

  for (const g of googleItems) {
    let matched = false;
    for (let v = 0; v < merged.length; v++) {
      const vv = merged[v];
      const d = haversineKm(g.latitude, g.longitude, vv.latitude, vv.longitude);
      if (d > radiusKm) continue;
      const sameId = g.googlePlaceId && vv.googlePlaceId === g.googlePlaceId;
      const simName = nameSimilarity(g.name, vv.name);
      if (sameId || (d < 1 && simName >= 0.6)) {
        merged[v] = {
          ...g,
          source: "google",
          verified: vv.verified,
          deity: vv.deity,
          description: vv.description,
          region: vv.region ?? g.region,
          localNames: vv.localNames,
        };
        matched = true;
        mergedCount++;
        break;
      }
    }
    if (!matched) merged.push(g);
  }

  merged.sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0));
  return { items: merged, mergedCount };
}

export { classifyTemple };

export function isTempleLike(place: DiscoveredPlace): boolean {
  return classifyTemple({ name: place.name, types: place.types }).templeLike;
}