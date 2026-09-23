/**
 * DEVYATRA / TEMPLEORA — PHASE 22 VERIFICATION SUITE
 * SEO + Discovery + Organic Growth Infrastructure Audit
 *
 * Run: npx tsx scripts/verify_phase22.ts
 */

import { existsSync, readFileSync } from "node:fs";
import { SACRED_COLLECTIONS, getSacredCollection } from "../src/lib/discovery/collections";

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

async function runPhase22Verification() {
  console.log("==================================================================");
  console.log("🇮🇳 DEVYATRA / TEMPLEORA — PHASE 22 VERIFICATION");
  console.log("SEO + Discovery + Organic Growth Infrastructure Audit");
  console.log("==================================================================\n");

  // ─────────────────────────────────────────────────────────────
  // 1. SACRED THEMATIC COLLECTIONS
  // ─────────────────────────────────────────────────────────────
  section("1. Sacred Thematic Collections Engine");
  {
    if (SACRED_COLLECTIONS.length >= 4) {
      ok(`Collections Registry: ${SACRED_COLLECTIONS.length} canonical collections indexed`);
    } else {
      fail(`Collections count below threshold: ${SACRED_COLLECTIONS.length}`);
    }

    const jyotirlinga = getSacredCollection("12-jyotirlingas");
    if (jyotirlinga && jyotirlinga.templeCount === 12 && jyotirlinga.epigraphicalEvidence.includes("Shiva Purana")) {
      ok("Jyotirlinga Collection: Verified with Shiva Purana epigraphical backing and 12 shrines");
    } else {
      fail("Jyotirlinga collection missing or lacks scriptural citation");
    }

    const panchaBhoota = getSacredCollection("pancha-bhoota-sthalams");
    if (panchaBhoota && panchaBhoota.templeCount === 5 && panchaBhoota.epigraphicalEvidence.includes("Thevaram")) {
      ok("Pancha Bhoota Collection: Verified with Thevaram epigraphical evidence (5 elements)");
    } else {
      fail("Pancha Bhoota collection missing or lacks citation");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. SITEMAP & DISCOVERY SCALABILITY
  // ─────────────────────────────────────────────────────────────
  section("2. Dynamic Sitemap Scalability");
  {
    const sitemapSrc = readFileSync("src/app/sitemap.ts", "utf8");
    if (sitemapSrc.includes("SACRED_COLLECTIONS") && sitemapSrc.includes("SACRED_CIRCUITS")) {
      ok("Sitemap Integration: Thematic collections & pilgrimage circuits included in dynamic XML");
    } else {
      fail("Sitemap does not include collections or circuits");
    }

    if (sitemapSrc.includes("https://templeora.vercel.app")) {
      ok("Sitemap Canonical Domain: Targets production domain https://templeora.vercel.app");
    } else {
      fail("Sitemap targets incorrect domain");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. STRUCTURED DATA & CANONICAL ENFORCEMENT
  // ─────────────────────────────────────────────────────────────
  section("3. Structured Data (Schema.org) Enforcement");
  {
    const templePageSrc = readFileSync("src/app/temples/[state]/[slug]/page.tsx", "utf8");
    if (
      templePageSrc.includes('"@type": "HinduTemple"') &&
      templePageSrc.includes("deity: temple.mainDeity") &&
      templePageSrc.includes("sameAs")
    ) {
      ok("JSON-LD Rich Snippet: HinduTemple schema enriched with deity, canonical URL, and statutory sameAs");
    } else {
      fail("HinduTemple JSON-LD missing enriched fields");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4. DOCUMENTATION DELIVERABLES
  // ─────────────────────────────────────────────────────────────
  section("4. Documentation Deliverables Check");
  {
    const docs = [
      "docs/PHASE_22_COMPLETION_REPORT.md",
      "docs/SEO_ARCHITECTURE.md",
      "docs/INDEXABILITY_REPORT.md",
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
  console.log(`${BOLD}PHASE 22 VERIFICATION: ${passed}/${total} CHECKS PASSED${RESET}`);
  if (failed === 0) {
    console.log(`${GREEN}${BOLD}🏆 ALL CHECKS PASSED — PHASE 22 COMPLETE${RESET}`);
  } else {
    console.log(`${RED}${BOLD}❌ ${failed} CHECK(S) FAILED:${RESET}`);
    failures.forEach((f) => console.log(`  ${RED}• ${f}${RESET}`));
    process.exit(1);
  }
}

runPhase22Verification().catch((err) => {
  console.error("Phase 22 verification crashed:", err);
  process.exit(1);
});
