import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db/client";
import { parseBoundingBox, isWithinIndiaBounds, INDIA_BOUNDS } from "@/lib/map/location-quality";
import { DestinationGeoJSONFeature, DestinationFeatureCollection } from "@/lib/map/geojson";
import { assessLocationQuality } from "@/lib/map/location-quality";
import { rateLimit } from "@/lib/rate-limit";
import { getTempleImage } from "@/lib/images/registry";
import { VERIFIED_DESTINATIONS } from "@/lib/destinations/registry";
import { normalizeCategory } from "@/lib/destinations/categories";
import { TEMPLES } from "@/lib/data/temples";
import { getState } from "@/lib/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAP_RATE_LIMIT = 120; // 120 viewport queries per minute per IP

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
  const rawCategory = searchParams.get("category")?.toUpperCase() || "ALL";
  const verifiedOnly = searchParams.get("verifiedOnly") === "true" || searchParams.get("verifiedOnly") === "1";
  const limit = Math.min(300, Math.max(10, parseInt(searchParams.get("limit") || "150", 10)));

  const stateFilter = searchParams.get("state")?.trim() || null;
  const districtFilter = searchParams.get("district")?.trim() || null;
  const cityFilter = searchParams.get("city")?.trim() || null;
  const qFilter = searchParams.get("q")?.trim() || null;

  const isAllIndia = searchParams.get("allIndia") === "true" || searchParams.get("scope") === "all";
  const isBboxScope = searchParams.get("scope") === "bbox";
  const hasFilter = Boolean(stateFilter || districtFilter || cityFilter || qFilter);
  let bbox = (isAllIndia || (hasFilter && !isBboxScope) || (rawCategory !== "ALL" && !isBboxScope))
    ? INDIA_BOUNDS
    : parseBoundingBox(bboxStr);

  if (!bbox) {
    if (hasFilter || rawCategory !== "ALL" || isAllIndia) {
      bbox = INDIA_BOUNDS;
    } else {
      return NextResponse.json(
        { error: "Invalid bounding box format. Expected minLng,minLat,maxLng,maxLat" },
        { status: 400 }
      );
    }
  }

  const prisma = getPrisma();
  const features: DestinationGeoJSONFeature[] = [];
  let exactCount = 0;
  let siteCenterCount = 0;
  let approximateCount = 0;

  const isSacredCategory =
    rawCategory === "ALL" ||
    rawCategory === "TEMPLE" ||
    rawCategory === "SACRED" ||
    rawCategory === "PILGRIMAGE";

  const normCat = rawCategory !== "ALL" ? normalizeCategory(rawCategory) : null;

  try {
    // 1. Query Temples within bounding box if category includes sacred / all
    if (prisma && isSacredCategory) {
      const templeWhere: Record<string, unknown> = {
        isCentroidFallback: false, // Strict: Zero centroid fallbacks
        latitude: { gte: bbox.minLat, lte: bbox.maxLat },
        longitude: { gte: bbox.minLng, lte: bbox.maxLng },
      };

      const templeConditions: Array<Record<string, unknown>> = [];

      if (districtFilter) {
        templeConditions.push({
          OR: [
            { district: { name: { contains: districtFilter, mode: "insensitive" } } },
            { address: { contains: districtFilter, mode: "insensitive" } },
          ],
        });
      }
      if (stateFilter) {
        templeConditions.push({
          state: { name: { contains: stateFilter, mode: "insensitive" } },
        });
      }
      if (cityFilter) {
        templeConditions.push({
          OR: [
            { address: { contains: cityFilter, mode: "insensitive" } },
            { district: { name: { contains: cityFilter, mode: "insensitive" } } },
            { adminUnit: { name: { contains: cityFilter, mode: "insensitive" } } },
            { locality: { name: { contains: cityFilter, mode: "insensitive" } } },
            { name: { contains: cityFilter, mode: "insensitive" } },
          ],
        });
      }
      if (qFilter) {
        templeConditions.push({
          OR: [
            { name: { contains: qFilter, mode: "insensitive" } },
            { nameLocal: { contains: qFilter, mode: "insensitive" } },
            { mainDeity: { contains: qFilter, mode: "insensitive" } },
            { address: { contains: qFilter, mode: "insensitive" } },
            { district: { name: { contains: qFilter, mode: "insensitive" } } },
            { adminUnit: { name: { contains: qFilter, mode: "insensitive" } } },
            { locality: { name: { contains: qFilter, mode: "insensitive" } } },
          ],
        });
      }

      if (verifiedOnly) {
        templeConditions.push({
          OR: [
            { verificationStatus: { in: ["VERIFIED_OFFICIAL", "VERIFIED_SOURCE"] } },
            { sourceType: { in: ["official", "asi", "unesco", "devasthanam"] } },
          ],
        });
      }

      if (templeConditions.length > 0) {
        templeWhere.AND = templeConditions;
      }

      const temples = await prisma.temple.findMany({
        where: templeWhere,
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
          adminUnit: { select: { name: true } },
          locality: { select: { name: true } },
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

        const matchesLoc = (text: string | null | undefined) => {
          if (!text) return false;
          const lower = text.toLowerCase();
          if (cityFilter && lower.includes(cityFilter.toLowerCase())) return true;
          if (districtFilter && lower.includes(districtFilter.toLowerCase())) return true;
          if (stateFilter && lower.includes(stateFilter.toLowerCase())) return true;
          if (qFilter && lower.includes(qFilter.toLowerCase())) return true;
          return false;
        };

        const isInside = Boolean(
          matchesLoc(t.name) ||
          matchesLoc(t.nameLocal) ||
          matchesLoc(t.address) ||
          matchesLoc(t.district?.name) ||
          matchesLoc(t.locality?.name) ||
          matchesLoc(t.adminUnit?.name) ||
          matchesLoc(t.state?.name) ||
          (stateFilter && t.stateCode.toLowerCase() === stateFilter.toLowerCase())
        );

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
            category: "SACRED",
            subcategory: t.mainDeity || "Sanatan Shrine",
            mainDeity: t.mainDeity,
            address: t.address,
            city: t.locality?.name || t.adminUnit?.name || t.district?.name || null,
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
            isInside,
            openNow: null,
            distanceKm: null,
            googlePlaceId: t.googlePlaceId,
            href: `/temples/${stateSlug}/${t.slug}`,
            imageReference: imageRef,
          },
        });
      }
    }

    // 2. Query Canonical Places from Database with multi-category & location support
    if (prisma && rawCategory !== "TEMPLE") {
      const placesLimit = Math.max(50, limit - features.length);
      const placeWhere: Record<string, unknown> = {
        latitude: { gte: bbox.minLat, lte: bbox.maxLat },
        longitude: { gte: bbox.minLng, lte: bbox.maxLng },
      };

      if (normCat && normCat !== "SACRED") {
        placeWhere.OR = [
          { category: normCat },
          { categories: { has: normCat } },
        ];
      } else if (normCat === "SACRED") {
        placeWhere.OR = [
          { category: "SACRED" },
          { categories: { has: "SACRED" } },
        ];
      }

      const placeConditions: Array<Record<string, unknown>> = [];

      if (districtFilter) {
        placeConditions.push({
          OR: [
            { district: { contains: districtFilter, mode: "insensitive" } },
            { address: { contains: districtFilter, mode: "insensitive" } },
          ],
        });
      }
      if (stateFilter) {
        placeConditions.push({
          state: { contains: stateFilter, mode: "insensitive" },
        });
      }
      if (cityFilter) {
        placeConditions.push({
          OR: [
            { city: { contains: cityFilter, mode: "insensitive" } },
            { district: { contains: cityFilter, mode: "insensitive" } },
            { address: { contains: cityFilter, mode: "insensitive" } },
            { name: { contains: cityFilter, mode: "insensitive" } },
          ],
        });
      }
      if (qFilter) {
        placeConditions.push({
          OR: [
            { name: { contains: qFilter, mode: "insensitive" } },
            { nativeName: { contains: qFilter, mode: "insensitive" } },
            { subcategory: { contains: qFilter, mode: "insensitive" } },
            { description: { contains: qFilter, mode: "insensitive" } },
            { city: { contains: qFilter, mode: "insensitive" } },
            { district: { contains: qFilter, mode: "insensitive" } },
            { address: { contains: qFilter, mode: "insensitive" } },
          ],
        });
      }

      if (placeConditions.length > 0) {
        placeWhere.AND = placeConditions;
      }
      if (verifiedOnly) {
        placeWhere.verificationStatus = {
          in: ["VERIFIED_OFFICIAL", "VERIFIED_SOURCE", "VERIFIED_INSTITUTIONAL"],
        };
      }

      const canonicalPlaces = await prisma.place.findMany({
        where: placeWhere,
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

        const matchesPlaceLoc = (text: string | null | undefined) => {
          if (!text) return false;
          const lower = text.toLowerCase();
          if (cityFilter && lower.includes(cityFilter.toLowerCase())) return true;
          if (districtFilter && lower.includes(districtFilter.toLowerCase())) return true;
          if (stateFilter && lower.includes(stateFilter.toLowerCase())) return true;
          if (qFilter && lower.includes(qFilter.toLowerCase())) return true;
          return false;
        };

        const isInside = Boolean(
          matchesPlaceLoc(p.name) ||
          matchesPlaceLoc(p.nativeName) ||
          matchesPlaceLoc(p.city) ||
          matchesPlaceLoc(p.district) ||
          matchesPlaceLoc(p.state) ||
          matchesPlaceLoc(p.address)
        );

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
            sourceName: p.sourceName || p.sourceType?.toUpperCase() || "Authoritative Statutory",
            isVerified: quality.accuracy === "EXACT" || quality.accuracy === "SITE_CENTER",
            isInside,
            openNow: null,
            distanceKm: null,
            googlePlaceId: null,
            href: `/places/${p.slug}`,
            imageReference: p.image,
          },
        });
      }
    }

    // 3. Include Static Verified Destinations within bounding box & filter criteria
    const seenIds = new Set(features.map((f) => f.properties.id || f.properties.slug));
    const matchingRegistryDestinations = VERIFIED_DESTINATIONS.filter((d) => {
      if (isBboxScope && bbox) {
        if (d.latitude < bbox.minLat || d.latitude > bbox.maxLat) return false;
        if (d.longitude < bbox.minLng || d.longitude > bbox.maxLng) return false;
      }
      if (normCat && normalizeCategory(d.category) !== normCat) return false;
      if (districtFilter && !d.district.toLowerCase().includes(districtFilter.toLowerCase())) return false;
      if (stateFilter && !d.state.toLowerCase().includes(stateFilter.toLowerCase())) return false;
      if (cityFilter) {
        const cLower = cityFilter.toLowerCase();
        const matchesCity =
          (d.city && d.city.toLowerCase().includes(cLower)) ||
          d.district.toLowerCase().includes(cLower) ||
          d.name.toLowerCase().includes(cLower);
        if (!matchesCity) return false;
      }
      if (qFilter) {
        const qLower = qFilter.toLowerCase();
        const matchesQ =
          d.name.toLowerCase().includes(qLower) ||
          (d.city && d.city.toLowerCase().includes(qLower)) ||
          d.district.toLowerCase().includes(qLower) ||
          d.state.toLowerCase().includes(qLower) ||
          (d.subcategory && d.subcategory.toLowerCase().includes(qLower));
        if (!matchesQ) return false;
      }
      return !seenIds.has(d.id) && !seenIds.has(d.slug);
    });

    for (const d of matchingRegistryDestinations) {
      const isInside = Boolean(
        (cityFilter && (
          (d.city && d.city.toLowerCase().includes(cityFilter.toLowerCase())) ||
          d.district.toLowerCase().includes(cityFilter.toLowerCase()) ||
          d.name.toLowerCase().includes(cityFilter.toLowerCase())
        )) ||
        (districtFilter && (
          d.district.toLowerCase().includes(districtFilter.toLowerCase()) ||
          (d.city && d.city.toLowerCase().includes(districtFilter.toLowerCase()))
        )) ||
        (stateFilter && d.state.toLowerCase().includes(stateFilter.toLowerCase())) ||
        (qFilter && (
          d.name.toLowerCase().includes(qFilter.toLowerCase()) ||
          (d.city && d.city.toLowerCase().includes(qFilter.toLowerCase())) ||
          d.district.toLowerCase().includes(qFilter.toLowerCase())
        ))
      );

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
          category: normalizeCategory(d.category),
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
          isInside,
          openNow: null,
          distanceKm: null,
          googlePlaceId: null,
          href: `/places/${d.slug}`,
          imageReference: d.image,
        },
      });
      exactCount++;
    }

    // 4. Include Static Temples Catalog if category includes sacred / all
    if (isSacredCategory) {
      const matchingStaticTemples = TEMPLES.filter((t) => {
        if (!isWithinIndiaBounds(t.latitude, t.longitude)) return false;
        if (isBboxScope && bbox) {
          if (t.latitude < bbox.minLat || t.latitude > bbox.maxLat) return false;
          if (t.longitude < bbox.minLng || t.longitude > bbox.maxLng) return false;
        }
        if (stateFilter) {
          const st = getState(t.stateCode);
          const stateMatch =
            t.stateCode.toLowerCase() === stateFilter.toLowerCase() ||
            Boolean(st && st.name.toLowerCase().includes(stateFilter.toLowerCase()));
          if (!stateMatch) return false;
        }
        if (districtFilter && !t.district.toLowerCase().includes(districtFilter.toLowerCase())) {
          return false;
        }
        if (cityFilter) {
          const cLower = cityFilter.toLowerCase();
          const matchesCity =
            Boolean(t.location && t.location.toLowerCase().includes(cLower)) ||
            t.district.toLowerCase().includes(cLower) ||
            t.name.toLowerCase().includes(cLower);
          if (!matchesCity) return false;
        }
        if (qFilter) {
          const qLower = qFilter.toLowerCase();
          const matchesQ =
            t.name.toLowerCase().includes(qLower) ||
            Boolean(t.location && t.location.toLowerCase().includes(qLower)) ||
            t.district.toLowerCase().includes(qLower) ||
            Boolean(t.mainDeity && t.mainDeity.toLowerCase().includes(qLower));
          if (!matchesQ) return false;
        }
        return !seenIds.has(t.id) && !seenIds.has(t.slug);
      });

      for (const t of matchingStaticTemples) {
        seenIds.add(t.id);
        seenIds.add(t.slug);
        const st = getState(t.stateCode);
        const stateSlug = st?.slug || t.stateCode.toLowerCase();
        const isInside = Boolean(
          (cityFilter && (
            Boolean(t.location && t.location.toLowerCase().includes(cityFilter.toLowerCase())) ||
            t.district.toLowerCase().includes(cityFilter.toLowerCase()) ||
            t.name.toLowerCase().includes(cityFilter.toLowerCase())
          )) ||
          (districtFilter && (
            t.district.toLowerCase().includes(districtFilter.toLowerCase()) ||
            Boolean(t.location && t.location.toLowerCase().includes(districtFilter.toLowerCase()))
          )) ||
          (stateFilter && (
            t.stateCode.toLowerCase() === stateFilter.toLowerCase() ||
            Boolean(st && st.name.toLowerCase().includes(stateFilter.toLowerCase()))
          )) ||
          (qFilter && (
            t.name.toLowerCase().includes(qFilter.toLowerCase()) ||
            Boolean(t.location && t.location.toLowerCase().includes(qFilter.toLowerCase())) ||
            t.district.toLowerCase().includes(qFilter.toLowerCase())
          ))
        );

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
            category: "SACRED",
            subcategory: t.mainDeity || "Sanatan Shrine",
            mainDeity: t.mainDeity,
            address: t.location,
            city: t.location,
            district: t.district,
            state: st?.name || t.stateCode,
            stateCode: t.stateCode,
            latitude: t.latitude,
            longitude: t.longitude,
            accuracy: "EXACT",
            accuracyLabel: "Exact Coordinates",
            accuracyDescription: "Verified temple geodetic coordinates",
            badgeVariant: "gold",
            qualityScore: 95,
            verificationStatus: "VERIFIED_OFFICIAL",
            sourceType: "official",
            sourceName: "Templeora Sacred Catalog",
            isVerified: true,
            isInside,
            openNow: null,
            distanceKm: null,
            googlePlaceId: null,
            href: `/temples/${stateSlug}/${t.slug}`,
            imageReference: t.images?.[0] || getTempleImage(t.slug)?.src || null,
          },
        });
        exactCount++;
      }
    }

    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;

    for (const f of features) {
      const [lng, lat] = f.geometry.coordinates;
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
    }

    const featureBbox =
      features.length > 0
        ? ([minLng, minLat, maxLng, maxLat] as [number, number, number, number])
        : null;

    const collection: DestinationFeatureCollection = {
      type: "FeatureCollection",
      features,
      metadata: {
        total: features.length,
        exactCount,
        siteCenterCount,
        approximateCount,
        centroidFallbackExcluded: 0,
        bbox: featureBbox,
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
