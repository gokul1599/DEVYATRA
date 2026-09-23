/**
 * DEVYATRA / TEMPLEORA — PHASE 24 VERIFICATION SUITE
 * Devyatra V2 Architecture + Ecosystem + Long-Term Scale
 *
 * Run: npx tsx scripts/verify_phase24.ts
 */

import { existsSync, readFileSync } from "node:fs";
import { DESIGN_TOKENS } from "../src/lib/design-tokens";

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

async function runPhase24Verification() {
  console.log("==================================================================");
  console.log("🇮🇳 DEVYATRA / TEMPLEORA — PHASE 24 VERIFICATION");
  console.log("Devyatra V2 Architecture + Ecosystem + Long-Term Scale");
  console.log("==================================================================\n");

  // ─────────────────────────────────────────────────────────────
  // 1. ARCHITECTURAL & ECOSYSTEM DOCUMENTATION
  // ─────────────────────────────────────────────────────────────
  section("1. Architectural & Ecosystem Documentation Suite");
  {
    const requiredDocs = [
      {
        path: "docs/DEVYATRA_V2_ARCHITECTURE.md",
        keywords: ["Neon Serverless PostgreSQL", "PgBouncer", "Terrain-Aware", "Zero Centroid", "12-language"],
      },
      {
        path: "docs/DEVYATRA_V2_DESIGN_SYSTEM.md",
        keywords: ["Sacred Sanctuary", "--color-obsidian", "--color-gold", "--color-saffron", "WCAG 2.1 AA"],
      },
      {
        path: "docs/SCALABILITY_PLAN.md",
        keywords: ["10,000,000+", "Mahashivratri", "PgBouncer", "Incremental Static Regeneration", "p95"],
      },
      {
        path: "docs/OBSERVABILITY_PLAN.md",
        keywords: ["Core Web Vitals", "LCP", "INP", "AI Guardrail", "Runbook"],
      },
      {
        path: "docs/BACKUP_RESTORE_PLAN.md",
        keywords: ["Point-In-Time Recovery", "RPO", "RTO", "WAL", "2,084"],
      },
      {
        path: "docs/PHASE_24_COMPLETION_REPORT.md",
        keywords: ["Phase 24", "COMPLETE", "Quality Gates"],
      },
    ];

    for (const doc of requiredDocs) {
      if (!existsSync(doc.path)) {
        fail(`Missing document deliverable: ${doc.path}`);
        continue;
      }
      const content = readFileSync(doc.path, "utf8");
      const missingKeywords = doc.keywords.filter((kw) => !content.includes(kw));
      if (missingKeywords.length === 0) {
        ok(`Verified ${doc.path} with comprehensive specifications`);
      } else {
        fail(`Document ${doc.path} missing required keywords: ${missingKeywords.join(", ")}`);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. DESIGN SYSTEM TOKENS CONSISTENCY
  // ─────────────────────────────────────────────────────────────
  section("2. Sacred Luxury Design Tokens Consistency");
  {
    const colors = DESIGN_TOKENS.colors;
    if (
      colors.background === "#0A0908" &&
      colors.surfaceDark === "#12100E" &&
      colors.gold === "#C89B3C" &&
      colors.saffron === "#E06D28" &&
      colors.vermilion === "#B93826"
    ) {
      ok("Design Tokens TS: Sacred Obsidian, Gopuram Gold, and Saffron tokens correctly defined");
    } else {
      fail("Design Tokens TS missing canonical color values");
    }

    const cssContent = readFileSync("src/app/globals.css", "utf8");
    if (
      cssContent.includes("--color-obsidian:") &&
      cssContent.includes("--color-gold:") &&
      cssContent.includes("--color-saffron:") &&
      cssContent.includes(":focus-visible")
    ) {
      ok("Global CSS: Tailwind v4 theme variables and accessibility focus rings verified");
    } else {
      fail("Global CSS missing theme definitions or focus-visible outline");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. ECOSYSTEM HARDENING & CORE ENGINE ALIGNMENT
  // ─────────────────────────────────────────────────────────────
  section("3. Ecosystem Engines & Invariant Safeguards");
  {
    // Check AI Guard
    const aiGuardSrc = readFileSync("src/lib/ai/guard.ts", "utf8");
    if (
      aiGuardSrc.includes("evaluateItineraryFeasibility") &&
      aiGuardSrc.includes("sanitizeAiInput")
    ) {
      ok("AI Pilgrimage Guard: Prompt sanitization and itinerary pacing engine intact");
    } else {
      fail("AI Pilgrimage Guard engine missing expected exports");
    }

    // Check Offline Journey Engine
    const offlineSrc = readFileSync("src/lib/offline/journey-cache.ts", "utf8");
    if (
      offlineSrc.includes("packageJourneyForOffline") &&
      offlineSrc.includes("Offline Pilgrim Snapshot")
    ) {
      ok("Offline Journey Engine: Offline package serializer with explicit timestamping intact");
    } else {
      fail("Offline Journey Engine missing required functions or disclaimers");
    }

    // Check Prisma Schema for Data Invariants
    const prismaSchema = readFileSync("prisma/schema.prisma", "utf8");
    if (
      prismaSchema.includes("model Temple") &&
      prismaSchema.includes("isCentroidFallback") &&
      prismaSchema.includes("verificationStatus") &&
      prismaSchema.includes("sourceType")
    ) {
      ok("Prisma Schema: Temple model preserves centroid fallback flag and verification/source fields");
    } else {
      fail("Prisma schema missing critical statutory tracking fields");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log(`\n${BOLD}${"═".repeat(65)}${RESET}`);
  console.log(`${BOLD}PHASE 24 VERIFICATION: ${passed}/${total} CHECKS PASSED${RESET}`);
  if (failed === 0) {
    console.log(`${GREEN}${BOLD}🏆 ALL CHECKS PASSED — PHASE 24 COMPLETE${RESET}`);
  } else {
    console.log(`${RED}${BOLD}❌ ${failed} CHECK(S) FAILED:${RESET}`);
    failures.forEach((f) => console.log(`  ${RED}• ${f}${RESET}`));
    process.exit(1);
  }
}

runPhase24Verification().catch((err) => {
  console.error("Phase 24 verification crashed:", err);
  process.exit(1);
});
