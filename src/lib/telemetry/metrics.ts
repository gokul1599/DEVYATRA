import { getPrisma } from "@/lib/db/client";
import { TEMPLES } from "@/lib/registry";

export interface PlatformMetrics {
  totalTemples: number;
  totalDistricts: number;
  totalStates: number;
  totalAttractions: number;
  totalSpatialLinks: number;
  centroidFallbacks: number;
  isLive: boolean;
  temples: number;
  districts: number;
  states: number;
}

// Fallback baseline from verified static catalog
const DEFAULT_METRICS: PlatformMetrics = {
  totalTemples: 2205,
  totalDistricts: 725,
  totalStates: 36,
  totalAttractions: 22,
  totalSpatialLinks: 36,
  centroidFallbacks: 0,
  isLive: false,
  temples: 2205,
  districts: 725,
  states: 36,
};

let cachedMetrics: PlatformMetrics | null = null;
let lastFetched = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

export async function getLivePlatformMetrics(): Promise<PlatformMetrics> {
  const now = Date.now();
  if (cachedMetrics && now - lastFetched < CACHE_TTL_MS) {
    return cachedMetrics;
  }

  const prisma = getPrisma();
  if (!prisma) {
    return DEFAULT_METRICS;
  }

  try {
    const [templesCount, districtsWithTemples, famousPlacesCount, linksCount] = await Promise.all([
      prisma.temple.count(),
      prisma.district.count({ where: { temples: { some: {} } } }),
      prisma.famousPlace.count(),
      prisma.templeNearbyPlace.count(),
    ]);

    const temples = templesCount;
    const districts = districtsWithTemples;
    const states = 36;

    cachedMetrics = {
      totalTemples: temples,
      totalDistricts: districts,
      totalStates: states,
      totalAttractions: famousPlacesCount,
      totalSpatialLinks: linksCount,
      centroidFallbacks: 0,
      isLive: true,
      temples,
      districts,
      states,
    };
    lastFetched = now;
    return cachedMetrics;
  } catch (err) {
    console.error("Failed to query live platform metrics, using verified fallback:", err);
    return {
      ...DEFAULT_METRICS,
      isLive: false,
    };
  }
}
