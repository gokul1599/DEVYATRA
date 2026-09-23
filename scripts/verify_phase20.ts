/**
 * DEVYATRA / TEMPLEORA — PHASE 20 VERIFICATION SUITE
 * National Temple Data Depth + Source Expansion Audit
 *
 * Run: npx tsx scripts/verify_phase20.ts
 */

import { existsSync, readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { MONITORED_SOURCES, prioritizeExpansionQueue } from "../src/lib/importer/expansion";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function ok(label: string) {
  console.log(`${GREEN}  ✔${RESET} ${label}`);
  passed++;
}
function fail(label: string, detail?: string) {
  console.log(`${RED}  ✘${RESET} ${label}`);
  if (detail) console.log(`    ${YELLOW}→ ${detail}${RESET}`);
  failed++;
  failures.push(label);
}
function section(title: string) {
  console.log(`\n${CYAN}${BOLD}▶ ${title}${RESET}`);
}

async function runPhase20Verification() {
  console.log("==================================================================");
  console.log("🇮🇳 DEVYATRA / TEMPLEORA — PHASE 20 VERIFICATION");
  console.log("National Temple Data Depth + Source Expansion Audit");
  console.log("==================================================================\n");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    // ─────────────────────────────────────────────────────────────
    // 1. NATIONAL COVERAGE & DISTRICT DEPTH
    // ─────────────────────────────────────────────────────────────
    section("1. Live Database Coverage Depth");
    const totalTemples = await prisma.temple.count();
    if (totalTemples >= 2000) {
      ok(`Catalog Size: ${totalTemples} temples stored (≥ 2,000 threshold met)`);
    } else {
      fail(`Catalog size below threshold: ${totalTemples}`);
    }

    const centroidCount = await prisma.temple.count({ where: { isCentroidFallback: true } });
    if (centroidCount === 0) {
      ok(`Zero Centroid Coordinates: ${centroidCount} centroid fallbacks found`);
    } else {
      fail(`Found ${centroidCount} centroid fallback temples`);
    }

    const stateCount = (await prisma.temple.groupBy({ by: ["stateCode"], _count: true })).length;
    if (stateCount === 36) {
      ok(`Pan-India Coverage: 36/36 States & UTs represented in database`);
    } else {
      fail(`Incomplete states coverage: ${stateCount}/36`);
    }

    const districtCount = (await prisma.temple.groupBy({ by: ["districtId"], _count: true })).length;
    if (districtCount >= 700) {
      ok(`District Breadth: ${districtCount} administrative districts covered (≥ 700 threshold met)`);
    } else {
      fail(`District coverage insufficient: ${districtCount}`);
    }

    // ─────────────────────────────────────────────────────────────
    // 2. DATA DEPTH ENGINE & ARTIFACTS
    // ─────────────────────────────────────────────────────────────
    section("2. Data Depth Engine & Prioritization Pipeline");
    {
      const depthEngineExists = existsSync("src/lib/coverage/depth.ts");
      if (depthEngineExists) {
        ok("Depth Scoring Engine: src/lib/coverage/depth.ts exists");
      } else {
        fail("src/lib/coverage/depth.ts missing");
      }

      const expansionEngineExists = existsSync("src/lib/importer/expansion.ts");
      if (expansionEngineExists) {
        ok("Source Expansion Engine: src/lib/importer/expansion.ts exists");
      } else {
        fail("src/lib/importer/expansion.ts missing");
      }

      if (MONITORED_SOURCES.length >= 5) {
        ok(`Monitored Statutory Sources: ${MONITORED_SOURCES.length} provenance sources indexed with review cycles`);
      } else {
        fail(`Monitored sources count below threshold: ${MONITORED_SOURCES.length}`);
      }

      // Test prioritization queue logic
      const sample = [
        { stateCode: "OR", stateName: "Odisha", districtId: "d1", districtName: "Nuapada", templeCount: 0, verifiedCount: 0 },
        { stateCode: "TN", stateName: "Tamil Nadu", districtId: "d2", districtName: "Madurai", templeCount: 15, verifiedCount: 15 },
      ];
      const prioritized = prioritizeExpansionQueue(sample);
      if (prioritized[0].districtName === "Nuapada" && prioritized[0].priorityScore > prioritized[1].priorityScore) {
        ok("Smart Prioritization Queue: Correctly scores unrepresented districts first");
      } else {
        fail("Prioritization queue failed ranking test");
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 3. DOCUMENTATION DELIVERABLES
    // ─────────────────────────────────────────────────────────────
    section("3. Documentation Deliverables Check");
    {
      const docs = [
        "docs/PHASE_20_COMPLETION_REPORT.md",
        "docs/NATIONAL_DATA_DEPTH_REPORT.md",
        "docs/COVERAGE_GAP_REPORT.md",
        "docs/NEXT_SOURCE_EXPANSION_QUEUE.md",
      ];
      for (const d of docs) {
        if (existsSync(d)) {
          ok(`Documentation Verified: ${d}`);
        } else {
          fail(`Missing deliverable: ${d}`);
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────────────────────
    const total = passed + failed;
    console.log(`\n${BOLD}${"═".repeat(65)}${RESET}`);
    console.log(`${BOLD}PHASE 20 VERIFICATION: ${passed}/${total} CHECKS PASSED${RESET}`);
    if (failed === 0) {
      console.log(`${GREEN}${BOLD}🏆 ALL CHECKS PASSED — PHASE 20 COMPLETE${RESET}`);
    } else {
      console.log(`${RED}${BOLD}❌ ${failed} CHECK(S) FAILED:${RESET}`);
      failures.forEach((f) => console.log(`  ${RED}• ${f}${RESET}`));
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

runPhase20Verification().catch((err) => {
  console.error("Phase 20 verification crashed:", err);
  process.exit(1);
});
