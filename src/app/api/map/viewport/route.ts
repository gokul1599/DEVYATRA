import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db/client";
import { parseBoundingBox, isWithinIndiaBounds } from "@/lib/map/location-quality";
import { DestinationGeoJSONFeature, DestinationFeatureCollection } from "@/lib/map/geojson";
import { assessLocationQuality } from "@/lib/map/location-quality";
import { rateLimit } from "@/lib/rate-limit";
import { getTempleImage } from "@/lib/images/registry";
import { VERIFIED_DESTINATIONS } from "@/lib/destinations/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAP_RATE_LIMIT = 90; // 90 viewport queries per minute per IP

export async function GET(req: NextRequest) {
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous";

  const rateCheck = rateLimit(`map-viewport:${clientIp}`, MAP_RATE_LIMIT);
  if (!rateCheck.ok) {
    return NextResponse.json(
      { error: "Too many map requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSeconds) } }
    );
  }

  const { searchParams } = new URL(req.url);
  const bboxStr = searchParams.get("bbox");
  const category = searchParams.get("category")?.toUpperCase() || "ALL";
  const verifiedOnly = searchParams.get("verifiedOnly") === "true" || searchParams.get("verifiedOnly") === "1";
  const limit = Math.min(300, Math.max(10, parseInt(searchParams.get("limit") || "150", 10)));

  const bbox = parseBoundingBox(bboxStr);
  if (!bbox) {
    return NextResponse.json(
      { error: "Invalid bounding box format. Expected minLng,minLat,maxLng,maxLat" },
      { status: 400 }
    );
  }

  const prisma = getPrisma();
  const features: DestinationGeoJSONFeature[] = [];
  let exactCount = 0;
  let siteCenterCount = 0;
  let approximateCount = 0;

  try {
    // 1. Query Temples within bounding box if category includes sacred / all
    const shouldFetchTemples =
      category === "ALL" ||
      category === "TEMPLE" ||
      category === "SACRED" ||
      category === "PILGRIMAGE";

    if (prisma && shouldFetchTemples) {
      const temples = await prisma.temple.findMany({
        where: {
          isCentroidFallback: false, // Strict: Zero centroid fallbacks
          latitude: { gte: bbox.minLat, lte: bbox.maxLat },
          longitude: { gte: bbox.minLng, lte: bbox.maxLng },
          ...(verifiedOnly
            ? {
                OR: [
                  { verificationStatus: { in: ["VERIFIED_OFFICIAL", "VERIFIED_SOURCE"] } },
                  { sourceType: { in: ["official", "asi", "unesco", "devasthanam"] } },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          slug: true,
          name: true,
          nameLocal: true,
          mainDeity: true,
          latitude: true,
          longitude: true,
          address: true,
          stateCode: true,
          verificationStatus: true,
          sourceType: true,
          googlePlaceId: true,
          dataConfidence: true,
          images: true,
          district: { select: { name: true } },
          state: { select: { name: true, slug: true } },
          media: {
            where: {
              OR: [
                { isApproved: true },
                { verificationStatus: "VERIFIED" },
                { verificationStatus: "AUTO_APPROVED" },
              ],
            },
            take: 1,
            select: { publicUrl: true },
          },
        },
        take: limit,
      });

      for (const t of temples) {
        if (!isWithinIndiaBounds(t.latitude, t.longitude)) continue;

        const quality = assessLocationQuality({
          latitude: t.latitude,
          longitude: t.longitude,
          isCentroidFallback: false,
          verificationStatus: t.verificationStatus,
          sourceType: t.sourceType,
          googlePlaceId: t.googlePlaceId,
          dataConfidence: t.dataConfidence,
        });

        if (quality.accuracy === "EXACT") exactCount++;
        else if (quality.accuracy === "SITE_CENTER") siteCenterCount++;
        else approximateCount++;

        const stateSlug = t.state?.slug || "india";
        const imageRef =
          t.media?.[0]?.publicUrl ||
          getTempleImage(t.slug)?.src ||
          t.images?.[0] ||
          null;

        features.push({
          type: "Feature",
          id: t.id,
          geometry: {
            type: "Point",
            coordinates: [t.longitude, t.latitude],
          },
          properties: {
            id: t.id,
            name: t.name,
            slug: t.slug,
            category: "TEMPLE",
            subcategory: t.mainDeity || "Sanatan Shrine",
            mainDeity: t.mainDeity,
            address: t.address,
            city: t.district?.name || null,
            district: t.district?.name || null,
            state: t.state?.name || t.stateCode,
            stateCode: t.stateCode,
            latitude: t.latitude,
            longitude: t.longitude,
            accuracy: quality.accuracy,
            accuracyLabel: quality.accuracyLabel,
            accuracyDescription: quality.accuracyDescription,
            badgeVariant: quality.badgeVariant,
            qualityScore: quality.qualityScore,
            verificationStatus: t.verificationStatus,
            sourceType: t.sourceType,
            sourceName: "Official Temple Directory",
            isVerified: quality.accuracy === "EXACT" || quality.accuracy === "SITE_CENTER",
            openNow: null,
            distanceKm: null,
            googlePlaceId: t.googlePlaceId,
            href: `/temples/${stateSlug}/${t.slug}`,
            imageReference: imageRef,
          },
        });
      }
    }

    // 2. Query Canonical Places from Database with multi-category support
    if (prisma && (category !== "TEMPLE" && category !== "SACRED")) {
      const placesLimit = Math.max(50, limit - features.length);
      const normCat = category !== "ALL" ? category.toUpperCase() : null;

      const canonicalPlaces = await prisma.place.findMany({
        where: {
          latitude: { gte: bbox.minLat, lte: bbox.maxLat },
          longitude: { gte: bbox.minLng, lte: bbox.maxLng },
          ...(normCat
            ? {
                OR: [
                  { category: normCat },
                  { categories: { has: normCat } },
                ],
              }
            : {}),
          ...(verifiedOnly
            ? {
                verificationStatus: {
                  in: ["VERIFIED_OFFICIAL", "VERIFIED_SOURCE", "VERIFIED_INSTITUTIONAL"],
                },
              }
            : {}),
        },
        select: {
          id: true,
          slug: true,
          name: true,
          nativeName: true,
          category: true,
          subcategory: true,
          latitude: true,
          longitude: true,
          address: true,
          city: true,
          district: true,
          state: true,
          verificationStatus: true,
          provenanceTier: true,
          sourceType: true,
          sourceName: true,
          image: true,
        },
        take: placesLimit,
      });

      for (const p of canonicalPlaces) {
        if (!isWithinIndiaBounds(p.latitude, p.longitude)) continue;

        const quality = assessLocationQuality({
          latitude: p.latitude,
          longitude: p.longitude,
          isCentroidFallback: false,
          verificationStatus: p.verificationStatus,
          sourceType: p.sourceType,
          googlePlaceId: null,
        });

        if (quality.accuracy === "EXACT") exactCount++;
        else if (quality.accuracy === "SITE_CENTER") siteCenterCount++;
        else approximateCount++;

        features.push({
          type: "Feature",
          id: p.id,
          geometry: {
            type: "Point",
            coordinates: [p.longitude, p.latitude],
          },
          properties: {
            id: p.id,
            name: p.name,
            slug: p.slug,
            category: p.category.toUpperCase(),
            subcategory: p.subcategory,
            mainDeity: null,
            address: p.address,
            city: p.city,
            district: p.district,
            state: p.state,
            stateCode: null,
            latitude: p.latitude,
            longitude: p.longitude,
            accuracy: quality.accuracy,
            accuracyLabel: quality.accuracyLabel,
            accuracyDescription: quality.accuracyDescription,
            badgeVariant: quality.badgeVariant,
            qualityScore: quality.qualityScore,
            verificationStatus: p.verificationStatus,
            sourceType: p.sourceType,
            sourceName: p.sourceName || p.sourceType?.toUpperCase() || "Curated Heritage",
            isVerified: quality.accuracy === "EXACT" || quality.accuracy === "SITE_CENTER",
            openNow: null,
            distanceKm: null,
            googlePlaceId: null,
            href: `/places/${p.slug}`,
            imageReference: p.image,
          },
        });
      }
    }

    // 3. Include Static Verified Destinations within bounding box
    const seenIds = new Set(features.map((f) => f.properties.id || f.properties.slug));
    const matchingRegistryDestinations = VERIFIED_DESTINATIONS.filter((d) => {
      if (d.latitude < bbox.minLat || d.latitude > bbox.maxLat) return false;
      if (d.longitude < bbox.minLng || d.longitude > bbox.maxLng) return false;
      if (category !== "ALL" && d.category !== category) return false;
      return !seenIds.has(d.id) && !seenIds.has(d.slug);
    });

    for (const d of matchingRegistryDestinations) {
      features.push({
        type: "Feature",
        id: d.id,
        geometry: {
          type: "Point",
          coordinates: [d.longitude, d.latitude],
        },
        properties: {
          id: d.id,
          name: d.name,
          slug: d.slug,
          category: d.category,
          subcategory: d.subcategory,
          mainDeity: null,
          address: [d.city, d.district, d.state].filter(Boolean).join(", "),
          city: d.city || d.district,
          district: d.district,
          state: d.state,
          stateCode: null,
          latitude: d.latitude,
          longitude: d.longitude,
          accuracy: "EXACT",
          accuracyLabel: "Exact GPS Geodetic",
          accuracyDescription: "Directly verified against statutory records",
          badgeVariant: "gold",
          qualityScore: 95,
          verificationStatus: "VERIFIED_OFFICIAL",
          sourceType: d.provenance.sourceType,
          sourceName: d.provenance.sourceType.toUpperCase(),
          isVerified: true,
          openNow: null,
          distanceKm: null,
          googlePlaceId: null,
          href: `/places/${d.slug}`,
          imageReference: d.image,
        },
      });
      exactCount++;
    }

    const collection: DestinationFeatureCollection = {
      type: "FeatureCollection",
      features,
      metadata: {
        total: features.length,
        exactCount,
        siteCenterCount,
        approximateCount,
        centroidFallbackExcluded: 0,
      },
    };

    return NextResponse.json(collection, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("[MapViewportAPI] Error querying viewport:", error);
    return NextResponse.json({ error: "Failed to query map viewport" }, { status: 500 });
  }
}
