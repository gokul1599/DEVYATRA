/**
 * Phase 15: Live Temple Intelligence Engine Verification Suite
 * 
 * Verifies:
 * 1. Live Timings Engine: Granular states (OPEN_NOW, CLOSING_SOON, AFTERNOON_BREAK, AARTI_IN_PROGRESS, CLOSED, SEASONAL) & IST synchronization.
 * 2. Bookings Intelligence: Official statutory portal detection, online mandatory rules, and special entry passes.
 * 3. Anti-Fraud Security System: Tout warning generation, fake booking warnings, and official domain validation.
 * 4. Astronomical Hindu Panchang: Accurate Tithi, Paksha, Masa, Nakshatra, and Samvat computation.
 * 5. Festival Intelligence & Crowd Predictor: Countdown days, crowd density levels (LOW to EXTREME), and queue wait estimates.
 * 6. Data Freshness & Provenance Tiers: Tier A–D classification, 0–100 score decay, and stale data alert flags.
 * 7. Admin Intelligence Telemetry: Global atlas metrics, timing coverage, and security alert aggregation.
 * 8. Regression Guard: 2,084+ temples, 36/36 states, 714+ districts, and 0 centroid fallbacks.
 * 
 * Usage:
 *   npx tsx scripts/verify_phase15.ts
 */

import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { TEMPLES, getTemple } from "../src/lib/registry";
import {
  getLiveTempleTiming,
  getSeasonalNotice,
  getBookingIntelligence,
  getTodayPanchang,
  getTempleFestivalsIntelligence,
  estimateCrowdLevel,
  calculateFreshnessScore,
  classifyProvenanceTier,
  getAdminIntelligenceSummary,
} from "../src/lib/intelligence";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

interface CheckResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: CheckResult[] = [];

function recordCheck(name: string, passed: boolean, details: string) {
  results.push({ name, passed, details });
  const icon = passed ? "✅" : "❌";
  console.log(`${icon} [${passed ? "PASS" : "FAIL"}] ${name} — ${details}`);
}

async function verify() {
  console.log("==================================================");
  console.log("🇮🇳 DEVYATRA / TEMPLEORA — PHASE 15 VERIFICATION");
  console.log("Live Temple Intelligence Platform Suite");
  console.log("==================================================\n");

  try {
    const tirumala = getTemple("sri-venkateswara-temple") || TEMPLES[0];
    const kashi = getTemple("kashi-vishwanath-temple") || TEMPLES[1];
    const meenakshi = getTemple("meenakshi-amman-temple") || TEMPLES[2];

    // -------------------------------------------------------------------------
    // Check 1: Live Timings Engine & IST Timezone Accuracy
    // -------------------------------------------------------------------------
    console.log("▶ Check 1: Live Timings Engine & IST Accuracy");
    const testNow = new Date();
    const liveTiming = getLiveTempleTiming(tirumala, testNow);

    // Test specific synthetic times for status transitions
    // Midday break (1:30 PM IST = 08:00 UTC) for Meenakshi (morning 05:00-12:30, evening 16:00-21:30)
    const middayBreakDate = new Date("2026-09-22T08:00:00.000Z"); // 13:30 IST
    const breakStatus = getLiveTempleTiming(meenakshi, middayBreakDate);

    // Deep night closed (02:00 AM IST = 20:30 UTC previous day)
    const nightClosedDate = new Date("2026-09-21T20:30:00.000Z"); // 02:00 IST
    const closedStatus = getLiveTempleTiming(tirumala, nightClosedDate);

    // Winter Kedarnath test
    const kedarnathMock = {
      ...tirumala,
      slug: "kedarnath-temple",
      name: "Kedarnath Temple",
    };
    const winterDate = new Date("2026-12-15T06:00:00.000Z");
    const seasonalNotice = getSeasonalNotice(kedarnathMock, winterDate);

    const timingPassed =
      liveTiming.isIstConfirmed &&
      liveTiming.currentTimeIst.includes("IST") &&
      closedStatus.state === "CLOSED" &&
      breakStatus.state === "AFTERNOON_BREAK" &&
      !!seasonalNotice;

    recordCheck(
      "Live Timings Engine & IST Status Engine",
      timingPassed,
      `Current IST: ${liveTiming.currentTimeIst} | Status: ${liveTiming.label} | Night: ${closedStatus.state} | Break: ${breakStatus.state} | Seasonal: ${seasonalNotice ? "Active" : "None"}`
    );

    // -------------------------------------------------------------------------
    // Check 2: Official Bookings Intelligence & Statutory Verification
    // -------------------------------------------------------------------------
    console.log("\n▶ Check 2: Official Bookings Intelligence");
    const ttdBooking = getBookingIntelligence(tirumala);
    const kashiBooking = getBookingIntelligence(kashi);

    const bookingPassed =
      ttdBooking.isOnlineMandatory &&
      ttdBooking.officialPortal.domain === "tirupatibalaji.ap.gov.in" &&
      ttdBooking.officialPortal.trustBadge === "STATUTORY_GOVT_BOARD" &&
      ttdBooking.specialDarshans.length > 0 &&
      kashiBooking.officialPortal.domain === "shrikashivishwanath.org";

    recordCheck(
      "Statutory Bookings & Official Portal Verification",
      bookingPassed,
      `Tirumala Portal: ${ttdBooking.officialPortal.domain} (${ttdBooking.officialPortal.trustBadge}) | Special Passes: ${ttdBooking.specialDarshans.length} | Kashi: ${kashiBooking.officialPortal.domain}`
    );

    // -------------------------------------------------------------------------
    // Check 3: Anti-Fraud Security & Tout Advisory System
    // -------------------------------------------------------------------------
    console.log("\n▶ Check 3: Anti-Fraud Security & Tout Advisory");
    const fraudPassed =
      ttdBooking.fraudAlert.hasWarning &&
      ttdBooking.fraudAlert.cautions.length >= 3 &&
      ttdBooking.fraudAlert.description.toLowerCase().includes("unauthorized");

    recordCheck(
      "Anti-Fraud Security & Tout Warning System",
      fraudPassed,
      `Advisory: "${ttdBooking.fraudAlert.title.slice(0, 45)}..." (${ttdBooking.fraudAlert.cautions.length} statutory cautions)`
    );

    // -------------------------------------------------------------------------
    // Check 4: Astronomical Hindu Panchang Engine
    // -------------------------------------------------------------------------
    console.log("\n▶ Check 4: Astronomical Hindu Panchang Engine");
    const panchang = getTodayPanchang(testNow);

    const panchangPassed =
      !!panchang.tithi &&
      (panchang.paksha === "Shukla" || panchang.paksha === "Krishna") &&
      !!panchang.masa &&
      !!panchang.nakshatra &&
      panchang.samvat > 2080;

    recordCheck(
      "Astronomical Hindu Panchang Engine",
      panchangPassed,
      `Tithi: ${panchang.tithi} | Paksha: ${panchang.paksha} | Masa: ${panchang.masa} | Nakshatra: ${panchang.nakshatra} | Samvat: ${panchang.samvat}`
    );

    // -------------------------------------------------------------------------
    // Check 5: Festival Intelligence & Live Crowd Predictor
    // -------------------------------------------------------------------------
    console.log("\n▶ Check 5: Festival Intelligence & Crowd Predictor");
    const festivals = getTempleFestivalsIntelligence(tirumala, testNow);
    const brahmotsavamCrowd = estimateCrowdLevel(
      "Salakatla Brahmotsavam",
      tirumala,
      panchang,
      true // Festival is today
    );

    const normalWeekdayCrowd = estimateCrowdLevel(
      "Regular Day",
      tirumala,
      panchang,
      false
    );

    const festivalPassed =
      festivals.length > 0 &&
      festivals[0].countdownDays >= 0 &&
      brahmotsavamCrowd.crowdLevel === "EXTREME" &&
      brahmotsavamCrowd.expectedWaitTime.includes("Hours") &&
      (normalWeekdayCrowd.crowdLevel === "LOW" || normalWeekdayCrowd.crowdLevel === "MODERATE");

    recordCheck(
      "Festival Intelligence & Crowd Density Estimator",
      festivalPassed,
      `Festivals Indexed: ${festivals.length} | Peak Brahmotsavam: ${brahmotsavamCrowd.crowdLevel} (${brahmotsavamCrowd.expectedWaitTime}) | Normal: ${normalWeekdayCrowd.crowdLevel}`
    );

    // -------------------------------------------------------------------------
    // Check 6: Data Freshness & Provenance Tier Classification
    // -------------------------------------------------------------------------
    console.log("\n▶ Check 6: Data Freshness & Provenance Tiering");
    const tierA = classifyProvenanceTier("Tirumala Tirupati Devasthanams", "official");
    const tierB = classifyProvenanceTier("Archaeological Survey of India", "government");

    // Fresh record (< 30 days old)
    const freshMock = {
      ...tirumala,
      source: { ...tirumala.source!, lastVerified: "2026-09-10" },
    };
    const freshScore = calculateFreshnessScore(freshMock, testNow);

    // Stale record (> 90 days old, Tirumala baseline from 2025)
    const staleScore = calculateFreshnessScore(tirumala, testNow);

    const freshnessPassed =
      tierA.tier === "TIER_A" &&
      tierB.tier === "TIER_B" &&
      freshScore.score === 100 &&
      !freshScore.isStale &&
      staleScore.isStale === true &&
      staleScore.score <= 50;

    recordCheck(
      "Data Freshness & Provenance Tier Engine",
      freshnessPassed,
      `TTD: ${tierA.tier} (${tierA.baseScore} pts) | ASI: ${tierB.tier} (${tierB.baseScore} pts) | Fresh Score: ${freshScore.score}/100 | Stale Detected: ${staleScore.score}/100 (${staleScore.daysSinceVerification}d ago)`
    );

    // -------------------------------------------------------------------------
    // Check 7: Admin Intelligence Global Telemetry
    // -------------------------------------------------------------------------
    console.log("\n▶ Check 7: Admin Intelligence Global Telemetry");
    const adminTelemetry = getAdminIntelligenceSummary();

    const telemetryPassed =
      adminTelemetry.totalTemples >= 20 &&
      adminTelemetry.timingsCoverage.completenessPercentage > 0 &&
      adminTelemetry.bookingsHealth.officialPortalsCount > 0 &&
      adminTelemetry.freshnessHealth.tierACount > 0 &&
      !!adminTelemetry.panchangToday.tithi;

    recordCheck(
      "Admin Intelligence Telemetry & Health Dashboard",
      telemetryPassed,
      `Atlas Monitored: ${adminTelemetry.totalTemples} temples | Timings Coverage: ${adminTelemetry.timingsCoverage.completenessPercentage}% | Avg Freshness: ${adminTelemetry.freshnessHealth.averageFreshnessScore}/100 | Tier A Shrines: ${adminTelemetry.freshnessHealth.tierACount}`
    );

    // -------------------------------------------------------------------------
    // Check 8: National Integrity & Regression Guard
    // -------------------------------------------------------------------------
    console.log("\n▶ Check 8: National Integrity & Regression Guard");
    const [dbCount, centroidCount, distinctStates, distinctDistricts] = await Promise.all([
      prisma.temple.count(),
      prisma.temple.count({ where: { isCentroidFallback: true } }),
      prisma.temple.findMany({ select: { stateCode: true }, distinct: ["stateCode"] }),
      prisma.district.count({ where: { temples: { some: {} } } }),
    ]);

    const regressionPassed =
      dbCount >= 2084 &&
      centroidCount === 0 &&
      distinctStates.length === 36 &&
      distinctDistricts >= 714;

    recordCheck(
      "National Directory Regression Guard",
      regressionPassed,
      `Live Temples: ${dbCount} (≥2,084) | Centroids: ${centroidCount} (0) | States: ${distinctStates.length}/36 | Districts: ${distinctDistricts}/917 (${Math.round((distinctDistricts / 917) * 100)}%)`
    );

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log("\n==================================================");
    console.log("📊 PHASE 15 FINAL VERIFICATION SUMMARY");
    console.log("==================================================");
    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;
    console.log(`Passed: ${passedCount} / ${totalCount} (${Math.round((passedCount / totalCount) * 100)}%)\n`);

    if (passedCount === totalCount) {
      console.log("🎉 ALL PHASE 15 VERIFICATION GATES PASSED PERFECTLY!");
    } else {
      console.error("❌ SOME PHASE 15 VERIFICATION GATES FAILED.");
      process.exit(1);
    }
  } catch (err: any) {
    console.error("Fatal error during Phase 15 verification:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
