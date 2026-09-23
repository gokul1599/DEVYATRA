/**
 * DEVYATRA / TEMPLEORA — V2.3 CANONICAL DESTINATION SERVICE
 * 
 * Unifies sacred shrines, ASI heritage landmarks, nature reserves, and travel facilities
 * into a single canonical destination graph with strict provenance and grounded distances.
 */

import { getPrisma } from "@/lib/db/client";
import {
  type UnifiedDestination,
  type DestinationCategory,
  type ProvenanceTier,
  formatGroundedDistance,
} from "./unified";
import { calculateHaversineDistanceKm } from "@/lib/nearby/engine";

export interface DestinationQueryOptions {
  category?: DestinationCategory;
  maxRadiusKm?: number;
  limit?: number;
  includeNearbyTemples?: boolean;
}

export function mapSourceTypeToProvenanceTier(sourceType?: string | null): ProvenanceTier {
  if (!sourceType) return "CURATED_DB";
  const s = sourceType.toLowerCase();
  if (s.includes("asi") || s.includes("unesco") || s.includes("official") || s.includes("devasthanam")) {
    return "OFFICIAL_STATUTORY";
  }
  if (s.includes("tourism") || s.includes("government") || s.includes("lgd")) {
    return "GOVERNMENT_TOURISM";
  }
  if (s.includes("community")) {
    return "COMMUNITY_REPORTED";
  }
  if (s.includes("google") || s.includes("runtime")) {
    return "LIVE_PROVIDER";
  }
  return "CURATED_DB";
}

export function normalizeVerificationStatus(
  status?: string | null
): "VERIFIED_OFFICIAL" | "VERIFIED_SOURCE" | "COMMUNITY_VERIFIED" | "UNVERIFIED" {
  if (status === "VERIFIED_OFFICIAL" || status === "VERIFIED_SOURCE" || status === "COMMUNITY_VERIFIED") {
    return status;
  }
  return "UNVERIFIED";
}

/**
 * Get unified destination graph around a central coordinate/temple
 */
export async function getUnifiedDestinationsAround(
  centerLat: number,
  centerLng: number,
  currentTempleId?: string,
  options: DestinationQueryOptions = {}
): Promise<UnifiedDestination[]> {
  const prisma = getPrisma();
  if (!prisma) return [];

  const maxRadiusKm = options.maxRadiusKm || 50;
  const limit = options.limit || 30;
  const includeTemples = options.includeNearbyTemples ?? true;

  const destinations: UnifiedDestination[] = [];

  try {
    // 1. Fetch pre-linked nearby places if currentTempleId is provided
    if (currentTempleId) {
      const linked = await prisma.templeNearbyPlace.findMany({
        where: {
          templeId: currentTempleId,
        },
        include: {
          nearbyPlace: true,
        },
        orderBy: [{ priority: "asc" }, { distanceKm: "asc" }],
        take: limit,
      });

      for (const link of linked) {
        const p = link.nearbyPlace;
        const cat = (p.category as DestinationCategory) || "HERITAGE";
        if (options.category && options.category !== cat) continue;

        const airDist = calculateHaversineDistanceKm(centerLat, centerLng, p.latitude, p.longitude);
        const roadDist = link.distanceKm ?? airDist * 1.25;
        const driveMin = link.estimatedDriveMinutes ?? Math.round((roadDist / 35) * 60);

        destinations.push({
          id: p.id,
          slug: p.slug,
          name: p.name,
          nativeName: p.nativeName,
          category: cat,
          subcategory: p.subcategory,
          description: p.description,
          latitude: p.latitude,
          longitude: p.longitude,
          locality: p.address,
          city: p.city,
          district: p.district,
          state: p.state,
          country: p.country || "India",
          provenanceTier: mapSourceTypeToProvenanceTier(p.sourceType),
          sourceType: p.sourceType,
          sourceName: p.sourceType?.toUpperCase() || "Devyatra Curated Heritage",
          sourceUrl: p.sourceUrl,
          officialUrl: p.officialUrl,
          verificationStatus: normalizeVerificationStatus(p.verificationStatus),
          lastVerifiedAt: p.verifiedAt?.toISOString().split("T")[0] ?? null,
          isCentroidFallback: false,
          airDistanceKm: Number(airDist.toFixed(1)),
          roadDistanceKm: Number(roadDist.toFixed(1)),
          estimatedDriveMinutes: driveMin,
          estimatedWalkMinutes: link.estimatedWalkMinutes ?? Math.round((airDist / 4) * 60),
          displayDistance: formatGroundedDistance(airDist, roadDist, driveMin),
          editorialHighlight: `Linked Heritage (${formatGroundedDistance(airDist, roadDist, driveMin)})`,
          imageReference: p.imageReference,
          facilities: {
            parking: "UNKNOWN",
            wheelchairRamp: "UNKNOWN",
            elevator: "UNKNOWN",
            accessibleRestroom: "UNKNOWN",
            elderlyRestSeating: "UNKNOWN",
            drinkingWater: "UNKNOWN",
            cloakroom: "UNKNOWN",
            prasadam: "UNKNOWN",
          },
        });
      }
    }

    // 2. Fetch nearby temples from the official temple directory
    if (includeTemples && (!options.category || options.category === "TEMPLE" || options.category === "PILGRIMAGE")) {
      // Approximate bounding box filter for fast spatial lookup: 1 deg lat ~ 111km
      const degDelta = maxRadiusKm / 111.0;
      const nearbyTemples = await prisma.temple.findMany({
        where: {
          latitude: { gte: centerLat - degDelta, lte: centerLat + degDelta },
          longitude: { gte: centerLng - degDelta, lte: centerLng + degDelta },
          ...(currentTempleId ? { id: { not: currentTempleId } } : {}),
        },
        select: {
          id: true,
          slug: true,
          name: true,
          mainDeity: true,
          description: true,
          latitude: true,
          longitude: true,
          stateCode: true,
          address: true,
          verificationStatus: true,
          sourceType: true,
          sourceUrl: true,
          officialWebsite: true,
          lastVerifiedAt: true,
          isCentroidFallback: true,
          district: { select: { name: true } },
          state: { select: { name: true } },
        },
        take: 20,
      });

      for (const t of nearbyTemples) {
        const airDist = calculateHaversineDistanceKm(centerLat, centerLng, t.latitude, t.longitude);
        if (airDist > maxRadiusKm) continue;

        const roadDist = airDist * 1.25;
        const driveMin = Math.round((roadDist / 35) * 60);

        destinations.push({
          id: t.id,
          slug: t.slug,
          name: t.name,
          category: "TEMPLE",
          subcategory: t.mainDeity || "Sanatan Shrine",
          description: t.description || `Sacred pilgrimage shrine dedicated to ${t.mainDeity || "Lord"}.`,
          latitude: t.latitude,
          longitude: t.longitude,
          locality: t.address,
          city: t.district?.name || null,
          district: t.district?.name,
          state: t.state?.name || t.stateCode,
          country: "India",
          provenanceTier: mapSourceTypeToProvenanceTier(t.sourceType),
          sourceType: t.sourceType,
          sourceName: "Official Temple Registry",
          sourceUrl: t.sourceUrl,
          officialUrl: t.officialWebsite,
          verificationStatus: normalizeVerificationStatus(t.verificationStatus),
          lastVerifiedAt: t.lastVerifiedAt?.toISOString().split("T")[0] ?? null,
          isCentroidFallback: t.isCentroidFallback,
          airDistanceKm: Number(airDist.toFixed(1)),
          roadDistanceKm: Number(roadDist.toFixed(1)),
          estimatedDriveMinutes: driveMin,
          estimatedWalkMinutes: Math.round((airDist / 4) * 60),
          displayDistance: formatGroundedDistance(airDist, roadDist, driveMin),
          editorialHighlight: `Sacred Shrine · ${t.mainDeity || "Presiding Deity"}`,
          facilities: {
            parking: "UNKNOWN",
            wheelchairRamp: "UNKNOWN",
            elevator: "UNKNOWN",
            accessibleRestroom: "UNKNOWN",
            elderlyRestSeating: "UNKNOWN",
            drinkingWater: "UNKNOWN",
            cloakroom: "UNKNOWN",
            prasadam: "UNKNOWN",
          },
        });
      }
    }

    // Sort by air distance
    destinations.sort((a, b) => (a.airDistanceKm ?? 999) - (b.airDistanceKm ?? 999));

    return destinations.slice(0, limit);
  } catch (error) {
    console.error("[UnifiedDestinations] Error querying destinations:", error);
    return destinations;
  }
}
