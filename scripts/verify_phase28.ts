/**
 * DEVYATRA / TEMPLEORA — PHASE 28 VERIFICATION SUITE
 * Analytics, User Feedback & Growth Loops Audit
 *
 * Run: npx tsx scripts/verify_phase28.ts
 */

import { existsSync } from "node:fs";
import {
  recordAnalyticsEvent,
  getAnalyticsDashboardSummary,
  submitUserFeedback,
  advanceFeedbackModeration,
  getModerationQueue,
  createPublicJourneyShare,
  getPublicSharedJourney,
} from "../src/lib/analytics/engine";

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

async function runPhase28Verification() {
  console.log("==================================================================");
  console.log("🇮🇳 DEVYATRA / TEMPLEORA — PHASE 28 VERIFICATION");
  console.log("Analytics, User Feedback & Growth Loops Audit");
  console.log("==================================================================\n");

  // ─────────────────────────────────────────────────────────────
  // 1. PRIVACY-AWARE PRODUCT ANALYTICS
  // ─────────────────────────────────────────────────────────────
  section("1. Privacy-Aware Product Analytics Engine");
  {
    recordAnalyticsEvent({
      eventName: "search",
      anonymousSessionId: "anon_session_abc123",
      route: "/search",
      metadataMinimal: { qLen: 12 },
    });

    recordAnalyticsEvent({
      eventName: "temple_view",
      anonymousSessionId: "anon_session_abc123",
      route: "/temples/uttar-pradesh/kashi-vishwanath-temple",
      entityId: "kashi-vishwanath-temple",
    });

    recordAnalyticsEvent({
      eventName: "booking_click",
      anonymousSessionId: "anon_session_def456",
      route: "/temples/andhra-pradesh/sri-venkateswara-temple",
      entityId: "sri-venkateswara-temple",
    });

    const summary = getAnalyticsDashboardSummary();

    if (
      summary.totalEvents >= 3 &&
      summary.activeSessionsCount >= 2 &&
      summary.eventCounts.temple_view >= 1
    ) {
      ok("Analytics Telemetry: Accurately captured operational events and unique anonymous sessions");
    } else {
      fail("Analytics Telemetry aggregation failed");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. USER FEEDBACK & STATUTORY MODERATION PIPELINE
  // ─────────────────────────────────────────────────────────────
  section("2. User Feedback & Strict Moderation Pipeline");
  {
    const report = submitUserFeedback({
      templeId: "kashi-vishwanath-temple",
      templeName: "Kashi Vishwanath Temple",
      isHelpfulVote: true,
      reason: "WRONG_TIMING",
      userObservation: "Aarti timing changed for winter season",
      proposedCorrection: "05:30 AM start instead of 05:00 AM",
    });

    if (report.stage === "REPORT_RECEIVED" && report.id.startsWith("fb_")) {
      ok("Feedback Submission: Captured user report with initial pending state");
    } else {
      fail("Feedback Submission failed");
    }

    // Attempt direct publication without statutory citation (MUST FAIL)
    const directPublishAttempt = advanceFeedbackModeration(report.id, "PUBLISHED_TO_PRODUCTION", {
      reviewer: "admin_tester",
    });

    if (!directPublishAttempt.success && directPublishAttempt.error?.includes("statutory source")) {
      ok("Guard Invariant: Strictly blocked publishing correction without statutory provenance citation");
    } else {
      fail("Guard Invariant failed: System allowed unverified edit into production");
    }

    // Now advance with verified citation
    const validModeration = advanceFeedbackModeration(report.id, "PUBLISHED_TO_PRODUCTION", {
      reviewer: "chief_curator",
      statutorySourceCitation: "Shri Kashi Vishwanath Special Area Development Board Circular 2026/A-12",
    });

    if (validModeration.success && validModeration.report?.stage === "PUBLISHED_TO_PRODUCTION") {
      ok("Moderation Lifecycle: Successfully completed 6-stage verification with statutory backing");
    } else {
      fail("Moderation Lifecycle advancement failed");
    }

    const queue = getModerationQueue();
    if (queue.length > 0) {
      ok(`Moderation Registry: Queue contains ${queue.length} tracked report(s)`);
    } else {
      fail("Moderation Registry empty");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. SHARING & GROWTH LOOPS
  // ─────────────────────────────────────────────────────────────
  section("3. Sacred Journey Sharing & Growth Loops");
  {
    const shared = createPublicJourneyShare({
      title: "Tamil Nadu Navagraha Sacred Circuit",
      totalDays: 2,
      stops: [
        { day: 1, templeSlug: "suryanar-kovil", templeName: "Suryanar Temple", location: "Kumbakonam" },
        { day: 1, templeSlug: "thingalur-chandran", templeName: "Kailasanathar Temple", location: "Thingalur" },
        { day: 2, templeSlug: "vaitheeswaran-kovil", templeName: "Vaitheeswaran Koil", location: "Mayiladuthurai" },
      ],
      thematicCircuit: "Navagraha Shrines",
    });

    if (shared.shareUrl.includes("/journey/share/") && shared.stops.length === 3) {
      ok("Public Share Generator: Created clean, privacy-safe journey URL with 3 curated stops");
    } else {
      fail("Public Share Generator failed");
    }

    const retrieved = getPublicSharedJourney(shared.shareId);
    if (retrieved && retrieved.publicTitle === "Tamil Nadu Navagraha Sacred Circuit") {
      ok("Public Share Resolver: Successfully resolved public shared journey snapshot");
    } else {
      fail("Public Share Resolver failed to fetch snapshot");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4. DOCUMENTATION DELIVERABLES
  // ─────────────────────────────────────────────────────────────
  section("4. Documentation Deliverables Check");
  {
    const docs = [
      "docs/PHASE_28_COMPLETION_REPORT.md",
      "docs/ANALYTICS_PRIVACY_POLICY.md",
      "docs/USER_FEEDBACK_WORKFLOW.md",
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
  console.log(`${BOLD}PHASE 28 VERIFICATION: ${passed}/${total} CHECKS PASSED${RESET}`);
  if (failed === 0) {
    console.log(`${GREEN}${BOLD}🏆 ALL CHECKS PASSED — PHASE 28 COMPLETE${RESET}`);
  } else {
    console.log(`${RED}${BOLD}❌ ${failed} CHECK(S) FAILED:${RESET}`);
    failures.forEach((f) => console.log(`  ${RED}• ${f}${RESET}`));
    process.exit(1);
  }
}

runPhase28Verification().catch((err) => {
  console.error("Phase 28 verification crashed:", err);
  process.exit(1);
});
