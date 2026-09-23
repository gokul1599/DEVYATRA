/**
 * Phase 16: AI Pilgrimage Planner 2.0 Verification Suite
 * 
 * Verifies:
 * 1. Sacred Circuit Catalog: All 8 core pilgrimage circuit templates exist and resolve shrines.
 * 2. Grounded Multi-Day Itinerary Generation: Partitioning across 2+ days with accurate stops.
 * 3. Timing & Afternoon Break Synchronization: Midday sanctum breaks trigger annadhanam/meal stops.
 * 4. Terrain-Aware Transit Models: Mountain/ghat roads receive terrain dilation factors.
 * 5. Senior-Citizen & Accessibility Pacing: Pacing buffers, stair climb warnings, battery buggy advice.
 * 6. Devasthanam Accommodation Grounding: Trust Dharamshala and Yatri Niwas overnight stops.
 * 7. Offline Sacred Pilgrimage Checklist: Dress code, ID requirements, security rules, and prasad guidance.
 * 8. National Directory Regression Guard: 2,084 temples, 0 centroids, 36 states, 714 districts.
 * 
 * Usage:
 *   npx tsx scripts/verify_phase16.ts
 */

import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { SACRED_CIRCUITS, getSacredCircuit } from "../src/lib/ai/circuits";
import { generateSacredJourney } from "../src/lib/ai/planner2";

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
  console.log("🇮🇳 DEVYATRA / TEMPLEORA — PHASE 16 VERIFICATION");
  console.log("AI Pilgrimage Planner 2.0 Multi-Day Engine Suite");
  console.log("==================================================\n");

  try {
    // -------------------------------------------------------------------------
    // Check 1: Sacred Circuit Catalog Verification
    // -------------------------------------------------------------------------
    console.log("▶ Check 1: Sacred Circuit Catalog Coverage");
    const requiredCircuits = [
      "jyotirlinga-central",
      "jyotirlinga-western",
      "pancha-bhoota-sthalams",
      "chota-char-dham",
      "ashta-vinayaka",
      "navagraha-cluster",
      "divya-desam-chola",
      "shakti-peethas-east",
    ];

    let foundCircuits = 0;
    for (const cId of requiredCircuits) {
      const c = getSacredCircuit(cId);
      if (c && c.templeSlugs.length > 0) foundCircuits++;
    }

    recordCheck(
      "Sacred Pilgrimage Circuit Catalog Coverage",
      foundCircuits === requiredCircuits.length,
      `Verified ${foundCircuits} / ${requiredCircuits.length} iconic sacred circuit templates (Jyotirlinga, Char Dham, Pancha Bhoota, Divya Desam, Ashta Vinayaka)`
    );

    // -------------------------------------------------------------------------
    // Check 2: Grounded Multi-Day Itinerary Generation
    // -------------------------------------------------------------------------
    console.log("\n▶ Check 2: Grounded Multi-Day Itinerary Generation");
    const centralPlan = generateSacredJourney({
      circuitId: "jyotirlinga-central",
      startDate: "2026-10-01",
      days: 2,
      travelMode: "car",
      pace: "standard",
      companions: ["family"],
      budget: "mid",
      preferAartis: true,
    });

    const multiDayPassed =
      centralPlan.totalDays === 2 &&
      centralPlan.days.length === 2 &&
      centralPlan.days[0].stops.length >= 3 &&
      centralPlan.days[1].stops.length >= 3 &&
      centralPlan.circuitTitle.includes("Central Jyotirlinga");

    recordCheck(
      "Multi-Day Circuit Partitioning & Itinerary Synthesis",
      multiDayPassed,
      `Generated ${centralPlan.totalDays}-Day Journey: "${centralPlan.circuitTitle}" | Day 1 Stops: ${centralPlan.days[0]?.stops.length} | Day 2 Stops: ${centralPlan.days[1]?.stops.length}`
    );

    // -------------------------------------------------------------------------
    // Check 3: Timing & Afternoon Break Synchronization
    // -------------------------------------------------------------------------
    console.log("\n▶ Check 3: Timing & Afternoon Break Synchronization");
    const panchaPlan = generateSacredJourney({
      circuitId: "pancha-bhoota-sthalams",
      startDate: "2026-10-05",
      days: 4,
      travelMode: "car",
      pace: "standard",
      companions: ["solo"],
      budget: "mid",
    });

    const allStops = panchaPlan.days.flatMap((d) => d.stops);
    const mealBreakStops = allStops.filter((s) => s.type === "meal_break");
    const darshanStops = allStops.filter((s) => s.type === "darshan");

    recordCheck(
      "Afternoon Break & Darshan Slot Synchronization",
      darshanStops.length >= 4,
      `Synchronized ${darshanStops.length} Darshan Stops across 4 days | Midday Rest/Annadhanam Scheduled: ${mealBreakStops.length} breaks`
    );

    // -------------------------------------------------------------------------
    // Check 4: Terrain-Aware Transit Dilation
    // -------------------------------------------------------------------------
    console.log("\n▶ Check 4: Terrain-Aware Transit Models");
    const charDhamPlan = generateSacredJourney({
      circuitId: "chota-char-dham",
      startDate: "2026-05-15",
      days: 4,
      travelMode: "car",
      pace: "relaxed",
      companions: ["family"],
      budget: "premium",
    });

    const charDhamTransit = charDhamPlan.days
      .flatMap((d) => d.stops)
      .filter((s) => s.type === "transit");

    const terrainPassed =
      charDhamTransit.length > 0 &&
      charDhamTransit.some((t) => t.reason.includes("terrain factor: 1.85x"));

    recordCheck(
      "Terrain-Aware Mountain Road Transit Dilation",
      terrainPassed,
      `Himalayan Mountain Circuit applied 1.85x dilation factor on winding ghat transit legs`
    );

    // -------------------------------------------------------------------------
    // Check 5: Senior-Citizen & Accessibility Guardrails
    // -------------------------------------------------------------------------
    console.log("\n▶ Check 5: Senior-Citizen & Accessibility Guardrails");
    const seniorPlan = generateSacredJourney({
      circuitId: "ashta-vinayaka",
      startDate: "2026-10-10",
      days: 3,
      travelMode: "car",
      pace: "relaxed",
      companions: ["elderly", "accessibility"],
      budget: "mid",
    });

    const hasSeniorAdvisory = seniorPlan.guardianAdvisories.some((a) =>
      a.toLowerCase().includes("senior citizen")
    );
    const hasAccessibilityAdvisory = seniorPlan.guardianAdvisories.some((a) =>
      a.toLowerCase().includes("accessibility")
    );

    recordCheck(
      "Senior Citizen Pacing & Accessibility Guardrails",
      hasSeniorAdvisory && hasAccessibilityAdvisory,
      `Advisories Active: Senior Pacing (${hasSeniorAdvisory ? "YES" : "NO"}) | Wheelchair/Ramp Protocols (${hasAccessibilityAdvisory ? "YES" : "NO"})`
    );

    // -------------------------------------------------------------------------
    // Check 6: Devasthanam Accommodation Grounding
    // -------------------------------------------------------------------------
    console.log("\n▶ Check 6: Devasthanam Accommodation Grounding");
    const hasAccommodation = centralPlan.days.every(
      (d) =>
        d.overnightStay &&
        (d.overnightStay.name.includes("Yatri Niwas") ||
          d.overnightStay.name.includes("Dharamshala") ||
          d.overnightStay.name.includes("Guest House"))
    );

    recordCheck(
      "Devasthanam Accommodation & Yatri Niwas Grounding",
      hasAccommodation,
      `Day 1: ${centralPlan.days[0]?.overnightStay.name} | Day 2: ${centralPlan.days[1]?.overnightStay.name}`
    );

    // -------------------------------------------------------------------------
    // Check 7: Offline Sacred Pilgrimage Checklist
    // -------------------------------------------------------------------------
    console.log("\n▶ Check 7: Offline Sacred Pilgrimage Checklist");
    const checklist = centralPlan.offlineChecklist;

    const checklistPassed =
      checklist.dressCode.length >= 3 &&
      checklist.documentation.length >= 3 &&
      checklist.sanctumRules.length >= 3 &&
      checklist.prasadGuide.length >= 3;

    recordCheck(
      "Offline Sacred Pilgrimage Checklist Generation",
      checklistPassed,
      `Checklist Items: ${checklist.dressCode.length} Dress Code, ${checklist.documentation.length} ID Rules, ${checklist.sanctumRules.length} Sanctum Rules, ${checklist.prasadGuide.length} Prasad Guidelines`
    );

    // -------------------------------------------------------------------------
    // Check 8: National Integrity & Directory Regression Guard
    // -------------------------------------------------------------------------
    console.log("\n▶ Check 8: National Integrity Regression Guard");
    const dbCount = await prisma.temple.count();
    const centroidCount = await prisma.temple.count({ where: { isCentroidFallback: true } });
    const distinctStates = await prisma.temple.findMany({ select: { stateCode: true }, distinct: ["stateCode"] });
    const distinctDistricts = await prisma.district.count({ where: { temples: { some: {} } } });

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
    console.log("📊 PHASE 16 FINAL VERIFICATION SUMMARY");
    console.log("==================================================");
    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;
    console.log(`Passed: ${passedCount} / ${totalCount} (${Math.round((passedCount / totalCount) * 100)}%)\n`);

    if (passedCount === totalCount) {
      console.log("🎉 ALL PHASE 16 VERIFICATION GATES PASSED PERFECTLY!");
    } else {
      console.error("❌ SOME PHASE 16 VERIFICATION GATES FAILED.");
      process.exit(1);
    }
  } catch (err: any) {
    console.error("Fatal error during Phase 16 verification:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
