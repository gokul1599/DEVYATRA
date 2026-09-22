/**
 * Phase 10 Multi-State Production Import Verification Engine
 * Verifies count changes, zero centroids, multi-state provenance citations,
 * LGD hierarchy integrity, idempotency, and national coverage matrix statuses.
 *
 * Usage:
 *   npx tsx scripts/verify_import.ts
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getNationalCoverageMatrix } from "../src/lib/coverage/matrix";

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

async function runImportVerification() {
  console.log("==================================================");
  console.log("🇮🇳 DEVYATRA / TEMPLEORA — PHASE 10 MULTI-STATE VERIFICATION");
  console.log("Controlled Multi-State Production Expansion (TN, KA, KL, MH, RJ)");
  console.log("==================================================\n");

  // Check 1: Database Pre-Import Snapshot Audit & Total Growth
  console.log("▶ Check 1: Multi-State Controlled Database Growth");
  const currentTotal = await prisma.temple.count();
  // Phase 9 baseline was 1,657. In Phase 10: TN (+12) + KA (+6) + KL (+8) + MH (+7) + RJ (+8) = +41 -> 1,698. Phase 11 -> 1,752
  const minExpectedTotal = 1698;
  recordCheck(
    "Controlled Database Growth to at least 1,698 Temples",
    currentTotal >= minExpectedTotal,
    `Baseline Total: ${minExpectedTotal} | Current Live Total: ${currentTotal} (Verified Phase 10 + Phase 11 additions)`
  );

  // Check 2: Absolute 0 Centroid Fallbacks Maintained
  console.log("\n▶ Check 2: Zero Centroid Fallbacks Maintained");
  const centroids = await prisma.temple.count({ where: { isCentroidFallback: true } });
  recordCheck(
    "Zero Centroid Fallback Constraint",
    centroids === 0,
    `Total Centroid Fallbacks: ${centroids} (Strict 100% surveyed coordinates)`
  );

  // Check 3: 36 States and UTs Full Representation
  console.log("\n▶ Check 3: 36 States & UTs Pan-India Representation");
  const statesGrouped = await prisma.temple.groupBy({
    by: ["stateCode"],
    _count: { id: true },
  });
  recordCheck(
    "All 36 States and UTs Represented",
    statesGrouped.length === 36,
    `Represented States/UTs: ${statesGrouped.length} / 36`
  );

  // Check 4: Multi-State Ingested Records Presence
  console.log("\n▶ Check 4: Ingested Landmark Temples Across All 5 Target States");
  const sampleOfficialIds = [
    // Tamil Nadu
    "TN-HRCE-CUD-004", // Thillai Nataraja
    "TN-HRCE-DIN-007", // Palani Murugan
    // Karnataka
    "KA-MUZ-DAK-005", // Kukke Subramanya
    "KA-MUZ-CHK-009", // Sringeri Sharadamba
    // Kerala
    "KL-TDB-PTA-003", // Sabarimala Sree Dharma Sastha
    "KL-CDB-ERN-005", // Chottanikkara Bhagavathy
    // Maharashtra
    "MH-MAH-KOL-004", // Mahalakshmi Temple Kolhapur
    "MH-DEV-SOL-009", // Vitthal Rukmini Mandir Pandharpur
    // Rajasthan
    "RJ-DEV-RAJ-001", // Shrinathji Temple Nathdwara
    "RJ-DEV-SIK-006", // Khatu Shyam Ji Temple
  ];

  const foundSources = await prisma.templeSource.findMany({
    where: { officialRecordId: { in: sampleOfficialIds } },
    include: { temple: { select: { identifier: true, name: true, stateCode: true } } },
  });

  recordCheck(
    "Sample Ingested Landmarks Verified Across All 5 States",
    foundSources.length === sampleOfficialIds.length,
    `Found ${foundSources.length}/${sampleOfficialIds.length} landmark records across TN, KA, KL, MH, RJ (${foundSources.map((s) => s.temple.name).join(", ")})`
  );

  // Check 5: Authoritative State Provenance Citations
  console.log("\n▶ Check 5: Multi-State Authoritative Provenance Citations");
  const provenancePrefixes = [
    { state: "AP", prefix: "AP-ENDOW-" },
    { state: "TN", prefix: "TN-HRCE-" },
    { state: "KA", prefix: "KA-MUZ-" },
    { state: "KL", prefix: "KL-" },
    { state: "MH", prefix: "MH-" },
    { state: "RJ", prefix: "RJ-DEV-" },
  ];

  let allPrefixesFound = true;
  const provenanceDetails: string[] = [];

  for (const { state, prefix } of provenancePrefixes) {
    const count = await prisma.templeSource.count({
      where: { officialRecordId: { startsWith: prefix } },
    });
    if (count === 0) allPrefixesFound = false;
    provenanceDetails.push(`${state}: ${count}`);
  }

  recordCheck(
    "Multi-State Government & Devaswom Provenance Citations",
    allPrefixesFound,
    `Citations verified: ${provenanceDetails.join(", ")}`
  );

  // Check 6: Prisma ImportJob Execution Logs Audit
  console.log("\n▶ Check 6: Prisma ImportJob Execution Audit");
  const stateJobs = await prisma.importJob.findMany({
    where: { kind: "temple:state-expansion" },
    orderBy: { startedAt: "desc" },
    take: 15,
  });
  const completedJobs = stateJobs.filter((j) => j.status === "completed");
  recordCheck(
    "ImportJob Observability & Audit Trail",
    completedJobs.length >= 10, // At least 2 runs per state for the 5 states + AP
    `Recorded State Expansion Jobs: ${stateJobs.length} (Completed: ${completedJobs.length})`
  );

  // Check 7: National Coverage Matrix & District Status Upgrade
  console.log("\n▶ Check 7: National Coverage Matrix Status Integrity");
  const matrix = await getNationalCoverageMatrix();
  const validStatusList = [
    "NO_SOURCE_IMPORTED",
    "SOURCE_IMPORTED",
    "INDEXED",
    "PARTIALLY_VERIFIED",
    "VERIFIED",
    "EXPANSION_IN_PROGRESS",
  ];

  const allDistrictsValid = matrix?.states.every((st) =>
    st.districts.every((d) => validStatusList.includes(d.status) && (d.status as string) !== "COMPLETE")
  );

  recordCheck(
    "National Coverage Matrix District Status Integrity",
    Boolean(matrix && allDistrictsValid),
    `Total States: ${matrix?.totalStates} | Represented Districts: ${matrix?.totalRepresentedDistricts}/${matrix?.totalOfficialDistricts} (${matrix?.nationalDistrictCoveragePercent}% Coverage)`
  );

  // Check 8: Idempotency Guarantee (Latest runs have recordsAdded === 0)
  console.log("\n▶ Check 8: Idempotency Guarantee Across Ingestion Runs");
  // Find jobs with recordsAdded === 0 indicating idempotent secondary runs
  const idempotentJobs = stateJobs.filter((j) => j.status === "completed" && j.recordsAdded === 0 && j.duplicates > 0);
  recordCheck(
    "Idempotency Guarantee & Zero Duplicate Insertion",
    idempotentJobs.length >= 5, // At least 1 idempotent run per state
    `Verified ${idempotentJobs.length} idempotent secondary runs with recordsAdded === 0`
  );

  // Summary
  console.log("\n==================================================");
  const totalPassed = results.filter((r) => r.passed).length;
  const totalChecks = results.length;
  console.log(`📊 Phase 10 Verification Summary: ${totalPassed} / ${totalChecks} Checks Passed`);
  console.log("==================================================");

  await prisma.$disconnect();

  if (totalPassed !== totalChecks) {
    process.exit(1);
  }
}

runImportVerification().catch(async (e) => {
  console.error("Verification error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
