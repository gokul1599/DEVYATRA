import { existsSync } from "node:fs";
import { getNationalCoverageMatrix } from "../src/lib/coverage/matrix";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("No DATABASE_URL");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const matrix = await getNationalCoverageMatrix();
  if (!matrix) {
    console.error("Failed to load matrix");
    process.exit(1);
  }

  console.log("==================================================");
  console.log("🇮🇳 PHASE 13 PRE-EXPANSION COVERAGE GAP AUDIT");
  console.log("==================================================");
  console.log(`Total Temples: ${matrix.totalTemples}`);
  console.log(`Represented Districts: ${matrix.totalRepresentedDistricts} / ${matrix.totalOfficialDistricts} (${matrix.nationalDistrictCoveragePercent}%)`);
  console.log(`Target 60% Milestone: 551 / 917 (Delta required: +${551 - matrix.totalRepresentedDistricts} districts)`);
  console.log("--------------------------------------------------");

  const list = matrix.states.map((s) => {
    const unrep = Math.max(0, s.totalDistricts - s.representedDistricts);
    return {
      code: s.code,
      name: s.name,
      totalDistricts: s.totalDistricts,
      representedDistricts: s.representedDistricts,
      unrepresentedDistricts: unrep,
      coveragePercent: s.coveragePercent,
      templeCount: s.templeCount,
      verifiedCount: s.verifiedCount,
      status: s.status,
    };
  }).sort((a, b) => b.unrepresentedDistricts - a.unrepresentedDistricts);

  console.log("Code | State Name               | Total | Rep | Unrep | Cov % | Temples | Status");
  console.log("--------------------------------------------------------------------------------");
  for (const s of list) {
    console.log(
      `${s.code.padEnd(4)} | ${s.name.padEnd(24)} | ${String(s.totalDistricts).padStart(5)} | ${String(s.representedDistricts).padStart(3)} | ${String(s.unrepresentedDistricts).padStart(5)} | ${String(s.coveragePercent).padStart(4)}% | ${String(s.templeCount).padStart(7)} | ${s.status}`
    );
  }

  console.log("\n--- UNREPRESENTED DISTRICTS IN CANDIDATE STATES ---");
  const candidates = ["CG", "JH", "JK", "LA", "GA", "TG"];
  for (const code of candidates) {
    const st = matrix.states.find((s) => s.code === code);
    if (!st) {
      console.log(`State not found in matrix: ${code}`);
      continue;
    }
    const emptyDistricts = st.districts.filter((d) => d.templesFound === 0);
    console.log(`\nState ${st.name} (${st.code}): ${emptyDistricts.length} unrepresented districts:`);
    console.log(emptyDistricts.map((d) => `${d.name} (${(d as any).lgdCode || "no-lgd"})`).join(", "));
  }

  await prisma.$disconnect();
}

main().catch(console.error);
