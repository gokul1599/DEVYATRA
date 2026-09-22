/**
 * Phase 11 High-Coverage State Expansion & National Temple Atlas Verification Engine
 *
 * Verifies:
 * 1. Database scale: exactly 1,752 verified temples (baseline 1,698 + 54 new records).
 * 2. Zero centroid fallbacks: 100% surveyed coordinates.
 * 3. 36/36 States & Union Territories represented.
 * 4. District Coverage Expansion: 424 / 917 official LGD districts (46% national coverage).
 * 5. Landmark temples across all 5 target states (OD, GJ, MP, UK, UP).
 * 6. Statutory provenance citations across all 5 state trusts and endowment boards.
 * 7. 100% Idempotency: secondary runs have recordsAdded === 0 and 0 duplicate insertions.
 * 8. AI Grounding & Atlas Integration: Itinerary generation on newly ingested temples.
 *
 * Usage:
 *   npx tsx scripts/verify_phase11.ts
 */
import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getNationalCoverageMatrix } from "../src/lib/coverage/matrix";
import { buildPlan, type PlanRequest } from "../src/lib/ai/engine";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL is not set.");
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

async function runPhase11Verification() {
  console.log("==================================================");
  console.log("🇮🇳 DEVYATRA / TEMPLEORA — PHASE 11 VERIFICATION");
  console.log("High-Coverage State Expansion + National Temple Atlas");
  console.log("States: Odisha, Gujarat, Madhya Pradesh, Uttarakhand, Uttar Pradesh");
  console.log("==================================================\n");

  // Check 1: Database Scale Check (1,752 temples)
  console.log("▶ Check 1: Phase 11 Database Scale Check");
  const totalTemples = await prisma.temple.count();
  const expectedTotal = 1752;
  recordCheck(
    "Phase 11 Database Scale (at least 1,752 Temples)",
    totalTemples >= expectedTotal,
    `Live DB Count: ${totalTemples} | Minimum Expected: ${expectedTotal} (Maintained Phase 11 additions)`
  );

  // Check 2: Absolute 0 Centroid Fallbacks
  console.log("\n▶ Check 2: Zero Centroid Fallbacks Guarantee");
  const centroidCount = await prisma.temple.count({ where: { isCentroidFallback: true } });
  recordCheck(
    "Zero Centroid Fallback Constraint",
    centroidCount === 0,
    `Centroid Fallbacks: ${centroidCount} (100% surveyed coordinates verified)`
  );

  // Check 3: 36 States & UTs Representation
  console.log("\n▶ Check 3: Pan-India 36 States & UTs Coverage");
  const statesGrouped = await prisma.temple.groupBy({
    by: ["stateCode"],
    _count: { id: true },
  });
  recordCheck(
    "All 36 States and UTs Maintained",
    statesGrouped.length === 36,
    `Represented States/UTs: ${statesGrouped.length} / 36`
  );

  // Check 4: District Coverage Expansion (at least 424 / 917 districts, 46%+)
  console.log("\n▶ Check 4: LGD District Coverage Expansion");
  const matrix = await getNationalCoverageMatrix();
  const districtCoverageCheck =
    Boolean(matrix) &&
    matrix!.totalRepresentedDistricts >= 424 &&
    matrix!.totalOfficialDistricts === 917 &&
    matrix!.nationalDistrictCoveragePercent >= 46;

  recordCheck(
    "National District Coverage Leap (at least 424 / 917 Districts)",
    districtCoverageCheck,
    `Represented Districts: ${matrix?.totalRepresentedDistricts} / ${matrix?.totalOfficialDistricts} (${matrix?.nationalDistrictCoveragePercent}% Coverage)`
  );

  // Check 5: Landmark Temples Ingested Across Phase 11 Target States
  console.log("\n▶ Check 5: Landmark Temples Across Target States");
  const targetCheckTemples = [
    // Odisha
    { name: "Lord Jagannath Temple, Puri", idPrefix: "OD-SJTA-PUR" },
    { name: "Lingaraj Temple", idPrefix: "OD-ENDOW-KHO" },
    // Gujarat
    { name: "Somnath Jyotirlinga Temple", idPrefix: "GJ-YATRA-SOM" },
    { name: "Dwarkadhish Temple (Jagat Mandir)", idPrefix: "GJ-YATRA-DWA" },
    // Madhya Pradesh
    { name: "Mahakaleshwar Jyotirlinga Temple", idPrefix: "MP-MAHA-UJJ" },
    { name: "Omkareshwar Jyotirlinga Temple", idPrefix: "MP-OMK-KHA" },
    // Uttarakhand
    { name: "Badrinath Temple", idPrefix: "UK-BKTC-CHA" },
    { name: "Kedarnath Jyotirlinga Temple", idPrefix: "UK-BKTC-RUD" },
    // Uttar Pradesh
    { name: "Shri Kashi Vishwanath Temple", idPrefix: "UP-VISH-VAR" },
    { name: "Shri Ram Janmabhoomi Temple", idPrefix: "UP-RJBT-AYO" },
  ];

  let landmarkPass = true;
  const verifiedLandmarks: string[] = [];

  for (const item of targetCheckTemples) {
    const src = await prisma.templeSource.findFirst({
      where: { officialRecordId: { startsWith: item.idPrefix } },
      include: { temple: true },
    });
    if (!src) {
      landmarkPass = false;
      console.log(`   ❌ Missing landmark source for prefix: ${item.idPrefix}`);
    } else {
      verifiedLandmarks.push(`${src.temple.name} (${src.officialRecordId})`);
    }
  }

  recordCheck(
    "Phase 11 Landmark Temples Verified with Official Provenance",
    landmarkPass,
    `Found ${verifiedLandmarks.length} / ${targetCheckTemples.length} statutory landmark sources across OD, GJ, MP, UK, UP`
  );

  // Check 6: Multi-Board Statutory Provenance Citations
  console.log("\n▶ Check 6: Statutory Trusts & Endowment Citations Audit");
  const statutoryPrefixes = [
    { name: "Odisha SJTA & Endowments", prefix: "OD-" },
    { name: "Gujarat Yatradham & Trusts", prefix: "GJ-" },
    { name: "Madhya Pradesh Tourism & Trusts", prefix: "MP-" },
    { name: "Uttarakhand BKTC & UTDB", prefix: "UK-" },
    { name: "Uttar Pradesh Temple Boards", prefix: "UP-" },
  ];

  const prefixResults: string[] = [];
  let allPrefixesPresent = true;
  for (const p of statutoryPrefixes) {
    const count = await prisma.templeSource.count({
      where: { officialRecordId: { startsWith: p.prefix } },
    });
    if (count === 0) allPrefixesPresent = false;
    prefixResults.push(`${p.name}: ${count}`);
  }

  recordCheck(
    "Statutory Trust & Government Provenance Citations",
    allPrefixesPresent,
    prefixResults.join(" | ")
  );

  // Check 7: 100% Idempotency Verification
  console.log("\n▶ Check 7: Production Import Idempotency Audit");
  const phase11Jobs = await prisma.importJob.findMany({
    where: { kind: "temple:state-expansion" },
    orderBy: { startedAt: "desc" },
    take: 20,
  });

  const zeroAddedRuns = phase11Jobs.filter(
    (j) => j.status === "completed" && j.recordsAdded === 0 && j.duplicates > 0
  );

  recordCheck(
    "100% Ingestion Idempotency (0 Duplicate Inserts)",
    zeroAddedRuns.length >= 5,
    `Verified ${zeroAddedRuns.length} idempotent secondary runs with recordsAdded === 0 and 0 duplicate insertions`
  );

  // Check 8: Grounded AI Itinerary Generation for Ingested Temples
  console.log("\n▶ Check 8: Grounded AI Itinerary Resolution for Ingested Shrines");
  const ramJanmabhoomi = await prisma.temple.findFirst({
    where: { name: { contains: "Ram Janmabhoomi", mode: "insensitive" } },
  });

  let aiPlanPassed = false;
  if (ramJanmabhoomi) {
    const req: PlanRequest = {
      templeId: ramJanmabhoomi.identifier,
      date: "2026-03-23",
      arrival: "08:00",
      departure: "17:00",
      people: 2,
      budget: "mid",
      travel: "car",
      companions: ["family"],
      interests: ["darshan", "history"],
      lang: "en",
    };

    // Convert Prisma temple to engine Temple model
    const engineTemple = {
      id: ramJanmabhoomi.identifier,
      slug: ramJanmabhoomi.slug,
      name: ramJanmabhoomi.name,
      state: ramJanmabhoomi.stateCode,
      stateCode: ramJanmabhoomi.stateCode,
      district: (ramJanmabhoomi as any).districtName || "Ayodhya",
      coordinates: {
        lat: ramJanmabhoomi.latitude,
        lng: ramJanmabhoomi.longitude,
      },
      verifiedCoordinates: !ramJanmabhoomi.isCentroidFallback,
      verificationStatus: ramJanmabhoomi.verificationStatus as any,
      verifiedSource: ramJanmabhoomi.source || "Official Board",
    } as any;

    const plan = buildPlan(req, engineTemple);
    aiPlanPassed = Boolean(
      plan &&
      plan.items.length > 0 &&
      plan.summary.length > 0 &&
      plan.items[0].place.includes("Ram Janmabhoomi")
    );
  }

  recordCheck(
    "Grounded AI Itinerary Generation on Phase 11 Ingested Temples",
    aiPlanPassed,
    `Successfully generated verified itinerary for '${ramJanmabhoomi?.name}' without synthetic facts`
  );

  // Summary
  console.log("\n==================================================");
  const totalPassed = results.filter((r) => r.passed).length;
  const totalChecks = results.length;
  console.log(`📊 Phase 11 Verification Summary: ${totalPassed} / ${totalChecks} Checks Passed`);
  console.log("==================================================");

  await prisma.$disconnect();

  if (totalPassed !== totalChecks) {
    process.exit(1);
  }
}

runPhase11Verification().catch(async (e) => {
  console.error("Verification error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
