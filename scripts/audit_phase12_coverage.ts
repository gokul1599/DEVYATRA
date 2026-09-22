import { existsSync } from "node:fs";
import { getNationalCoverageMatrix } from "../src/lib/coverage/matrix";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

async function runCoverageAudit() {
  const matrix = await getNationalCoverageMatrix();
  if (!matrix) {
    console.error("Failed to load coverage matrix");
    process.exit(1);
  }

  console.log("==================================================");
  console.log("🇮🇳 PHASE 12 DISTRICT COVERAGE DELTA AUDIT");
  console.log("==================================================");
  console.log(`Total States: ${matrix.totalStates}`);
  console.log(`Total Temples in Matrix: ${matrix.totalTemples}`);
  console.log(`Total Verified Temples: ${matrix.totalVerifiedTemples}`);
  console.log(`Total Official LGD Districts: ${matrix.totalOfficialDistricts}`);
  console.log(`Total Represented Districts: ${matrix.totalRepresentedDistricts}`);
  console.log(`National District Coverage: ${matrix.nationalDistrictCoveragePercent}% (${matrix.totalRepresentedDistricts}/${matrix.totalOfficialDistricts})`);
  console.log("--------------------------------------------------");

  const phase12States = ["WB", "BR", "HP", "AS", "TR", "MN", "ML", "AR", "PB", "HR"];
  console.log("Target Phase 12 State Breakdown:");
  for (const s of matrix.states) {
    if (phase12States.includes(s.code)) {
      console.log(`\nState: ${s.name} (${s.code})`);
      console.log(`  Districts: ${s.representedDistricts} / ${s.totalDistricts} (${s.coveragePercent}%)`);
      console.log(`  Temples: ${s.templeCount} (Verified: ${s.verifiedCount}, Pending: ${s.pendingCount})`);
      console.log(`  Status: ${s.status}`);
      const withTemples = s.districts.filter(d => d.templesFound > 0);
      console.log(`  Represented Districts List (${withTemples.length}): ${withTemples.map(d => `${d.name} (${d.templesFound})`).join(", ")}`);
    }
  }
}

runCoverageAudit().catch(console.error);
