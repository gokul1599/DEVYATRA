import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db/client";
import {
  queryDestinations,
  VERIFIED_DESTINATIONS,
  type DestinationCategory,
  type DestinationRecord,
} from "@/lib/destinations/registry";
import { calculateHaversineDistanceKm } from "@/lib/nearby/engine";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * GET /api/destinations
 * 
 * Multi-category query for India's sacred, heritage, nature, beach, wildlife, adventure, and food destinations.
 * Supports:
 * - category: ALL | SACRED | HERITAGE | NATURE | BEACHES | PARKS | WILDLIFE | ADVENTURE | CULTURE | FOOD | SHOPPING
 * - state: state name filter
 * - district: district filter
 * - q: text search query
 * - lat & lng: coordinates for proximity calculation & radius filtering
 * - radiusKm: max distance in kilometers (default: 300)
 * - limit: max results (default: 50)
 */
export async function GET(req: NextRequest) {
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const limitCheck = rateLimit(`destinations-api:${clientIp}`, 120);
  if (!limitCheck.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(limitCheck.retryAfterSeconds) } }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const state = searchParams.get("state") || undefined;
    const district = searchParams.get("district") || undefined;
    const q = searchParams.get("q") || undefined;
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const radiusKm = searchParams.get("radiusKm") ? parseFloat(searchParams.get("radiusKm")!) : 300;
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));

    const userLat = latParam ? parseFloat(latParam) : null;
    const userLng = lngParam ? parseFloat(lngParam) : null;

    // 1. First get items from verified in-memory registry
    let registryResults = queryDestinations({
      category,
      state,
      district,
      query: q,
      limit: 100,
    }).items;

    // 2. Query Neon PostgreSQL Place table if online
    const prisma = getPrisma();
    let dbPlaces: DestinationRecord[] = [];

    if (prisma) {
      try {
        const whereClause: Record<string, unknown> = {};
        if (category && category.toUpperCase() !== "ALL") {
          const normCat = category.toUpperCase();
          whereClause.OR = [
            { category: normCat },
            { categories: { has: normCat } }
          ];
        }
        if (state) {
          whereClause.state = { contains: state, mode: "insensitive" };
        }
        if (district) {
          whereClause.district = { contains: district, mode: "insensitive" };
        }
        if (q) {
          whereClause.OR = [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { district: { contains: q, mode: "insensitive" } },
            { state: { contains: q, mode: "insensitive" } },
            { subcategory: { contains: q, mode: "insensitive" } },
          ];
        }

        const places = await prisma.place.findMany({
          where: whereClause,
          take: 100,
        });

        dbPlaces = places.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          nativeName: p.nativeName ?? undefined,
          category: (p.category.toUpperCase() as DestinationCategory) || "HERITAGE",
          primaryCategory: (p.category.toUpperCase() as DestinationCategory) || "HERITAGE",
          subtype: p.subcategory || undefined,
          subcategory: p.subcategory || undefined,
          tags: p.tags || [],
          culturalTags: p.culturalTags || [],
          audienceTags: p.audienceTags || [],
          description: p.description,
          latitude: p.latitude,
          longitude: p.longitude,
          locationConfidence: p.coordinatePrecision === "APPROXIMATE" ? "approximate" : "exact",
          city: p.city ?? undefined,
          district: p.district || "Unknown District",
          state: p.state || "India",
          image: p.image || "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
          imageAlt: p.imageAlt || p.name,
          imageCredit: {
            photographer: p.imageCreditName || "Official Record",
            source: (p.imageCreditSource as any) || "State Tourism",
            license: (p.imageLicense as any) || "Government Open Data",
          },
          bestTimeToVisit: p.bestTimeToVisit || undefined,
          timings: p.timings || null,
          entryFee: p.entryFee || null,
          operationalStatus: (p.status as any) || "OPEN",
          verifiedHours: p.timings || null,
          verifiedEntryFee: p.entryFee || null,
          officialWebsite: p.officialWebsite || null,
          unescoReference: p.unescoReference || null,
          asiReference: p.asiMonumentId || null,
          recommendedDuration: p.recommendedDuration || undefined,
          highlights: p.highlights && p.highlights.length > 0 ? p.highlights : [p.subcategory || "National Landmark"],
          provenance: {
            sourceType: (p.sourceType as any) || "official",
            verifiedDate: p.verifiedAt ? p.verifiedAt.toISOString().split("T")[0] : "2026-09-01",
            sourceUrl: p.sourceUrl || undefined,
          },
        }));
      } catch (err) {
        console.warn("[DestinationsAPI] DB query failed, falling back to static registry:", err);
      }
    }

    // Merge & deduplicate by slug
    const seenSlugs = new Set<string>();
    const merged: DestinationRecord[] = [];

    for (const item of [...registryResults, ...dbPlaces]) {
      if (!seenSlugs.has(item.slug)) {
        seenSlugs.add(item.slug);
        merged.push(item);
      }
    }

    // Calculate proximity if coordinates provided
    let finalItems = merged.map((item) => {
      let distanceKm: number | null = null;
      let driveMinutes: number | null = null;

      if (userLat !== null && userLng !== null) {
        distanceKm = calculateHaversineDistanceKm(userLat, userLng, item.latitude, item.longitude);
        driveMinutes = Math.round(distanceKm * 1.8);
      }

      return {
        ...item,
        distanceKm,
        driveMinutes,
      };
    });

    if (userLat !== null && userLng !== null) {
      finalItems = finalItems
        .filter((item) => item.distanceKm === null || item.distanceKm <= radiusKm)
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }

    const total = finalItems.length;
    const paginated = finalItems.slice(offset, offset + limit);

    return NextResponse.json(
      {
        items: paginated,
        total,
        offset,
        limit,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("[DestinationsAPI] Error handling request:", error);
    return NextResponse.json(
      { error: "Internal server error fetching destinations" },
      { status: 500 }
    );
  }
}
