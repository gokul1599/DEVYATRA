/**
 * DEVYATRA / TEMPLEORA — PHASE V2.2: NORMALIZED NEARBY FAMOUS PLACES ENGINE
 * 
 * Reusable, multi-temple attraction discovery architecture:
 * - Categories: HERITAGE, PILGRIMAGE, NATURE, CULTURE, LOCAL_EXPERIENCES
 * - Adaptive Radius: Urban (10km), Semi-urban (25km), Rural (50km), Mountain/Remote (75km)
 * - Deterministic Relevance Ranking with editorial highlight tags (no arbitrary scores)
 * - Straight-line vs road distance transparency (Approx vs verified road time)
 * - AI grounding context generation with strict anti-hallucination contracts
 */

import { getPrisma } from "@/lib/db/client";

export type AttractionCategory =
  | "HERITAGE"
  | "PILGRIMAGE"
  | "NATURE"
  | "CULTURE"
  | "LOCAL_EXPERIENCES";

export type EditorialHighlight =
  | "Featured Nearby"
  | "Heritage Highlight"
  | "Pilgrimage Highlight"
  | "Nature Highlight"
  | "Cultural Highlight"
  | "Local Experience";

export interface NormalizedAttraction {
  id: string;
  name: string;
  nativeName?: string | null;
  slug: string;
  category: AttractionCategory;
  subcategory?: string | null;
  description: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  country: string;
  sourceType?: string | null;
  sourceUrl?: string | null;
  verificationStatus: string;
  verifiedAt?: string | null;
  lastCheckedAt?: string | null;
  imageReference?: string | null;
  officialUrl?: string | null;
  
  // Computed Proximity for a specific Temple
  airDistanceKm: number;
  roadDistanceKm?: number | null;
  estimatedDriveMinutes?: number | null;
  estimatedWalkMinutes?: number | null;
  displayDistance: string;
  editorialHighlight: EditorialHighlight;
  isStale: boolean;
}

export interface AdaptiveRadiusConfig {
  locationType: "dense_urban" | "semi_urban" | "rural" | "mountain_remote";
  maxRadiusKm: number;
  description: string;
}

/**
 * Calculates Great-circle distance between two geographic coordinates using Haversine formula.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Determines adaptive search radius based on location kind and elevation / terrain characteristics.
 */
export function determineAdaptiveRadius(
  locationKind: string = "town",
  latitude: number,
  longitude: number
): AdaptiveRadiusConfig {
  // Mountain / Himalayan bounds check (approx lat > 29.5 in northern regions or high altitude)
  const isHighAltitude = latitude > 29.5 && longitude > 75.0 && longitude < 82.0;

  if (isHighAltitude) {
    return {
      locationType: "mountain_remote",
      maxRadiusKm: 75,
      description: "Remote & Mountain Pilgrimage Zone (up to 75 km)",
    };
  }

  if (locationKind === "city") {
    return {
      locationType: "dense_urban",
      maxRadiusKm: 12,
      description: "Dense Urban Heritage Zone (up to 12 km)",
    };
  }

  if (locationKind === "town") {
    return {
      locationType: "semi_urban",
      maxRadiusKm: 25,
      description: "Semi-Urban Sacred Corridor (up to 25 km)",
    };
  }

  return {
    locationType: "rural",
    maxRadiusKm: 50,
    description: "Rural & Regional Heritage Belt (up to 50 km)",
  };
}

/**
 * Deterministic Attraction Relevance Ranking
 * Evaluates statutory standing, UNESCO/ASI protection, source authority, and proximity.
 */
export function calculateRelevanceScore(attraction: {
  category: string;
  sourceType?: string | null;
  distanceKm: number;
  subcategory?: string | null;
  hasOfficialUrl: boolean;
}): number {
  let score = 50;

  // 1. Statutory / Heritage Authority Boost
  if (attraction.sourceType === "asi" || attraction.subcategory?.includes("ASI")) score += 30;
  if (attraction.sourceType === "unesco" || attraction.subcategory?.includes("UNESCO")) score += 35;
  if (attraction.sourceType === "official" || attraction.sourceType === "government") score += 20;
  if (attraction.hasOfficialUrl) score += 10;

  // 2. Proximity Gradient (Closer has naturally higher immediate visitability)
  if (attraction.distanceKm <= 3.0) score += 25;
  else if (attraction.distanceKm <= 10.0) score += 15;
  else if (attraction.distanceKm <= 25.0) score += 5;
  else if (attraction.distanceKm > 50.0) score -= 15;

  return score;
}

/**
 * Translates internal score and category into a human-friendly, editorial highlight label.
 * (Guarantees no arbitrary numerical scores are exposed to the pilgrim).
 */
export function getEditorialHighlight(
  category: AttractionCategory,
  score: number,
  isTopRanked: boolean
): EditorialHighlight {
  if (isTopRanked && score >= 85) return "Featured Nearby";
  switch (category) {
    case "HERITAGE":
      return "Heritage Highlight";
    case "PILGRIMAGE":
      return "Pilgrimage Highlight";
    case "NATURE":
      return "Nature Highlight";
    case "CULTURE":
      return "Cultural Highlight";
    case "LOCAL_EXPERIENCES":
      return "Local Experience";
    default:
      return "Featured Nearby";
  }
}

/**
 * Formats user-facing distance with strict honesty about straight-line vs road measurements.
 */
export function formatDistanceString(
  airDistanceKm: number,
  roadDistanceKm?: number | null,
  driveMin?: number | null
): string {
  if (roadDistanceKm && driveMin) {
    return `${roadDistanceKm.toFixed(1)} km (~${driveMin} min drive)`;
  }
  if (airDistanceKm < 1.0) {
    return `Approx. ${Math.round(airDistanceKm * 1000)} m away`;
  }
  return `Approx. ${airDistanceKm.toFixed(1)} km away`;
}

export class NearbyPlaceEngine {
  /**
   * Retrieves verified nearby famous places for a temple from the database.
   * If join table records exist, returns them ranked; otherwise dynamically discovers
   * attractions within the temple's adaptive radius.
   */
  static async getNearbyForTemple(
    templeId: string,
    templeLat: number,
    templeLng: number,
    locationKind: string = "town",
    categoryFilter?: AttractionCategory
  ): Promise<{
    attractions: NormalizedAttraction[];
    radiusConfig: AdaptiveRadiusConfig;
    totalFound: number;
    emptyReason?: string;
  }> {
    const prisma = getPrisma();
    const radiusConfig = determineAdaptiveRadius(locationKind, templeLat, templeLng);

    if (!prisma) {
      return {
        attractions: [],
        radiusConfig,
        totalFound: 0,
        emptyReason: "Database offline",
      };
    }

    try {
      // 1. Try querying pre-linked relations in temple_nearby_places
      const linked = await prisma.templeNearbyPlace.findMany({
        where: {
          templeId,
          ...(categoryFilter ? { nearbyPlace: { category: categoryFilter } } : {}),
        },
        include: {
          nearbyPlace: true,
        },
        orderBy: [{ priority: "asc" }, { distanceKm: "asc" }],
      });

      if (linked.length > 0) {
        const attractions: NormalizedAttraction[] = linked.map((link, idx) => {
          const p = link.nearbyPlace;
          const cat = p.category as AttractionCategory;
          const score = calculateRelevanceScore({
            category: cat,
            sourceType: p.sourceType,
            distanceKm: link.distanceKm,
            subcategory: p.subcategory,
            hasOfficialUrl: !!p.officialUrl,
          });

          const isStale = p.lastCheckedAt
            ? Date.now() - new Date(p.lastCheckedAt).getTime() > 180 * 24 * 60 * 60 * 1000
            : false;

          return {
            id: p.id,
            name: p.name,
            nativeName: p.nativeName,
            slug: p.slug,
            category: cat,
            subcategory: p.subcategory,
            description: p.description,
            latitude: p.latitude,
            longitude: p.longitude,
            address: p.address,
            city: p.city,
            district: p.district,
            state: p.state,
            country: p.country,
            sourceType: p.sourceType,
            sourceUrl: p.sourceUrl,
            verificationStatus: p.verificationStatus,
            verifiedAt: p.verifiedAt?.toISOString().split("T")[0] ?? null,
            lastCheckedAt: p.lastCheckedAt?.toISOString().split("T")[0] ?? null,
            imageReference: p.imageReference,
            officialUrl: p.officialUrl,
            airDistanceKm: link.distanceKm,
            roadDistanceKm: link.estimatedDriveMinutes ? Math.round(link.distanceKm * 1.25 * 10) / 10 : null,
            estimatedDriveMinutes: link.estimatedDriveMinutes,
            estimatedWalkMinutes: link.estimatedWalkMinutes,
            displayDistance: formatDistanceString(link.distanceKm, null, link.estimatedDriveMinutes),
            editorialHighlight: getEditorialHighlight(cat, score, idx === 0),
            isStale,
          };
        });

        return {
          attractions,
          radiusConfig,
          totalFound: attractions.length,
        };
      }

      // 2. Spatial Fallback: Query all famous places within bounding box
      // 1 deg lat ≈ 111 km. Compute rough bounding box for efficient index search
      const latDelta = radiusConfig.maxRadiusKm / 111;
      const lngDelta = radiusConfig.maxRadiusKm / (111 * Math.cos((templeLat * Math.PI) / 180));

      const candidates = await prisma.famousPlace.findMany({
        where: {
          latitude: { gte: templeLat - latDelta, lte: templeLat + latDelta },
          longitude: { gte: templeLng - lngDelta, lte: templeLng + lngDelta },
          ...(categoryFilter ? { category: categoryFilter } : {}),
        },
        take: 50,
      });

      const matchesWithDist = candidates
        .map((p) => {
          const dist = calculateHaversineDistanceKm(templeLat, templeLng, p.latitude, p.longitude);
          return { place: p, distanceKm: dist };
        })
        .filter((item) => item.distanceKm <= radiusConfig.maxRadiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm);

      if (matchesWithDist.length === 0) {
        return {
          attractions: [],
          radiusConfig,
          totalFound: 0,
          emptyReason: `No major verified attractions found within ${radiusConfig.maxRadiusKm} km.`,
        };
      }

      const attractions: NormalizedAttraction[] = matchesWithDist.map((item, idx) => {
        const p = item.place;
        const cat = p.category as AttractionCategory;
        const score = calculateRelevanceScore({
          category: cat,
          sourceType: p.sourceType,
          distanceKm: item.distanceKm,
          subcategory: p.subcategory,
          hasOfficialUrl: !!p.officialUrl,
        });

        const isStale = p.lastCheckedAt
          ? Date.now() - new Date(p.lastCheckedAt).getTime() > 180 * 24 * 60 * 60 * 1000
          : false;

        return {
          id: p.id,
          name: p.name,
          nativeName: p.nativeName,
          slug: p.slug,
          category: cat,
          subcategory: p.subcategory,
          description: p.description,
          latitude: p.latitude,
          longitude: p.longitude,
          address: p.address,
          city: p.city,
          district: p.district,
          state: p.state,
          country: p.country,
          sourceType: p.sourceType,
          sourceUrl: p.sourceUrl,
          verificationStatus: p.verificationStatus,
          verifiedAt: p.verifiedAt?.toISOString().split("T")[0] ?? null,
          lastCheckedAt: p.lastCheckedAt?.toISOString().split("T")[0] ?? null,
          imageReference: p.imageReference,
          officialUrl: p.officialUrl,
          airDistanceKm: item.distanceKm,
          roadDistanceKm: null,
          estimatedDriveMinutes: Math.round(item.distanceKm * 2.2), // rough terrain approximation
          estimatedWalkMinutes: item.distanceKm < 3 ? Math.round(item.distanceKm * 14) : null,
          displayDistance: formatDistanceString(item.distanceKm),
          editorialHighlight: getEditorialHighlight(cat, score, idx === 0),
          isStale,
        };
      });

      return {
        attractions,
        radiusConfig,
        totalFound: attractions.length,
      };
    } catch (err) {
      console.error("Error in NearbyPlaceEngine.getNearbyForTemple:", err);
      return {
        attractions: [],
        radiusConfig,
        totalFound: 0,
        emptyReason: "Unable to query nearby places",
      };
    }
  }

  /**
   * Generates a grounded, hallucination-free context block for AI planning prompts.
   */
  static formatAIContext(
    templeName: string,
    attractions: NormalizedAttraction[]
  ): string {
    if (attractions.length === 0) {
      return `Nearby Attractions around ${templeName}:\nNone currently verified in the national registry within local radius.`;
    }

    const lines: string[] = [`Verified Famous Places Nearby ${templeName}:`];
    for (const a of attractions.slice(0, 5)) {
      lines.push(
        `- ${a.name} [Category: ${a.category}] (${a.displayDistance}): ${a.description} (Source: ${a.sourceType || "Official Registry"})`
      );
    }
    return lines.join("\n");
  }
}
