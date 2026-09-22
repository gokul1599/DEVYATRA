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
  console.log("🇮🇳 PHASE 11 DISTRICT COVERAGE DELTA AUDIT");
  console.log("==================================================");
  console.log(`Total States: ${matrix.totalStates}`);
  console.log(`Total Temples in Matrix: ${matrix.totalTemples}`);
  console.log(`Total Verified Temples: ${matrix.totalVerifiedTemples}`);
  console.log(`Total Official LGD Districts: ${matrix.totalOfficialDistricts}`);
  console.log(`Total Represented Districts: ${matrix.totalRepresentedDistricts}`);
  console.log(`National District Coverage: ${matrix.nationalDistrictCoveragePercent}% (${matrix.totalRepresentedDistricts}/${matrix.totalOfficialDistricts})`);
  console.log("--------------------------------------------------");
  if (matrix.totalRepresentedDistricts >= 551) {
    console.log(`🎉 60%+ NATIONAL DISTRICT MILESTONE ACHIEVED! (${matrix.totalRepresentedDistricts}/${matrix.totalOfficialDistricts} = ${matrix.nationalDistrictCoveragePercent}%)`);
  } else {
    console.log(`Current: ${matrix.totalRepresentedDistricts}/${matrix.totalOfficialDistricts} (${matrix.nationalDistrictCoveragePercent}%). Need ${551 - matrix.totalRepresentedDistricts} more to reach 60%.`);
  }
  console.log("--------------------------------------------------");

  const phase13States = ["CG", "JH", "JK", "LA", "GA", "TS"];
  console.log("Target Phase 13 State Breakdown:");
  for (const s of matrix.states) {
    if (phase13States.includes(s.code)) {
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
