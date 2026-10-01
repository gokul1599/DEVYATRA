import { NextRequest, NextResponse } from "next/server";
import { search } from "@/lib/search";
import { getState, getStates } from "@/lib/registry";
import { getPrisma } from "@/lib/db/client";
import {
  STATE_BOUNDARIES,
  POPULAR_DISTRICTS,
  POPULAR_LOCALITIES,
} from "@/lib/map/admin-boundaries";
import { VERIFIED_DESTINATIONS } from "@/lib/destinations/registry";
import { TEMPLES } from "@/lib/data/temples";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const limit = Math.max(1, Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 10), 20));

  if (!q) {
    return NextResponse.json({
      temples: [],
      locations: [],
      deities: [],
      festivals: [],
      places: [],
      destinations: [],
      districts: [],
      states: [],
      localities: [],
    });
  }

  const queryLower = q.toLowerCase();

  // 1. Initial fast local search for temples & deities
  const localRes = search(q, limit);
  const matchedSlugs = new Set<string>();

  const outputTemples = localRes.temples.map((t) => {
    matchedSlugs.add(t.slug);
    const st = getState(t.stateCode);
    return {
      id: t.id,
      slug: t.slug,
      name: t.name,
      nameLocal: t.nameLocal ?? null,
      stateSlug: st?.slug ?? t.stateCode.toLowerCase(),
      location: t.location,
      district: t.district,
      state: st?.name || t.stateCode,
      latitude: t.latitude,
      longitude: t.longitude,
      href: `/temples/${st?.slug ?? t.stateCode.toLowerCase()}/${t.slug}`,
      category: "SACRED",
    };
  });

  // 2. Administrative Hierarchy Matches (States, Districts, Localities)
  const matchedStates: Array<{
    name: string;
    code: string;
    slug: string;
    latitude: number;
    longitude: number;
    zoom: number;
    bbox?: { minLng: number; minLat: number; maxLng: number; maxLat: number };
    type: "state";
  }> = [];

  const allStates = getStates();
  for (const s of allStates) {
    if (
      s.name.toLowerCase().includes(queryLower) ||
      s.slug.includes(queryLower) ||
      s.code.toLowerCase() === queryLower
    ) {
      const boundary = STATE_BOUNDARIES[s.slug];
      matchedStates.push({
        name: s.name,
        code: s.code,
        slug: s.slug,
        latitude: boundary?.center.lat || 20.5937,
        longitude: boundary?.center.lng || 78.9629,
        zoom: boundary?.recommendedZoom || 7,
        bbox: boundary?.bbox,
        type: "state",
      });
      if (matchedStates.length >= 3) break;
    }
  }

  const matchedDistricts: Array<{
    name: string;
    state: string;
    latitude: number;
    longitude: number;
    zoom: number;
    type: "district";
  }> = [];

  // Match districts from popular districts dictionary and all states district list
  const seenDistricts = new Set<string>();
  for (const [key, d] of Object.entries(POPULAR_DISTRICTS)) {
    if (d.name.toLowerCase().includes(queryLower) || key.includes(queryLower)) {
      seenDistricts.add(d.name.toLowerCase());
      matchedDistricts.push({
        name: d.name,
        state: d.parent || "India",
        latitude: d.center.lat,
        longitude: d.center.lng,
        zoom: d.recommendedZoom,
        type: "district",
      });
      if (matchedDistricts.length >= 4) break;
    }
  }

  if (matchedDistricts.length < 4) {
    for (const s of allStates) {
      for (const distName of s.districts) {
        if (
          distName.toLowerCase().includes(queryLower) &&
          !seenDistricts.has(distName.toLowerCase())
        ) {
          seenDistricts.add(distName.toLowerCase());
          // Approximate center using state center if not in popular dictionary
          const stBound = STATE_BOUNDARIES[s.slug];
          matchedDistricts.push({
            name: distName,
            state: s.name,
            latitude: stBound?.center.lat || 20.5937,
            longitude: stBound?.center.lng || 78.9629,
            zoom: 10,
            type: "district",
          });
          if (matchedDistricts.length >= 4) break;
        }
      }
      if (matchedDistricts.length >= 4) break;
    }
  }

  const matchedLocalities: Array<{
    name: string;
    parent: string;
    district?: string;
    state?: string;
    latitude: number;
    longitude: number;
    zoom: number;
    type: "locality";
  }> = [];

  const seenLocalities = new Set<string>();

  // 2. Query Neon PostgreSQL for Places & Temples (always query DB for rich national coverage)
  const prisma = getPrisma();
  const outputPlaces: Array<{
    id: string;
    slug: string;
    name: string;
    nativeName?: string | null;
    category: string;
    subcategory?: string | null;
    city: string | null;
    district: string | null;
    state: string | null;
    latitude: number;
    longitude: number;
    sourceType: string | null;
    href: string;
    type: "destination";
  }> = [];

  const nearMatch = q.match(/(?:temples?\s+(?:near|around|in|at|of)\s+|places?\s+(?:near|around|in|at|of)\s+|near\s+|around\s+|in\s+)(.+)/i);
  const targetQuery = nearMatch ? nearMatch[1].trim() : q;
  const targetLower = targetQuery.toLowerCase();

  // Localities from POPULAR_LOCALITIES (matching query or targetQuery)
  for (const [key, loc] of Object.entries(POPULAR_LOCALITIES)) {
    if (
      loc.name.toLowerCase().includes(queryLower) ||
      loc.name.toLowerCase().includes(targetLower) ||
      key.includes(queryLower) ||
      key.includes(targetLower)
    ) {
      if (!seenLocalities.has(loc.name.toLowerCase())) {
        seenLocalities.add(loc.name.toLowerCase());
        const parts = (loc.parent || "").split(",").map((s) => s.trim());
        const locDistrict = parts[0] || undefined;
        const locState = parts[1] || undefined;
        matchedLocalities.push({
          name: loc.name,
          parent: loc.parent || "India",
          district: locDistrict,
          state: locState,
          latitude: loc.center.lat,
          longitude: loc.center.lng,
          zoom: loc.recommendedZoom,
          type: "locality",
        });
        if (matchedLocalities.length >= 8) break;
      }
    }
  }

  if (prisma) {
    try {
      // 2a. Localities (villages, towns, cities) from Database
      if (matchedLocalities.length < 8) {
        try {
          const dbLocs = await prisma.locality.findMany({
            where: {
              name: { contains: targetQuery, mode: "insensitive" },
            },
            take: 8 - matchedLocalities.length,
            select: {
              name: true,
              kind: true,
              latitude: true,
              longitude: true,
              district: { select: { name: true, latitude: true, longitude: true } },
              state: { select: { name: true } },
            },
          });
          for (const l of dbLocs) {
            const locNameLower = l.name.toLowerCase();
            if (!seenLocalities.has(locNameLower)) {
              seenLocalities.add(locNameLower);
              const lat = l.latitude ?? l.district?.latitude ?? 20.5937;
              const lng = l.longitude ?? l.district?.longitude ?? 78.9629;
              matchedLocalities.push({
                name: l.name,
                parent: [l.district?.name, l.state?.name].filter(Boolean).join(", "),
                district: l.district?.name,
                state: l.state?.name,
                latitude: lat,
                longitude: lng,
                zoom: l.kind === "city" ? 13 : l.kind === "village" ? 14.5 : 13.5,
                type: "locality",
              });
            }
          }
        } catch {
          // ignore if locality query fails
        }
      }

      // 2b. Canonical Places from Database (by name, city, district, address)
      const canonicalMatches = await prisma.place.findMany({
        where: {
          OR: [
            { name: { contains: targetQuery, mode: "insensitive" } },
            { nativeName: { contains: targetQuery, mode: "insensitive" } },
            { category: { contains: targetQuery, mode: "insensitive" } },
            { subcategory: { contains: targetQuery, mode: "insensitive" } },
            { city: { contains: targetQuery, mode: "insensitive" } },
            { district: { contains: targetQuery, mode: "insensitive" } },
            { address: { contains: targetQuery, mode: "insensitive" } },
            { state: { contains: targetQuery, mode: "insensitive" } },
          ],
        },
        take: 20,
      });

      for (const p of canonicalMatches) {
        outputPlaces.push({
          id: p.id,
          slug: p.slug,
          name: p.name,
          nativeName: p.nativeName,
          category: p.category.toUpperCase(),
          subcategory: p.subcategory,
          city: p.city ?? null,
          district: p.district,
          state: p.state,
          latitude: p.latitude,
          longitude: p.longitude,
          sourceType: p.sourceType ?? null,
          href: `/places/${p.slug}`,
          type: "destination",
        });
      }

      // 2c. National Temples from Database (always search to find temples in village/town/city/district)
      const dbMatches = await prisma.temple.findMany({
        where: {
          OR: [
            { name: { contains: targetQuery, mode: "insensitive" } },
            { nameLocal: { contains: targetQuery, mode: "insensitive" } },
            { mainDeity: { contains: targetQuery, mode: "insensitive" } },
            { address: { contains: targetQuery, mode: "insensitive" } },
            { district: { name: { contains: targetQuery, mode: "insensitive" } } },
            { adminUnit: { name: { contains: targetQuery, mode: "insensitive" } } },
            { locality: { name: { contains: targetQuery, mode: "insensitive" } } },
          ],
        },
        take: 40,
        select: {
          id: true,
          slug: true,
          name: true,
          nameLocal: true,
          mainDeity: true,
          stateCode: true,
          address: true,
          latitude: true,
          longitude: true,
          district: { select: { name: true } },
          adminUnit: { select: { name: true } },
          locality: { select: { name: true } },
          state: { select: { name: true, slug: true } },
        },
      });

      // Sort DB matches so that exact location or name matches rank highest
      const scoredDbMatches = dbMatches.map((d) => {
        let score = 0;
        const nameLower = d.name.toLowerCase();
        const addrLower = (d.address || "").toLowerCase();
        const distLower = (d.district?.name || "").toLowerCase();
        const locLower = (d.locality?.name || "").toLowerCase();
        const adminLower = (d.adminUnit?.name || "").toLowerCase();

        if (nameLower === targetLower) score += 100;
        else if (nameLower.startsWith(targetLower)) score += 60;
        else if (nameLower.includes(targetLower)) score += 40;

        // If targetQuery matches a village/town/city in address, locality, or district:
        if (locLower.includes(targetLower) || adminLower.includes(targetLower)) score += 80;
        if (addrLower.includes(targetLower)) score += 70;
        if (distLower.includes(targetLower)) score += 50;

        return { d, score };
      });

      scoredDbMatches.sort((a, b) => b.score - a.score);

      for (const { d } of scoredDbMatches) {
        if (!matchedSlugs.has(d.slug)) {
          matchedSlugs.add(d.slug);
          const stateSlug = d.state?.slug || getState(d.stateCode)?.slug || d.stateCode.toLowerCase();
          outputTemples.push({
            id: d.id,
            slug: d.slug,
            name: d.name,
            nameLocal: d.nameLocal,
            stateSlug,
            location: d.locality?.name || d.address || d.district?.name || "",
            district: d.district?.name || "",
            state: d.state?.name || d.stateCode,
            latitude: d.latitude,
            longitude: d.longitude,
            href: `/temples/${stateSlug}/${d.slug}`,
            category: "SACRED",
          });
        }
      }
    } catch {
      // Graceful fallback
    }
  }

  // 3c. Static Verified Destinations search check
  const seenPlaceIds = new Set(outputPlaces.map((p) => p.id));
  for (const vd of VERIFIED_DESTINATIONS) {
    if (
      vd.name.toLowerCase().includes(queryLower) ||
      vd.category.toLowerCase().includes(queryLower) ||
      vd.subcategory?.toLowerCase().includes(queryLower) ||
      vd.district.toLowerCase().includes(queryLower) ||
      (vd.city && vd.city.toLowerCase().includes(queryLower))
    ) {
      if (!seenPlaceIds.has(vd.id)) {
        seenPlaceIds.add(vd.id);
        outputPlaces.push({
          id: vd.id,
          slug: vd.slug,
          name: vd.name,
          category: vd.category,
          subcategory: vd.subcategory,
          city: vd.city || vd.district,
          district: vd.district,
          state: vd.state,
          latitude: vd.latitude,
          longitude: vd.longitude,
          sourceType: vd.provenance.sourceType,
          href: `/places/${vd.slug}`,
          type: "destination",
        });
      }
      if (outputPlaces.length >= 8) break;
    }
  }

  // Unified destination suggestions for quick navigation
  const destinations = [
    ...outputTemples.map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      nativeName: t.nameLocal,
      category: "SACRED",
      subcategory: t.location || t.district,
      district: t.district,
      state: t.state,
      latitude: t.latitude,
      longitude: t.longitude,
      href: t.href,
      type: "destination" as const,
    })),
    ...outputPlaces,
  ].slice(0, 10);

  return NextResponse.json({
    temples: outputTemples.slice(0, Math.max(limit, 15)),
    locations: localRes.locations,
    deities: localRes.deities,
    festivals: localRes.festivals,
    places: outputPlaces,
    destinations,
    districts: matchedDistricts,
    states: matchedStates,
    localities: matchedLocalities,
  });
}