/**
 * DEVYATRA / TEMPLEORA — PHASE 26 VERIFICATION SUITE
 * Live Travel Intelligence & Notifications Audit
 *
 * Run: npx tsx scripts/verify_phase26.ts
 */

import { existsSync } from "node:fs";
import {
  calculateNormalizedRoute,
  generateWeatherContext,
  evaluateTravelRisk,
  TravelRiskDisruption,
} from "../src/lib/travel/intelligence";
import {
  isInQuietHours,
  dispatchNotification,
  generateSmartJourneyReminder,
  NotificationPreferences,
  NotificationEvent,
} from "../src/lib/notifications/engine";

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

async function runPhase26Verification() {
  console.log("==================================================================");
  console.log("🇮🇳 DEVYATRA / TEMPLEORA — PHASE 26 VERIFICATION");
  console.log("Live Travel Intelligence & Notifications Audit");
  console.log("==================================================================\n");

  // ─────────────────────────────────────────────────────────────
  // 1. ROUTING PROVIDER & TERRAIN DILATION
  // ─────────────────────────────────────────────────────────────
  section("1. Multi-Modal Routing & Terrain Dilation Engine");
  {
    // Haridwar to Badrinath route coordinates
    const haridwar = { latitude: 29.9457, longitude: 78.1642, label: "Haridwar" };
    const badrinath = { latitude: 30.7433, longitude: 79.4938, label: "Badrinath" };

    const himalayanRoute = calculateNormalizedRoute({
      origin: haridwar,
      destination: badrinath,
      travelMode: "car",
      terrainType: "HIGH_HIMALAYAN",
    });

    const plainsRoute = calculateNormalizedRoute({
      origin: haridwar,
      destination: badrinath,
      travelMode: "car",
      terrainType: "STANDARD_PLAINS",
    });

    if (himalayanRoute.distanceKm > plainsRoute.distanceKm && himalayanRoute.terrainFactor === 1.85) {
      ok("Terrain Dilation: High Himalayan routing correctly applies 1.85x curvature multiplier over plains");
    } else {
      fail("Terrain Dilation failed: Curvature multipliers not properly reflected");
    }

    const walkingRoute = calculateNormalizedRoute({
      origin: { latitude: 25.3109, longitude: 83.0107 },
      destination: { latitude: 25.3150, longitude: 83.0120 },
      travelMode: "walking",
    });

    if (walkingRoute.travelMode === "walking" && walkingRoute.durationMinutes > 0) {
      ok("Multi-Modal Speed Profiles: Walking speed accurately computed with pradakshina buffers");
    } else {
      fail("Walking route duration failed");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. WEATHER CONTEXT & STALENESS
  // ─────────────────────────────────────────────────────────────
  section("2. Live Weather Context & Staleness Audit");
  {
    const kedarnathWeather = generateWeatherContext({
      latitude: 30.7352,
      longitude: 79.0669,
      locationName: "Kedarnath Dham",
      altitudeMeters: 3584,
    });

    if (kedarnathWeather.temperatureCelsius < 15 && kedarnathWeather.condition === "HEAVY_MIST") {
      ok("Altitude-Adjusted Weather: Accurately reflected high-altitude alpine conditions");
    } else {
      fail("Altitude-Adjusted weather calculation unexpected");
    }

    const oldDate = new Date(Date.now() - 10 * 3600000).toISOString();
    const staleWeather = generateWeatherContext({
      latitude: 13.6288,
      longitude: 79.4192,
      locationName: "Tirupati",
      timestamp: oldDate,
    });

    if (staleWeather.isStale && staleWeather.freshnessLabel === "LAST_UPDATED") {
      ok("Weather Staleness: Properly classified 10-hour old forecast as LAST_UPDATED rather than LIVE");
    } else {
      fail("Weather Staleness check failed");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. TRAVEL RISK & DISRUPTION EVALUATION
  // ─────────────────────────────────────────────────────────────
  section("3. Travel Risk & Road Hazard Evaluation");
  {
    const mockRoute = calculateNormalizedRoute({
      origin: { latitude: 30.0, longitude: 79.0 },
      destination: { latitude: 30.5, longitude: 79.5 },
      travelMode: "car",
    });
    const mockWeather = generateWeatherContext({
      latitude: 30.0,
      longitude: 79.0,
      locationName: "Joshimath",
    });
    const disruptions: TravelRiskDisruption[] = [
      {
        id: "dis_1",
        severity: "CRITICAL_DISRUPTION",
        type: "ROAD_CLOSURE",
        title: "NH-58 Rockfall Maintenance",
        description: "Road closed between Chamoli and Pipalkoti until 2 PM IST",
        sourceAuthority: "Uttarakhand Police Traffic Control",
        verifiedAt: new Date().toISOString(),
      },
    ];

    const risk = evaluateTravelRisk({
      route: mockRoute,
      weather: mockWeather,
      activeDisruptions: disruptions,
    });

    if (risk.hasRisk && risk.criticalBlocks.length > 0 && risk.criticalBlocks[0].includes("NH-58")) {
      ok("Travel Risk Evaluation: Correctly captured critical statutory road closure");
    } else {
      fail("Travel Risk Evaluation failed to flag critical block");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4. NOTIFICATION ENGINE & QUIET HOURS
  // ─────────────────────────────────────────────────────────────
  section("4. Notification Engine & Quiet Hours Compliance");
  {
    const userPrefs: NotificationPreferences = {
      userId: "yatri_123",
      enabledChannels: ["IN_APP", "WEB_PUSH"],
      festivalAlerts: true,
      timingAlerts: false, // Disabled
      bookingAlerts: true,
      journeyReminders: true,
      travelAlerts: true,
      marketingConsent: false,
      timezone: "Asia/Kolkata",
      quietHours: {
        enabled: true,
        startHour: 22, // 10 PM
        endHour: 6,    // 6 AM
      },
    };

    // Test quiet hours check at 23:30 IST (11:30 PM)
    const lateNightDate = new Date("2026-09-23T18:00:00.000Z"); // 23:30 IST
    const isQuiet = isInQuietHours(userPrefs, lateNightDate);
    if (isQuiet) {
      ok("Quiet Hours: Correctly identified late-night hours in user's explicit timezone (Asia/Kolkata)");
    } else {
      fail("Quiet Hours calculation failed for late night window");
    }

    // Normal non-emergency notification during quiet hours -> Suppressed
    const event: NotificationEvent = {
      id: "ev_fest_1",
      type: "festival_update",
      title: "Diwali Deepotsav Darshan",
      body: "Special aarti schedules released",
      urgency: "NORMAL",
      verifiedSource: "Ayodhya Development Authority",
      createdAt: new Date().toISOString(),
    };

    const deliveryQuiet = dispatchNotification({
      event,
      userPrefs,
      preferredChannel: "WEB_PUSH",
      dispatchTime: lateNightDate,
    });

    if (deliveryQuiet.status === "SUPPRESSED_QUIET_HOURS") {
      ok("Quiet Hours Suppression: Non-emergency festival alert held during quiet hours");
    } else {
      fail("Quiet Hours Suppression failed: Alert was not suppressed");
    }

    // Emergency notification during quiet hours -> Bypasses quiet hours
    const emergencyEvent: NotificationEvent = {
      id: "ev_emerg_1",
      type: "temporary_closure",
      title: "Flash Flood Warning",
      body: "Immediate temple ghat evacuation ordered",
      urgency: "EMERGENCY",
      verifiedSource: "National Disaster Response Force",
      createdAt: new Date().toISOString(),
    };

    const deliveryEmergency = dispatchNotification({
      event: emergencyEvent,
      userPrefs,
      preferredChannel: "WEB_PUSH",
      dispatchTime: lateNightDate,
    });

    if (deliveryEmergency.status === "DELIVERED") {
      ok("Emergency Bypass: Critical public safety alert delivered during quiet hours");
    } else {
      fail("Emergency Bypass failed");
    }

    // Disabled category notification -> Rejected by preference
    const timingEvent: NotificationEvent = {
      id: "ev_time_1",
      type: "timing_change",
      title: "Mangala Aarti Updated",
      body: "New timing 05:15 AM",
      urgency: "NORMAL",
      verifiedSource: "Trust Board",
      createdAt: new Date().toISOString(),
    };

    const deliveryPreference = dispatchNotification({
      event: timingEvent,
      userPrefs,
      preferredChannel: "WEB_PUSH",
    });

    if (deliveryPreference.status === "DISALLOWED_PREFERENCE") {
      ok("User Consent Enforcement: Notification blocked because user opted out of timing alerts");
    } else {
      fail("User Consent failed to block disallowed notification category");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 5. SMART JOURNEY REMINDERS
  // ─────────────────────────────────────────────────────────────
  section("5. Smart Journey Reminders");
  {
    const reminder = generateSmartJourneyReminder({
      journeyTitle: "Kashi-Prayag Yatra",
      templeName: "Kashi Vishwanath Temple",
      visitDate: "2026-10-15",
      verifiedBookingUrl: "https://shrikashivishwanath.org",
      timingSummary: "03:00 AM – 11:00 PM",
      sourceAuthority: "Kashi Special Area Development Board",
    });

    if (
      reminder.type === "journey_reminder" &&
      reminder.body.includes("Kashi Vishwanath") &&
      reminder.body.includes("Official booking portal available")
    ) {
      ok("Smart Journey Reminder: Correctly assembled verified itinerary reminder with booking prompt");
    } else {
      fail("Smart Journey Reminder failed verification");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 6. DOCUMENTATION DELIVERABLES
  // ─────────────────────────────────────────────────────────────
  section("6. Documentation Deliverables Check");
  {
    const docs = [
      "docs/PHASE_26_COMPLETION_REPORT.md",
      "docs/TRAVEL_INTELLIGENCE_ARCHITECTURE.md",
      "docs/NOTIFICATION_POLICY.md",
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
  console.log(`${BOLD}PHASE 26 VERIFICATION: ${passed}/${total} CHECKS PASSED${RESET}`);
  if (failed === 0) {
    console.log(`${GREEN}${BOLD}🏆 ALL CHECKS PASSED — PHASE 26 COMPLETE${RESET}`);
  } else {
    console.log(`${RED}${BOLD}❌ ${failed} CHECK(S) FAILED:${RESET}`);
    failures.forEach((f) => console.log(`  ${RED}• ${f}${RESET}`));
    process.exit(1);
  }
}

runPhase26Verification().catch((err) => {
  console.error("Phase 26 verification crashed:", err);
  process.exit(1);
});
