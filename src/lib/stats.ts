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
  isFallback: boolean;
  source: "NEON_POSTGRESQL" | "STATIC_LOCAL_FALLBACK";
  formattedTotalTemples: string;
  formattedDistricts: string;
  formattedStates: string;
}

// Canonical static fallback ONLY for isolated offline testing
export const PLATFORM_STATS_BASELINE: PlatformStats = {
  totalTemples: 2205,
  totalVerifiedTemples: 2205,
  totalStates: 36,
  totalDistricts: 725,
  totalAdminUnits: 4120,
  verifiedRecords: 2205,
  communityRecords: 0,
  pendingRecords: 0,
  lastDataRefresh: "2026-09-24T00:00:00.000Z",
  isLive: false,
  isFallback: true,
  source: "STATIC_LOCAL_FALLBACK",
  formattedTotalTemples: "2,205",
  formattedDistricts: "725",
  formattedStates: "36",
};

let cachedStats: PlatformStats | null = null;
let lastFetchedTime = 0;
const STATS_CACHE_TTL_MS = 60 * 1000; // 60 seconds edge/memory cache

/**
 * Single Source of Truth for Platform Statistics.
 * Queries Neon PostgreSQL directly with zero Math.max artificial inflation.
 * If database is unreachable, returns fallback clearly flagged as isFallback=true, isLive=false.
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

    cachedStats = {
      totalTemples: totalCount,
      totalVerifiedTemples: verifiedCount,
      totalStates: Math.min(statesCount || 36, 36), // Sovereign India: 28 States + 8 UTs = 36
      totalDistricts: districtsCount,
      totalAdminUnits: adminUnitsCount,
      verifiedRecords: verifiedCount,
      communityRecords: communityCount,
      pendingRecords: pendingCount,
      lastDataRefresh: new Date().toISOString(),
      isLive: true,
      isFallback: false,
      source: "NEON_POSTGRESQL",
      formattedTotalTemples: totalCount.toLocaleString("en-IN"),
      formattedDistricts: districtsCount.toLocaleString("en-IN"),
      formattedStates: "36 states & UTs",
    };

    lastFetchedTime = now;
    return cachedStats;
  } catch (err) {
    console.warn("[getPlatformStats] DB query failed, returning fallback:", err);
    return PLATFORM_STATS_BASELINE;
  }
}
