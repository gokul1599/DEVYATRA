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
    latitude: number;
    longitude: number;
    zoom: number;
    type: "locality";
  }> = [];

  for (const [key, loc] of Object.entries(POPULAR_LOCALITIES)) {
    if (loc.name.toLowerCase().includes(queryLower) || key.includes(queryLower)) {
      matchedLocalities.push({
        name: loc.name,
        parent: loc.parent || "India",
        latitude: loc.center.lat,
        longitude: loc.center.lng,
        zoom: loc.recommendedZoom,
        type: "locality",
      });
      if (matchedLocalities.length >= 4) break;
    }
  }

  // 3. Query Neon PostgreSQL for Places & Temples
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

  if (prisma) {
    try {
      const nearMatch = q.match(/(?:temples?\s+(?:near|around)\s+|places?\s+(?:near|around)\s+|near\s+|around\s+)(.+)/i);
      const targetQuery = nearMatch ? nearMatch[1].trim() : q;

      // 3a. Canonical Places from Database
      const canonicalMatches = await prisma.place.findMany({
        where: {
          OR: [
            { name: { contains: targetQuery, mode: "insensitive" } },
            { nativeName: { contains: targetQuery, mode: "insensitive" } },
            { category: { contains: targetQuery, mode: "insensitive" } },
            { subcategory: { contains: targetQuery, mode: "insensitive" } },
            { city: { contains: targetQuery, mode: "insensitive" } },
            { district: { contains: targetQuery, mode: "insensitive" } },
            { state: { contains: targetQuery, mode: "insensitive" } },
          ],
        },
        take: 8,
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

      // 3b. Additional Temples from Database
      if (outputTemples.length < limit) {
        const dbMatches = await prisma.temple.findMany({
          where: {
            OR: [
              { name: { contains: targetQuery, mode: "insensitive" } },
              { nameLocal: { contains: targetQuery, mode: "insensitive" } },
              { mainDeity: { contains: targetQuery, mode: "insensitive" } },
              { address: { contains: targetQuery, mode: "insensitive" } },
            ],
          },
          take: limit - outputTemples.length,
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
            state: { select: { name: true, slug: true } },
          },
        });

        for (const d of dbMatches) {
          if (!matchedSlugs.has(d.slug)) {
            matchedSlugs.add(d.slug);
            const stateSlug = d.state?.slug || getState(d.stateCode)?.slug || d.stateCode.toLowerCase();
            outputTemples.push({
              id: d.id,
              slug: d.slug,
              name: d.name,
              nameLocal: d.nameLocal,
              stateSlug,
              location: d.address || d.district?.name || "",
              district: d.district?.name || "",
              state: d.state?.name || d.stateCode,
              latitude: d.latitude,
              longitude: d.longitude,
              href: `/temples/${stateSlug}/${d.slug}`,
              category: "SACRED",
            });
          }
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
    temples: outputTemples.slice(0, limit),
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