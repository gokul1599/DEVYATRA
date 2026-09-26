import { getPrisma } from "@/lib/db/client";

export interface PlatformStats {
  totalTemples: number;
  totalVerifiedTemples: number;
  totalStates: number;
  totalDistricts: number;
  totalAdminUnits: number;
  totalDestinations: number;
  verifiedRecords: number;
  communityRecords: number;
  pendingRecords: number;
  lastDataRefresh: string;
  isLive: boolean;
  isFallback: boolean;
  source: "NEON_POSTGRESQL" | "STATIC_LOCAL_FALLBACK";
  formattedTotalTemples: string;
  formattedDistricts: string;
  formattedStates: string;
  formattedTotalDestinations: string;
}

// Canonical static fallback when database is disconnected or offline
export const PLATFORM_STATS_BASELINE: PlatformStats = {
  totalTemples: 0,
  totalVerifiedTemples: 0,
  totalStates: 36,
  totalDistricts: 0,
  totalAdminUnits: 0,
  totalDestinations: 0,
  verifiedRecords: 0,
  communityRecords: 0,
  pendingRecords: 0,
  lastDataRefresh: "Database disconnected",
  isLive: false,
  isFallback: true,
  source: "STATIC_LOCAL_FALLBACK",
  formattedTotalTemples: "Statistics temporarily unavailable",
  formattedDistricts: "Statistics temporarily unavailable",
  formattedStates: "36 States & UTs",
  formattedTotalDestinations: "Statistics temporarily unavailable",
};

let cachedStats: PlatformStats | null = null;
let lastFetchedTime = 0;
const STATS_CACHE_TTL_MS = 60 * 1000; // 60 seconds edge/memory cache

/**
 * Single Source of Truth for Platform Statistics.
 * Queries Neon PostgreSQL directly with zero artificial inflation.
 * Validates impossible database states (negative counts, NaN).
 * If database is unreachable, returns truthful baseline indicating unavailable data.
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  const now = Date.now();
  if (cachedStats && now - lastFetchedTime < STATS_CACHE_TTL_MS) {
    return cachedStats;
  }

  const prisma = getPrisma();
  if (!prisma) {
    return PLATFORM_STATS_BASELINE;
  }

  try {
    const [
      totalCount,
      verifiedCount,
      statesCount,
      districtsCount,
      adminUnitsCount,
      destinationsCount,
      communityCount,
      pendingCount,
    ] = await Promise.all([
      prisma.temple.count(),
      prisma.temple.count({
        where: {
          verificationStatus: {
            in: ["VERIFIED", "VERIFIED_OFFICIAL", "VERIFIED_SOURCE"],
          },
        },
      }),
      prisma.state.count(),
      prisma.district.count({ where: { temples: { some: {} } } }),
      prisma.adminUnit.count(),
      prisma.famousPlace.count().catch(() => 0),
      prisma.temple.count({ where: { sourceType: "community" } }),
      prisma.userSubmission.count({ where: { status: "SUBMITTED" } }),
    ]);

    // Validation: Catch impossible database states
    if (
      Number.isNaN(totalCount) ||
      totalCount < 0 ||
      Number.isNaN(districtsCount) ||
      districtsCount < 0 ||
      Number.isNaN(statesCount) ||
      statesCount < 0
    ) {
      console.error("[getPlatformStats] Detected invalid/impossible database counts. Failing closed to baseline.");
      return PLATFORM_STATS_BASELINE;
    }

    cachedStats = {
      totalTemples: totalCount,
      totalVerifiedTemples: verifiedCount,
      totalStates: Math.min(statesCount || 36, 36), // Sovereign India: 28 States + 8 UTs = 36
      totalDistricts: districtsCount,
      totalAdminUnits: adminUnitsCount,
      totalDestinations: destinationsCount,
      verifiedRecords: verifiedCount,
      communityRecords: communityCount,
      pendingRecords: pendingCount,
      lastDataRefresh: new Date().toISOString(),
      isLive: true,
      isFallback: false,
      source: "NEON_POSTGRESQL",
      formattedTotalTemples: totalCount > 0 ? totalCount.toLocaleString("en-IN") : "Statistics unavailable",
      formattedDistricts: districtsCount > 0 ? districtsCount.toLocaleString("en-IN") : "Statistics unavailable",
      formattedStates: "36 States & UTs",
      formattedTotalDestinations: destinationsCount > 0 ? destinationsCount.toLocaleString("en-IN") : "Verified Catalog",
    };

    lastFetchedTime = now;
    return cachedStats;
  } catch (err) {
    console.warn("[getPlatformStats] DB query failed, returning fallback:", err);
    return PLATFORM_STATS_BASELINE;
  }
}
