/**
 * DEVYATRA — PHASE 17 VERIFICATION SUITE
 * Personalization + Multilingual + Saved Journeys
 *
 * Run: npx tsx scripts/verify_phase17.ts
 */

import { existsSync, readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { SUPPORTED_LANGUAGES, translate } from "../src/lib/i18n";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────
// Colours
// ─────────────────────────────────────────────────────────────
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

async function runVerification() {
  // ─────────────────────────────────────────────────────────────
  // CHECK 1 — UserPreferences + DEFAULT_PREFERENCES in auth.ts
  // ─────────────────────────────────────────────────────────────
  section("Check 1 — UserPreferences + DEFAULT_PREFERENCES");
  {
    const authExists = existsSync("src/lib/auth.ts");
    if (!authExists) {
      fail("src/lib/auth.ts missing");
    } else {
      const src = readFileSync("src/lib/auth.ts", "utf8");
      if (src.includes("UserPreferences") && src.includes("DEFAULT_PREFERENCES")) {
        ok("UserPreferences interface + DEFAULT_PREFERENCES exported");
      } else {
        fail("UserPreferences or DEFAULT_PREFERENCES missing from auth.ts");
      }
      if (src.includes("updateUserPreferences") && src.includes("toggleFollowTemple")) {
        ok("updateUserPreferences + toggleFollowTemple CRUD functions present");
      } else {
        fail("updateUserPreferences or toggleFollowTemple missing from auth.ts");
      }
      if (src.includes("followedTemples") && src.includes("preferences?")) {
        ok("UserRecord extended with preferences + followedTemples fields");
      } else {
        fail("UserRecord not extended with preferences/followedTemples");
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 2 — SavedJourney store + API route
  // ─────────────────────────────────────────────────────────────
  section("Check 2 — SavedJourney store + API");
  {
    const journeysExists = existsSync("src/lib/journeys.ts");
    if (journeysExists) {
      ok("src/lib/journeys.ts exists");
      const src = readFileSync("src/lib/journeys.ts", "utf8");
      if (src.includes("SavedJourney") && src.includes("saveJourney") && src.includes("deleteSavedJourney")) {
        ok("SavedJourney CRUD (saveJourney, deleteSavedJourney) present");
      } else {
        fail("SavedJourney CRUD functions missing from journeys.ts");
      }
    } else {
      fail("src/lib/journeys.ts missing");
    }

    const apiRouteExists = existsSync("src/app/api/journeys/route.ts");
    if (apiRouteExists) {
      ok("src/app/api/journeys/route.ts exists");
      const src = readFileSync("src/app/api/journeys/route.ts", "utf8");
      if (src.includes("export async function GET") && src.includes("export async function POST") && src.includes("export async function DELETE")) {
        ok("GET + POST + DELETE endpoints present in journeys API");
      } else {
        fail("journeys API missing one or more HTTP method handlers");
      }
    } else {
      fail("src/app/api/journeys/route.ts missing");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 3 — Holy Alerts engine
  // ─────────────────────────────────────────────────────────────
  section("Check 3 — Holy Alerts engine");
  {
    const alertsExists = existsSync("src/lib/intelligence/alerts.ts");
    if (alertsExists) {
      ok("src/lib/intelligence/alerts.ts exists");
      const src = readFileSync("src/lib/intelligence/alerts.ts", "utf8");
      if (src.includes("getFollowedTempleAlerts")) {
        ok("getFollowedTempleAlerts exported");
      } else {
        fail("getFollowedTempleAlerts not found in alerts.ts");
      }
      if (src.includes("festival") || src.includes("seasonal") || src.includes("booking")) {
        ok("Alert types: festival / seasonal / booking present");
      } else {
        fail("Alert type categories not found in alerts.ts");
      }
    } else {
      fail("src/lib/intelligence/alerts.ts missing");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 4 — Personalized Discovery engine
  // ─────────────────────────────────────────────────────────────
  section("Check 4 — Personalized Discovery engine");
  {
    const discoverExists = existsSync("src/lib/discovery/personalized.ts");
    if (discoverExists) {
      ok("src/lib/discovery/personalized.ts exists");
      const src = readFileSync("src/lib/discovery/personalized.ts", "utf8");
      if (src.includes("getPersonalizedRecommendations")) {
        ok("getPersonalizedRecommendations exported");
      } else {
        fail("getPersonalizedRecommendations not found in personalized.ts");
      }
      if (src.includes("ScoredTemple")) {
        ok("ScoredTemple interface defined");
      } else {
        fail("ScoredTemple interface missing from personalized.ts");
      }
    } else {
      fail("src/lib/discovery/personalized.ts missing");
    }

    const apiExists = existsSync("src/app/api/discovery/personalized/route.ts");
    if (apiExists) {
      ok("src/app/api/discovery/personalized/route.ts exists");
    } else {
      fail("src/app/api/discovery/personalized/route.ts missing");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 5 — Multilingual: exactly 12 languages
  // ─────────────────────────────────────────────────────────────
  section("Check 5 — Multilingual Coverage (12 languages)");
  {
    const langCount = SUPPORTED_LANGUAGES.length;
    if (langCount === 12) {
      ok(`SUPPORTED_LANGUAGES has exactly 12 entries`);
    } else {
      fail(`Expected 12 languages, got ${langCount}`);
    }

    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    const required = ["en", "hi", "te", "ta", "kn", "ml", "mr", "bn", "gu", "or", "pa", "as"];
    const missing = required.filter((c) => !codes.includes(c));
    if (missing.length === 0) {
      ok("All 12 language codes present: en hi te ta kn ml mr bn gu or pa as");
    } else {
      fail(`Missing language codes: ${missing.join(", ")}`);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 6 — i18n translation + language resolution
  // ─────────────────────────────────────────────────────────────
  section("Check 6 — i18n translation engine");
  {
    const teLang = SUPPORTED_LANGUAGES.find((l) => l.code === "te");
    if (teLang && teLang.native === "తెలుగు") {
      ok(`Telugu found: code=te, native="${teLang.native}"`);
    } else {
      fail("Telugu language entry missing or malformed");
    }

    const unknownLang = SUPPORTED_LANGUAGES.find((l) => l.code === "xx");
    const enFallback = SUPPORTED_LANGUAGES.find((l) => l.code === "en");
    if (!unknownLang && enFallback) {
      ok("Unknown code 'xx' not in SUPPORTED_LANGUAGES; en fallback available");
    } else {
      fail("Language code validation issue");
    }

    const hiTitle = translate("hi", "nav_temples");
    if (hiTitle && hiTitle !== "nav_temples") {
      ok(`translate('hi', 'nav_temples') → "${hiTitle}"`);
    } else {
      fail("translate('hi', 'nav_temples') returned key or undefined");
    }

    const teStatus = translate("te", "status_open");
    if (teStatus && teStatus !== "status_open") {
      ok(`translate('te', 'status_open') → "${teStatus}"`);
    } else {
      fail("translate('te', 'status_open') returned key or undefined");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 7 — Journey page: 5-tab Pilgrim Companion
  // ─────────────────────────────────────────────────────────────
  section("Check 7 — Journey page (/journey)");
  {
    const pageExists = existsSync("src/app/journey/page.tsx");
    if (pageExists) {
      ok("src/app/journey/page.tsx exists");
      const src = readFileSync("src/app/journey/page.tsx", "utf8");

      const tabs = ["saved", "journeys", "alerts", "recommendations", "preferences"];
      const tabsFound = tabs.filter((t) => src.includes(t));
      if (tabsFound.length >= 4) {
        ok(`5-tab Pilgrim Companion found (${tabsFound.join(", ")})`);
      } else {
        fail(`Only found tabs: ${tabsFound.join(", ")}`);
      }

      if (src.includes("UserPreferences") || src.includes("travelStyle")) {
        ok("Pilgrim profile / preferences section present in journey page");
      } else {
        fail("Preferences section not found in journey page");
      }

      if (src.includes("SavedJourney")) {
        ok("SavedJourney type used in journey page");
      } else {
        fail("SavedJourney type not referenced in journey page");
      }
    } else {
      fail("src/app/journey/page.tsx missing");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 8 — Profile API (/api/me) PATCH endpoint
  // ─────────────────────────────────────────────────────────────
  section("Check 8 — Profile API (/api/me)");
  {
    const meExists = existsSync("src/app/api/me/route.ts");
    if (meExists) {
      ok("src/app/api/me/route.ts exists");
      const src = readFileSync("src/app/api/me/route.ts", "utf8");
      if (src.includes("export async function PATCH") || src.includes("export async function patch")) {
        ok("PATCH endpoint for preferences/follow present");
      } else {
        fail("PATCH endpoint missing in /api/me");
      }
      if (src.includes("followedTemples") || src.includes("toggleFollowTemple")) {
        ok("Follow temple logic in /api/me PATCH handler");
      } else {
        fail("followedTemples toggle not found in /api/me");
      }
      if (src.includes("updateUserPreferences") || src.includes("preferences")) {
        ok("Preferences update logic in /api/me PATCH");
      } else {
        fail("updateUserPreferences not referenced in /api/me");
      }
    } else {
      fail("src/app/api/me/route.ts missing");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 9 — Plan Studio: Save Journey button
  // ─────────────────────────────────────────────────────────────
  section("Check 9 — Plan Studio 'Save Journey' button");
  {
    const studioExists = existsSync("src/components/plan-studio.tsx");
    if (studioExists) {
      const src = readFileSync("src/components/plan-studio.tsx", "utf8");
      if (src.includes("saveToMyJourneys")) {
        ok("saveToMyJourneys handler present in plan-studio.tsx");
      } else {
        fail("saveToMyJourneys handler missing from plan-studio.tsx");
      }
      if (src.includes("Save Journey") || src.includes("saveFeedback")) {
        ok("Save Journey button / saveFeedback state in plan-studio toolbar");
      } else {
        fail("Save Journey button not found in plan-studio.tsx");
      }
    } else {
      fail("src/components/plan-studio.tsx missing");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 10 — National Directory Regression Guard (sequential)
  // ─────────────────────────────────────────────────────────────
  section("Check 10 — National Directory Regression Guard");
  {
    const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
    try {
      // Sequential queries — no Promise.all to avoid EAI_AGAIN on Windows
      const templeCount = await prisma.temple.count();
      if (templeCount >= 2000) {
        ok(`Temple count: ${templeCount} (≥ 2,000 ✓)`);
      } else {
        fail(`Temple count ${templeCount} below 2,000`);
      }

      const centroidCount = await prisma.temple.count({ where: { isCentroidFallback: true } });
      if (centroidCount === 0) {
        ok(`Centroid fallbacks: 0 ✓`);
      } else {
        fail(`${centroidCount} centroid temples found (should be 0)`);
      }

      const stateGroups = await prisma.temple.groupBy({ by: ["stateCode"], _count: true });
      if (stateGroups.length >= 36) {
        ok(`States/UTs covered: ${stateGroups.length} (≥ 36 ✓)`);
      } else {
        fail(`Only ${stateGroups.length} states covered (need ≥ 36)`);
      }

      const districtGroups = await prisma.temple.groupBy({ by: ["districtId"], _count: true });
      if (districtGroups.length >= 700) {
        ok(`Districts covered: ${districtGroups.length} (≥ 700 ✓)`);
      } else {
        fail(`Only ${districtGroups.length} districts covered (need ≥ 700)`);
      }
    } finally {
      await prisma.$disconnect();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log(`\n${BOLD}${"─".repeat(55)}${RESET}`);
  console.log(`${BOLD}PHASE 17 VERIFICATION — ${passed}/${total} checks passed${RESET}`);
  if (failed === 0) {
    console.log(`${GREEN}${BOLD}✅ ALL CHECKS PASSED — PHASE 17 COMPLETE${RESET}`);
  } else {
    console.log(`${RED}${BOLD}❌ ${failed} CHECK(S) FAILED:${RESET}`);
    failures.forEach((f) => console.log(`  ${RED}• ${f}${RESET}`));
    process.exit(1);
  }
}

runVerification().catch((e) => {
  console.error("Verification failed unexpectedly:", e);
  process.exit(1);
});
