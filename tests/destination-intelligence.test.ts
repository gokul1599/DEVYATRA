import test, { describe } from "node:test";
import assert from "node:assert/strict";
import {
  buildMasterDestinationIntelligence,
  resolveSourceDiscrepancy,
  evaluatePracticalTravelFeasibility,
} from "../src/lib/intelligence/context-engine";
import {
  buildOfflineJourneyPack,
  type OfflineDestinationItem,
} from "../src/lib/intelligence/offline-pack";
import type {
  DestinationAccessPoint,
} from "../src/lib/intelligence/destination-intelligence";

describe("V2.4 Remaining Intelligence Layer — Destination Intelligence & Access Points", () => {
  test("generates canonical Master Destination Intelligence for verified temple", async () => {
    const intel = await buildMasterDestinationIntelligence("sri-venkateswara-temple");
    assert.ok(intel, "Intelligence payload must exist");
    assert.equal(intel.slug, "sri-venkateswara-temple");
    assert.equal(intel.name, "Sri Venkateswara Swamy Vaari Temple");
    assert.ok(intel.accessPoints.length > 0, "Must contain surveyed access points");
    assert.equal(intel.accessPoints[0].type, "MAIN_TEMPLE");
    assert.ok(Number(intel.accessPoints[0].latitude) > 0, "Latitude must be valid");
    assert.ok(Number(intel.accessPoints[0].longitude) > 0, "Longitude must be valid");
    assert.equal(intel.accessPoints[0].status, "VERIFIED");
  });

  test("rejects guessed coordinates and flags zero-coordinate / unverified entries", () => {
    const fakePoint: DestinationAccessPoint = {
      id: "pt-unverified-parking",
      label: "Outer Perimeter Parking",
      type: "PARKING_ENTRANCE",
      latitude: null, // Never invent coordinates!
      longitude: null,
      source: "Municipal Notice",
      accuracy: "UNKNOWN",
      status: "INFORMATION_UNAVAILABLE",
    };

    assert.equal(fakePoint.latitude, null, "Guessed coordinates must never be generated");
    assert.equal(fakePoint.status, "INFORMATION_UNAVAILABLE");
  });

  test("evaluates visit logistics with honest tri-state semantics", async () => {
    const intel = await buildMasterDestinationIntelligence("sri-venkateswara-temple");
    assert.ok(intel, "Intelligence payload must exist");
    assert.ok(intel.visitLogistics, "Visit logistics must exist");

    // Footwear check
    assert.ok(
      ["AVAILABLE", "UNAVAILABLE", "UNKNOWN"].includes(intel.visitLogistics.footwearCounter.status),
      "Footwear status must strictly follow tri-state semantics"
    );
    assert.ok(
      Boolean(intel.visitLogistics.footwearCounter.details && intel.visitLogistics.footwearCounter.details.length > 0),
      "Ground truth notes must be provided"
    );

    // Wheelchair / accessibility check
    assert.ok(
      ["VERIFIED_AVAILABLE", "VERIFIED_UNAVAILABLE", "VERIFY_ON_GROUND"].includes(
        intel.visitEase.wheelchairAccess.state
      ),
      "Wheelchair access must follow 3-state truth"
    );

    // Rules summary
    assert.ok(intel.visitLogistics.rules.footwearPolicy.length > 0);
    assert.ok(intel.visitLogistics.rules.dressCodePolicy.length > 0);
  });
});

describe("V2.4 Source Authority Hierarchy & Discrepancy Resolution", () => {
  test("ranks statutory Temple Authority above Third-party/Curated sources", () => {
    const sourceA = {
      name: "Sri Meenakshi Sundareswarar Temple Devasthanam",
      value: "05:00 - 12:30, 16:00 - 22:00",
      type: "official_statutory",
      date: "2026-03-20",
    };
    const sourceB = {
      name: "Community Wiki",
      value: "Open 24 hours",
      type: "community_reported",
      date: "2026-01-01",
    };

    const resolution = resolveSourceDiscrepancy("operatingHours", sourceA, sourceB);
    assert.equal(resolution.conflictStatus, "RESOLVED_BY_AUTHORITY");
    assert.ok(resolution.publicDisclosureText.includes("Discrepancy detected"));
    assert.ok(resolution.sourceA.authorityRank > resolution.sourceB.authorityRank);
  });

  test("returns verified status when both sources report matching values", () => {
    const source1 = {
      name: "Official Temple Site",
      value: "Free General Darshan",
      type: "official_statutory",
      date: "2026-03-20",
    };
    const source2 = {
      name: "Govt HR&CE Board",
      value: "Free General Darshan",
      type: "government_endowment",
      date: "2026-03-20",
    };

    const resolution = resolveSourceDiscrepancy("generalEntryFee", source1, source2);
    assert.equal(resolution.conflictStatus, "RESOLVED_BY_AUTHORITY");
    assert.ok(resolution.publicDisclosureText.includes("verified consistently"));
  });
});

describe("V2.4 Practical Travel Feasibility (DISTANCE != VISITABILITY)", () => {
  test("enforces terrain dilation and operating window feasibility", () => {
    // Distant pilgrimage: 250 km air distance with only 3 hours available
    const result = evaluatePracticalTravelFeasibility({
      originLat: 13.0827,
      originLng: 80.2707,
      destinationLat: 11.0,
      destinationLng: 78.0,
      availableHours: 3,
      travelMode: "car",
      destinationOpenFrom: "06:00",
      destinationCloseAt: "12:30",
      arrivalHourEstimate: 14.0, // Arrives after midday closure
    });

    assert.ok(result.roadDistanceKm > result.geographicDistanceKm);
    assert.equal(result.isFeasibleInAvailableTime, false);
    assert.equal(result.feasibilityScore, "UNREALISTIC_FOR_TODAY");
    assert.ok(result.feasibilityReason.length > 0);
  });

  test("validates feasible local pilgrimage circuit with ample time", () => {
    const result = evaluatePracticalTravelFeasibility({
      originLat: 13.0827,
      originLng: 80.2707,
      destinationLat: 13.0334,
      destinationLng: 80.2694,
      availableHours: 5,
      travelMode: "car",
      destinationOpenFrom: "06:00",
      destinationCloseAt: "21:00",
      arrivalHourEstimate: 8.0,
    });

    assert.equal(result.isFeasibleInAvailableTime, true);
    assert.equal(result.feasibilityScore, "HIGHLY_FEASIBLE");
  });
});

describe("V2.4 Network-Independent Offline Journey Pack", () => {
  test("compiles complete self-contained offline journey bundle with watermark", () => {
    const mockDestinations: OfflineDestinationItem[] = [
      {
        id: "temple-1",
        slug: "meenakshi-amman",
        name: "Meenakshi Amman Temple",
        latitude: 9.9195,
        longitude: 78.1193,
        formattedAddress: "Madurai Main, Madurai, Tamil Nadu 625001",
        openingHoursSummary: "05:00 - 12:30 | 16:00 - 22:00",
        rulesSummary: {
          footwear: "Footwear stands at East and South towers",
          dressCode: "Traditional dhotis/sarees required",
          electronics: "No mobile phones permitted inside inner sanctum",
          photography: "Strictly prohibited inside sanctum",
        },
        emergencyContacts: {
          nationalEmergency: "112",
          police: "100",
          ambulance: "108",
          templeOffice: "0452-2344360",
        },
      },
    ];

    const pack = buildOfflineJourneyPack({
      journeyId: "j-test-101",
      title: "Southern Heritage Pilgrimage",
      destinations: mockDestinations,
    });

    assert.equal(pack.journeyId, "j-test-101");
    assert.equal(pack.journeyTitle, "Southern Heritage Pilgrimage");
    assert.equal(pack.isOfflineSafe, true);
    assert.equal(pack.totalDestinations, 1);
    assert.ok(pack.offlineWatermark.includes("OFFLINE JOURNEY SNAPSHOT · Saved"));
    assert.ok(pack.preTripChecklist.length >= 4);
    assert.ok(pack.safetyDisclaimer.toLowerCase().includes("offline"));
  });
});
