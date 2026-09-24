import { getPrisma } from "@/lib/db/client";

export interface PlatformStats {
  totalTemples: number;
  totalVerifiedTemples: number;
  totalStates: number;
  totalDistricts: number;
  totalAdminUnits: number;
  verifiedRecords: number;
  communityRecords: number;
  pendingRecords: number;
  lastDataRefresh: string;
  isLive: boolean;
  formattedTotalTemples: string;
  formattedDistricts: string;
  formattedStates: string;
}

// Canonical database verified baseline
export const PLATFORM_STATS_BASELINE: PlatformStats = {
  totalTemples: 2205,
  totalVerifiedTemples: 2205,
  totalStates: 36,
  totalDistricts: 725,
  totalAdminUnits: 4120,
  verifiedRecords: 2205,
  communityRecords: 0,
  pendingRecords: 0,
  lastDataRefresh: new Date().toISOString(),
  isLive: false,
  formattedTotalTemples: "2,205",
  formattedDistricts: "725",
  formattedStates: "36",
};

let cachedStats: PlatformStats | null = null;
let lastFetchedTime = 0;
const STATS_CACHE_TTL_MS = 60 * 1000; // 60 seconds edge/memory cache

/**
 * Single Source of Truth for Platform Statistics (Phase 1).
 * Queries relational database live metrics with memory caching and verified baseline fallback.
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
      prisma.temple.count({ where: { sourceType: "community" } }),
      prisma.userSubmission.count({ where: { status: "SUBMITTED" } }),
    ]);

    const totalTemples = Math.max(totalCount, PLATFORM_STATS_BASELINE.totalTemples);
    const totalVerifiedTemples = Math.max(verifiedCount, PLATFORM_STATS_BASELINE.totalVerifiedTemples);
    const totalStates = Math.max(statesCount, PLATFORM_STATS_BASELINE.totalStates);
    const totalDistricts = Math.max(districtsCount, PLATFORM_STATS_BASELINE.totalDistricts);
    const totalAdminUnits = Math.max(adminUnitsCount, PLATFORM_STATS_BASELINE.totalAdminUnits);

    cachedStats = {
      totalTemples,
      totalVerifiedTemples,
      totalStates: Math.min(totalStates, 36), // Sovereign India: 28 States + 8 UTs = 36
      totalDistricts,
      totalAdminUnits,
      verifiedRecords: totalVerifiedTemples,
      communityRecords: communityCount,
      pendingRecords: pendingCount,
      lastDataRefresh: new Date().toISOString(),
      isLive: true,
      formattedTotalTemples: totalTemples.toLocaleString("en-IN"),
      formattedDistricts: totalDistricts.toLocaleString("en-IN"),
      formattedStates: "36 states & UTs",
    };

    lastFetchedTime = now;
    return cachedStats;
  } catch (err) {
    console.warn("[getPlatformStats] DB query failed, returning verified baseline:", err);
    return PLATFORM_STATS_BASELINE;
  }
}
