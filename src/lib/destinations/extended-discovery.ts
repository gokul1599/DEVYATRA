/**
 * DEVYATRA / TEMPLEORA — V2.4 EXTENDED 300 KM REGIONAL DISCOVERY ENGINE
 * 
 * Product Principle:
 * REAL GEOGRAPHY -> REAL LOCATIONS -> VERIFIED DESTINATIONS -> INTELLIGENT JOURNEYS
 * 
 * Server-side data querying over Neon PostgreSQL / Prisma.
 */

import { getPrisma } from "@/lib/db/client";
import {
  calculateHaversineKm,
  isValidCoordinate,
  isWithinIndiaBounds,
} from "@/lib/map/location-quality";
import {
  DISTANCE_BANDS,
  type DistanceBandId,
  type DistanceBandConfig,
  type SignificanceTier,
  type TravelStyle,
  type VisitDuration,
  type ExtendedDiscoveryItem,
  type ExtendedDiscoveryOptions,
  type ExtendedDiscoveryResult,
  getDistanceBand,
  estimateRoadMetrics,
  classifySignificance,
  inferTravelStyles,
  estimateVisitDuration,
  formatGroundedDistance,
} from "./extended-types";
import { getTempleImage } from "@/lib/images/registry";

export {
  DISTANCE_BANDS,
  type DistanceBandId,
  type DistanceBandConfig,
  type SignificanceTier,
  type TravelStyle,
  type VisitDuration,
  type ExtendedDiscoveryItem,
  type ExtendedDiscoveryOptions,
  type ExtendedDiscoveryResult,
  getDistanceBand,
  estimateRoadMetrics,
  classifySignificance,
  inferTravelStyles,
  estimateVisitDuration,
  formatGroundedDistance,
};

/**
 * Query the extended 300 km regional discovery graph around any coordinate/anchor
 */
export async function getExtendedDiscoveryAround(
  centerLat: number,
  centerLng: number,
  options: ExtendedDiscoveryOptions = {}
): Promise<ExtendedDiscoveryResult> {
  const maxRadiusKm = Math.min(300, Math.max(10, options.radiusKm ?? 300));
  const limit = options.limit ?? 100;
  const prisma = getPrisma();

  if (!isValidCoordinate(centerLat, centerLng) || !isWithinIndiaBounds(centerLat, centerLng)) {
    return {
      anchor: { latitude: centerLat, longitude: centerLng },
      totalCount: 0,
      bands: Object.values(DISTANCE_BANDS).map((b) => ({ band: b, count: 0, items: [] })),
      allFiltered: [],
    };
  }

  if (!prisma) {
    return {
      anchor: { latitude: centerLat, longitude: centerLng },
      totalCount: 0,
      bands: Object.values(DISTANCE_BANDS).map((b) => ({ band: b, count: 0, items: [] })),
      allFiltered: [],
    };
  }

  const items: ExtendedDiscoveryItem[] = [];

  try {
    // Spatial bounding box: 1 deg lat ~ 111 km, lng delta adjusted for latitude
    const latDelta = maxRadiusKm / 111.0;
    const cosLat = Math.cos((centerLat * Math.PI) / 180);
    const lngDelta = maxRadiusKm / (111.0 * Math.max(0.2, Math.abs(cosLat)));

    // 1. Fetch Shrines & Temples within spatial envelope
    const temples = await prisma.temple.findMany({
      where: {
        latitude: { gte: centerLat - latDelta, lte: centerLat + latDelta },
        longitude: { gte: centerLng - lngDelta, lte: centerLng + lngDelta },
        isCentroidFallback: false,
        ...(options.excludeId ? { id: { not: options.excludeId } } : {}),
      },
      select: {
        id: true,
        slug: true,
        name: true,
        nameLocal: true,
        mainDeity: true,
        description: true,
        latitude: true,
        longitude: true,
        badges: true,
        architecture: true,
        asiMonumentId: true,
        verificationStatus: true,
        sourceType: true,
        isCentroidFallback: true,
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
      take: 250,
    });

    for (const t of temples) {
      if (!isValidCoordinate(t.latitude, t.longitude) || !isWithinIndiaBounds(t.latitude, t.longitude)) {
        continue;
      }
      const airKm = calculateHaversineKm(centerLat, centerLng, t.latitude, t.longitude);
      if (airKm > maxRadiusKm) continue;

      const { roadKm, driveMin } = estimateRoadMetrics(airKm);
      const band = getDistanceBand(airKm);
      const { tier: significance, label: sigLabel } = classifySignificance({
        name: t.name,
        description: t.description,
        badges: t.badges,
        mainDeity: t.mainDeity,
        architecture: t.architecture,
        asiMonumentId: t.asiMonumentId,
        category: "TEMPLE",
      });

      const travelStyles = inferTravelStyles(airKm, driveMin, significance, "TEMPLE");
      const { duration, label: durLabel } = estimateVisitDuration(airKm, significance, "TEMPLE");

      const stateSlug = t.state?.slug || "india";
      const internalUrl = `/temples/${stateSlug}/${t.slug}`;
      const googleMaps = `https://www.google.com/maps/dir/?api=1&destination=${t.latitude},${t.longitude}`;
      const appleMaps = `https://maps.apple.com/?daddr=${t.latitude},${t.longitude}&dirflg=d`;

      items.push({
        id: t.id,
        slug: t.slug,
        name: t.name,
        nativeName: t.nameLocal,
        category: "TEMPLE",
        subcategory: t.mainDeity || "Sanatan Sanctum",
        description: t.description || `Sacred pilgrimage shrine in ${t.district?.name || "India"} dedicated to ${t.mainDeity || "presiding deity"}.`,
        latitude: t.latitude,
        longitude: t.longitude,
        locality: t.district?.name,
        district: t.district?.name,
        state: t.state?.name,
        airDistanceKm: Number(airKm.toFixed(1)),
        roadDistanceKm: roadKm,
        estimatedDriveMinutes: driveMin,
        displayDistance: formatGroundedDistance(airKm, roadKm, driveMin),
        distanceBand: band,
        significance,
        significanceLabel: sigLabel,
        travelStyles,
        duration,
        durationLabel: durLabel,
        provenanceTier: t.sourceType || "CURATED_DB",
        verificationStatus: t.verificationStatus || "VERIFIED_SOURCE",
        isCentroidFallback: false,
        editorialHighlight: `${sigLabel} · ${durLabel}`,
        imageReference: t.media?.[0]?.publicUrl || getTempleImage(t.slug)?.src || t.images?.[0] || null,
        navLinks: {
          googleMaps,
          appleMaps,
          internalUrl,
        },
      });
    }

    // 2. Fetch Famous Places (ASI Monuments, Heritage, Nature, Culture)
    try {
      const places = await prisma.famousPlace.findMany({
        where: {
          latitude: { gte: centerLat - latDelta, lte: centerLat + latDelta },
          longitude: { gte: centerLng - lngDelta, lte: centerLng + lngDelta },
          ...(options.excludeId ? { id: { not: options.excludeId } } : {}),
        },
        take: 100,
      });

      for (const p of places) {
        if (!isValidCoordinate(p.latitude, p.longitude) || !isWithinIndiaBounds(p.latitude, p.longitude)) {
          continue;
        }
        const airKm = calculateHaversineKm(centerLat, centerLng, p.latitude, p.longitude);
        if (airKm > maxRadiusKm) continue;

        const { roadKm, driveMin } = estimateRoadMetrics(airKm);
        const band = getDistanceBand(airKm);
        const cat = (p.category as ExtendedDiscoveryItem["category"]) || "HERITAGE";
        const { tier: significance, label: sigLabel } = classifySignificance({
          name: p.name,
          description: p.description,
          category: cat,
        });

        const travelStyles = inferTravelStyles(airKm, driveMin, significance, cat);
        const { duration, label: durLabel } = estimateVisitDuration(airKm, significance, cat);

        const googleMaps = `https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`;
        const appleMaps = `https://maps.apple.com/?daddr=${p.latitude},${p.longitude}&dirflg=d`;

        items.push({
          id: p.id,
          slug: p.slug,
          name: p.name,
          nativeName: p.nativeName,
          category: cat,
          subcategory: p.subcategory,
          description: p.description,
          latitude: p.latitude,
          longitude: p.longitude,
          locality: p.address || p.city,
          district: p.district,
          state: p.state,
          airDistanceKm: Number(airKm.toFixed(1)),
          roadDistanceKm: roadKm,
          estimatedDriveMinutes: driveMin,
          displayDistance: formatGroundedDistance(airKm, roadKm, driveMin),
          distanceBand: band,
          significance,
          significanceLabel: sigLabel,
          travelStyles,
          duration,
          durationLabel: durLabel,
          provenanceTier: p.sourceType || "CURATED_DB",
          verificationStatus: p.verificationStatus || "VERIFIED_SOURCE",
          isCentroidFallback: false,
          editorialHighlight: `${sigLabel} · ${durLabel}`,
          imageReference: p.imageReference,
          navLinks: {
            googleMaps,
            appleMaps,
            internalUrl: `/map?lat=${p.latitude}&lng=${p.longitude}&zoom=14`,
          },
        });
      }
    } catch {
      // Graceful fallback if FamousPlace table is empty or unavailable
    }

    // Sort items by air distance ascending
    items.sort((a, b) => a.airDistanceKm - b.airDistanceKm);

    // Apply filters
    let filtered = items;

    if (options.distanceBand) {
      filtered = filtered.filter((i) => i.distanceBand === options.distanceBand);
    }

    if (options.categories && options.categories.length > 0 && !options.categories.includes("ALL")) {
      const cats = new Set(options.categories.map((c) => c.toUpperCase()));
      filtered = filtered.filter((i) => cats.has(i.category.toUpperCase()));
    }

    if (options.significance) {
      filtered = filtered.filter((i) => i.significance === options.significance);
    }

    if (options.travelStyle) {
      filtered = filtered.filter((i) => i.travelStyles.includes(options.travelStyle!));
    }

    if (options.duration) {
      filtered = filtered.filter((i) => i.duration === options.duration);
    }

    // Cap at limit
    const cappedFiltered = filtered.slice(0, limit);

    // Group into 4 distance bands
    const bandResults = Object.values(DISTANCE_BANDS).map((bConfig) => {
      const bandItems = items.filter((i) => i.distanceBand === bConfig.id);
      return {
        band: bConfig,
        count: bandItems.length,
        items: bandItems.slice(0, 25),
      };
    });

    return {
      anchor: { latitude: centerLat, longitude: centerLng },
      totalCount: items.length,
      bands: bandResults,
      allFiltered: cappedFiltered,
    };
  } catch (error) {
    console.error("[ExtendedDiscovery] Query failure:", error);
    return {
      anchor: { latitude: centerLat, longitude: centerLng },
      totalCount: 0,
      bands: Object.values(DISTANCE_BANDS).map((b) => ({ band: b, count: 0, items: [] })),
      allFiltered: [],
    };
  }
}
