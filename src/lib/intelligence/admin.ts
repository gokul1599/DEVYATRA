/**
 * Phase 15: Admin Temple Intelligence Engine
 * 
 * Aggregates live timing health, booking link validation, stale data detection (>90 days),
 * and security alerts across the national atlas for administrator action.
 */

import { TEMPLES } from "@/lib/registry";
import { getLiveTempleTiming } from "./timings";
import { getBookingIntelligence } from "./bookings";
import { calculateFreshnessScore } from "./freshness";
import { getTodayPanchang } from "./festivals";

export interface TempleIntelligenceHealthSummary {
  totalTemples: number;
  timingsCoverage: {
    verifiedTimingsCount: number;
    openNowCount: number;
    closingSoonCount: number;
    afternoonBreakCount: number;
    closedCount: number;
    seasonalCount: number;
    unknownCount: number;
    completenessPercentage: number;
  };
  bookingsHealth: {
    officialPortalsCount: number;
    onlineMandatoryCount: number;
    specialDarshanAvailableCount: number;
    fraudWarningsActiveCount: number;
  };
  freshnessHealth: {
    averageFreshnessScore: number;
    tierACount: number; // Statutory Trusts & Boards
    tierBCount: number; // State Tourism / ASI
    tierCCount: number; // Cadastral Survey
    tierDCount: number; // Community
    staleRecordsCount: number; // >90 days
  };
  panchangToday: ReturnType<typeof getTodayPanchang>;
  staleAlertsSample: Array<{
    id: string;
    slug: string;
    name: string;
    stateCode: string;
    district: string;
    daysSinceVerification: number;
    sourceOrg: string;
    score: number;
  }>;
}

/**
 * Computes live intelligence telemetry across all indexed temples.
 */
export function getAdminIntelligenceSummary(): TempleIntelligenceHealthSummary {
  const allTemples = TEMPLES;
  const now = new Date();
  const panchangToday = getTodayPanchang(now);

  let verifiedTimingsCount = 0;
  let openNowCount = 0;
  let closingSoonCount = 0;
  let afternoonBreakCount = 0;
  let closedCount = 0;
  let seasonalCount = 0;
  let unknownCount = 0;

  let officialPortalsCount = 0;
  let onlineMandatoryCount = 0;
  let specialDarshanAvailableCount = 0;
  let fraudWarningsActiveCount = 0;

  let totalScore = 0;
  let tierACount = 0;
  let tierBCount = 0;
  let tierCCount = 0;
  let tierDCount = 0;
  let staleRecordsCount = 0;

  const staleList: TempleIntelligenceHealthSummary["staleAlertsSample"] = [];

  for (const t of allTemples) {
    // 1. Timings
    const timing = getLiveTempleTiming(t, now);
    if (timing.state !== "UNKNOWN") verifiedTimingsCount++;
    if (timing.state === "OPEN_NOW") openNowCount++;
    else if (timing.state === "CLOSING_SOON") closingSoonCount++;
    else if (timing.state === "AFTERNOON_BREAK") afternoonBreakCount++;
    else if (timing.state === "CLOSED") closedCount++;
    else if (timing.state === "SEASONAL") seasonalCount++;
    else unknownCount++;

    // 2. Bookings
    const booking = getBookingIntelligence(t);
    if (booking.officialPortal.isVerified) officialPortalsCount++;
    if (booking.isOnlineMandatory) onlineMandatoryCount++;
    if (booking.hasSpecialDarshan) specialDarshanAvailableCount++;
    if (booking.fraudAlert.hasWarning) fraudWarningsActiveCount++;

    // 3. Freshness
    const freshness = calculateFreshnessScore(t, now);
    totalScore += freshness.score;
    if (freshness.tier === "TIER_A") tierACount++;
    else if (freshness.tier === "TIER_B") tierBCount++;
    else if (freshness.tier === "TIER_C") tierCCount++;
    else tierDCount++;

    if (freshness.isStale) {
      staleRecordsCount++;
      if (staleList.length < 10) {
        staleList.push({
          id: t.id,
          slug: t.slug,
          name: t.name,
          stateCode: t.stateCode,
          district: t.district,
          daysSinceVerification: freshness.daysSinceVerification,
          sourceOrg: freshness.sourceOrg,
          score: freshness.score,
        });
      }
    }
  }

  const total = allTemples.length || 1;
  const completenessPercentage = Math.round((verifiedTimingsCount / total) * 100);
  const averageFreshnessScore = Math.round(totalScore / total);

  return {
    totalTemples: total,
    timingsCoverage: {
      verifiedTimingsCount,
      openNowCount,
      closingSoonCount,
      afternoonBreakCount,
      closedCount,
      seasonalCount,
      unknownCount,
      completenessPercentage,
    },
    bookingsHealth: {
      officialPortalsCount,
      onlineMandatoryCount,
      specialDarshanAvailableCount,
      fraudWarningsActiveCount,
    },
    freshnessHealth: {
      averageFreshnessScore,
      tierACount,
      tierBCount,
      tierCCount,
      tierDCount,
      staleRecordsCount,
    },
    panchangToday,
    staleAlertsSample: staleList,
  };
}
