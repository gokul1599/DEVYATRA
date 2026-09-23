/**
 * DEVYATRA / TEMPLEORA — PHASE 25 VERIFICATION SUITE
 * Trust, Provenance & Temporal Intelligence Audit
 *
 * Run: npx tsx scripts/verify_phase25.ts
 */

import { existsSync } from "node:fs";
import {
  recordFieldChange,
  getFieldHistory,
  rollbackFieldChange,
  detectSourceConflict,
  getEffectiveTimingForDate,
  evaluateSourceFreshness,
  buildTempleComplexGraph,
  validateMediaUsage,
  SourceClaim,
  TemporalRecord,
  TempleMediaRecord,
} from "../src/lib/trust/provenance";

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

async function runPhase25Verification() {
  console.log("==================================================================");
  console.log("🇮🇳 DEVYATRA / TEMPLEORA — PHASE 25 VERIFICATION");
  console.log("Trust, Provenance & Temporal Intelligence Audit");
  console.log("==================================================================\n");

  // ─────────────────────────────────────────────────────────────
  // 1. FIELD-LEVEL VERSION HISTORY & ROLLBACK
  // ─────────────────────────────────────────────────────────────
  section("1. Field-Level Version History & Rollback Engine");
  {
    const entry = recordFieldChange({
      templeId: "kashi-vishwanath",
      fieldName: "openingHours",
      oldValue: "05:00 AM",
      newValue: "05:30 AM",
      sourceId: "src_kashi_board_circular_2026",
      verifiedAt: new Date().toISOString(),
      changedBy: "ADMIN_OFFICIAL",
      verificationMethod: "GOVERNMENT_CIRCULAR",
      reason: "Winter Mangala Aarti revision by Kashi Vishwanath Special Area Board",
    });

    const history = getFieldHistory("kashi-vishwanath", "openingHours");
    if (history.length > 0 && history[history.length - 1].newValue === "05:30 AM") {
      ok("Field Version History: Successfully recorded immutable field modification entry");
    } else {
      fail("Field Version History failed to record or retrieve entry");
    }

    const rollback = rollbackFieldChange(entry.id);
    if (rollback.success && rollback.rolledBackTo === "05:00 AM") {
      ok("Deterministic Rollback: Successfully reverted field back to previous verified state");
    } else {
      fail("Deterministic Rollback failed to restore previous state");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. SOURCE CONFLICT RESOLUTION ENGINE
  // ─────────────────────────────────────────────────────────────
  section("2. Source Conflict Engine & Statutory Hierarchy");
  {
    const claimOfficial: SourceClaim = {
      sourceName: "Shri Mata Vaishno Devi Shrine Board",
      tier: "OFFICIAL_TEMPLE_AUTHORITY",
      claimedValue: "Free token darshan mandatory",
      retrievedAt: new Date().toISOString(),
    };

    const claimGoogle: SourceClaim = {
      sourceName: "Google Maps User Tip",
      tier: "GOOGLE_DISCOVERY",
      claimedValue: "Paid ticket needed at Bhawan",
      retrievedAt: new Date().toISOString(),
    };

    const decisiveConflict = detectSourceConflict("vaishno-devi", "darshanRules", claimOfficial, claimGoogle);
    if (
      decisiveConflict &&
      decisiveConflict.resolutionStatus === "RESOLVED_BY_HIERARCHY" &&
      decisiveConflict.resolvedValue === "Free token darshan mandatory"
    ) {
      ok("Conflict Resolution: High-priority statutory authority correctly supersedes secondary discovery tier");
    } else {
      fail("Conflict Resolution failed to resolve clear tier differential");
    }

    // Close tier dispute
    const claimGov: SourceClaim = {
      sourceName: "State Endowments Department",
      tier: "GOVERNMENT_ENDOWMENT",
      claimedValue: "06:00 AM",
      retrievedAt: new Date().toISOString(),
    };
    const claimTourism: SourceClaim = {
      sourceName: "State Tourism Portal",
      tier: "OFFICIAL_TOURISM",
      claimedValue: "06:30 AM",
      retrievedAt: new Date().toISOString(),
    };

    const closeConflict = detectSourceConflict("somnath", "openingHours", claimGov, claimTourism);
    if (closeConflict && closeConflict.resolutionStatus === "NEEDS_MANUAL_REVIEW") {
      ok("Conflict Safety: Close authority differential flagged for human administrator review");
    } else {
      fail("Conflict Safety failed to flag ambiguous conflict for review");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. TEMPORAL DATA MODEL
  // ─────────────────────────────────────────────────────────────
  section("3. Temporal Data Model & Precedence Scheduling");
  {
    const temporalRecords: TemporalRecord[] = [
      {
        id: "tr_reg",
        templeId: "kedarnath",
        category: "REGULAR",
        title: "Daily Darshan Window",
        startDate: "2026-05-01",
        endDate: "2026-10-31",
        isOpen: true,
        darshanAvailable: true,
        sourceAuthority: "BKTC",
        verifiedAt: new Date().toISOString(),
      },
      {
        id: "tr_emerg",
        templeId: "kedarnath",
        category: "EMERGENCY",
        title: "High Mountain Cloudburst Caution",
        startDate: "2026-08-10",
        endDate: "2026-08-14",
        isOpen: false,
        darshanAvailable: false,
        specialRulesNote: "Trek route paused by SDRF",
        sourceAuthority: "Uttarakhand Disaster Management",
        verifiedAt: new Date().toISOString(),
      },
    ];

    // Date during emergency
    const duringEmergency = getEffectiveTimingForDate(temporalRecords, "2026-08-12");
    if (!duringEmergency.isOperational && duringEmergency.note.includes("EMERGENCY")) {
      ok("Temporal Precedence: Emergency closure correctly overrides regular seasonal opening");
    } else {
      fail("Temporal Precedence failed: Emergency was not properly enforced");
    }

    // Normal date
    const normalDate = getEffectiveTimingForDate(temporalRecords, "2026-06-15");
    if (normalDate.isOperational && normalDate.activeRecord?.category === "REGULAR") {
      ok("Temporal Normalcy: Regular schedule active when no emergency or festival overrides exist");
    } else {
      fail("Temporal Normalcy failed: Regular schedule was not selected");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4. SOURCE FRESHNESS ENGINE
  // ─────────────────────────────────────────────────────────────
  section("4. Source Freshness Engine");
  {
    const freshDate = new Date(Date.now() - 10 * 86400000).toISOString();
    const staleDate = new Date(Date.now() - 120 * 86400000).toISOString();
    const expiredDate = new Date(Date.now() - 250 * 86400000).toISOString();

    const freshEval = evaluateSourceFreshness(freshDate, 90);
    const staleEval = evaluateSourceFreshness(staleDate, 90);
    const expiredEval = evaluateSourceFreshness(expiredDate, 90);

    if (
      freshEval.status === "FRESH" &&
      staleEval.status === "STALE" &&
      expiredEval.status === "EXPIRED"
    ) {
      ok("Source Freshness: Correctly categorized FRESH, STALE, and EXPIRED intervals");
    } else {
      fail("Source Freshness evaluation produced incorrect status transitions");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 5. TEMPLE COMPLEX GRAPH
  // ─────────────────────────────────────────────────────────────
  section("5. Temple Complex Graph Hierarchy");
  {
    const complex = buildTempleComplexGraph(
      "Meenakshi Sundareswarar Temple Complex",
      "meenakshi-amman",
      "Tamil Nadu",
      "Madurai",
      [
        {
          id: "sh_meenakshi",
          name: "Sri Meenakshi Amman Sanctum",
          complexId: "cx_meenakshi-amman",
          shrineType: "MAIN_SANCTUM",
          deities: [{ id: "d_meenakshi", name: "Meenakshi Amman", isMainDeity: true }],
        },
        {
          id: "sh_sundareswarar",
          name: "Sri Sundareswarar Sanctum",
          complexId: "cx_meenakshi-amman",
          shrineType: "MAIN_SANCTUM",
          deities: [{ id: "d_shiva", name: "Sundareswarar (Shiva)", isMainDeity: true }],
        },
        {
          id: "sh_mukkuruni",
          name: "Mukkuruni Vinayagar",
          complexId: "cx_meenakshi-amman",
          shrineType: "PARIVARA_DEVATA",
          deities: [{ id: "d_ganesha", name: "Vinayagar", isMainDeity: false }],
        },
      ]
    );

    if (complex.totalShrinesCount === 3 && complex.shrines[0].deities[0].name.includes("Meenakshi")) {
      ok("Temple Complex Graph: Correctly maps complex → shrines → deities without duplicate rows");
    } else {
      fail("Temple Complex Graph construction failed");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 6. MEDIA PROVENANCE & COPYRIGHT RIGHTS
  // ─────────────────────────────────────────────────────────────
  section("6. Media Rights & Provenance Verification");
  {
    const officialMedia: TempleMediaRecord = {
      id: "med_1",
      templeId: "kashi-vishwanath",
      url: "https://templeora.vercel.app/images/kashi.webp",
      mediaType: "IMAGE",
      source: "ASI Public Photo Archive",
      license: "Open Government Data License",
      copyright: "Government of India",
      attribution: "Courtesy: Archaeological Survey of India",
      commercialUse: false,
      usageAllowed: true,
      classification: "GOVERNMENT",
      retrievedAt: new Date().toISOString(),
    };

    const unknownMedia: TempleMediaRecord = {
      id: "med_2",
      templeId: "random-shrine",
      url: "https://unknown.com/image.jpg",
      mediaType: "IMAGE",
      source: "Web Scrape",
      license: "None",
      copyright: "Unknown",
      attribution: "None",
      commercialUse: false,
      usageAllowed: false,
      classification: "UNKNOWN_RIGHTS",
      retrievedAt: new Date().toISOString(),
    };

    const validCheck = validateMediaUsage(officialMedia);
    const unverifiedCheck = validateMediaUsage(unknownMedia);

    if (validCheck.isPermitted && !unverifiedCheck.isPermitted && unverifiedCheck.warning?.includes("unverified")) {
      ok("Media Rights: Permitted official government media and strictly blocked unverified assets");
    } else {
      fail("Media Rights validation failed to restrict unverified media");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 7. DOCUMENTATION DELIVERABLES
  // ─────────────────────────────────────────────────────────────
  section("7. Documentation Deliverables Check");
  {
    const docs = [
      "docs/PHASE_25_COMPLETION_REPORT.md",
      "docs/TEMPORAL_DATA_MODEL.md",
      "docs/SOURCE_CONFLICT_POLICY.md",
      "docs/MEDIA_RIGHTS_POLICY.md",
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
  console.log(`${BOLD}PHASE 25 VERIFICATION: ${passed}/${total} CHECKS PASSED${RESET}`);
  if (failed === 0) {
    console.log(`${GREEN}${BOLD}🏆 ALL CHECKS PASSED — PHASE 25 COMPLETE${RESET}`);
  } else {
    console.log(`${RED}${BOLD}❌ ${failed} CHECK(S) FAILED:${RESET}`);
    failures.forEach((f) => console.log(`  ${RED}• ${f}${RESET}`));
    process.exit(1);
  }
}

runPhase25Verification().catch((err) => {
  console.error("Phase 25 verification crashed:", err);
  process.exit(1);
});
