import test, { describe } from "node:test";
import assert from "node:assert/strict";
import {
  getDistanceBand,
  estimateRoadMetrics,
  classifySignificance,
  inferTravelStyles,
  estimateVisitDuration,
  DISTANCE_BANDS,
} from "../src/lib/destinations/extended-discovery";
import { parseGeoSearchQuery, KNOWN_GEO_ANCHORS } from "../src/lib/search/geo-parser";

describe("V2.4 Extended 300 km Regional Discovery — Distance Bands & Calibration", () => {
  test("correctly maps air distances into 4 graduated distance bands", () => {
    assert.equal(getDistanceBand(4.5), "BAND_0_10");
    assert.equal(getDistanceBand(10.0), "BAND_0_10");
    assert.equal(getDistanceBand(10.1), "BAND_10_50");
    assert.equal(getDistanceBand(49.9), "BAND_10_50");
    assert.equal(getDistanceBand(50.0), "BAND_10_50");
    assert.equal(getDistanceBand(50.1), "BAND_50_150");
    assert.equal(getDistanceBand(150.0), "BAND_50_150");
    assert.equal(getDistanceBand(150.1), "BAND_150_300");
    assert.equal(getDistanceBand(299.9), "BAND_150_300");

    assert.equal(DISTANCE_BANDS.BAND_0_10.label, "0–10 km");
    assert.equal(DISTANCE_BANDS.BAND_10_50.label, "10–50 km");
    assert.equal(DISTANCE_BANDS.BAND_50_150.label, "50–150 km");
    assert.equal(DISTANCE_BANDS.BAND_150_300.label, "150–300 km");
  });

  test("applies terrain-aware road detour factors and drive durations", () => {
    // 0-10 km: winding urban roads (factor 1.25, 25 km/h)
    const local = estimateRoadMetrics(8.0);
    assert.equal(local.roadKm, 10.0);
    assert.ok(local.driveMin >= 20 && local.driveMin <= 30);

    // 10-50 km: district connecting roads (factor 1.22, 38 km/h)
    const mid = estimateRoadMetrics(30.0);
    assert.equal(mid.roadKm, 36.6);
    assert.ok(mid.driveMin >= 50 && mid.driveMin <= 65);

    // 50-150 km: state/national highways (factor 1.20, 50 km/h)
    const regional = estimateRoadMetrics(100.0);
    assert.equal(regional.roadKm, 120.0);
    assert.ok(regional.driveMin >= 135 && regional.driveMin <= 155);

    // 150-300 km: national expressways (factor 1.18, 60 km/h)
    const highway = estimateRoadMetrics(200.0);
    assert.equal(highway.roadKm, 236.0);
    assert.ok(highway.driveMin >= 220 && highway.driveMin <= 250);
  });
});

describe("V2.4 Extended 300 km Regional Discovery — Significance & Travel Personas", () => {
  test("accurately classifies sacred significance tiers without hallucination", () => {
    // National significance
    const somnath = classifySignificance({
      name: "Somnath Jyotirlinga Temple",
      description: "First among the twelve holy Jyotirlinga shrines of Lord Shiva.",
    });
    assert.equal(somnath.tier, "NATIONAL_SIGNIFICANCE");

    // Heritage significance
    const brihadisvara = classifySignificance({
      name: "Brihadisvara Temple",
      architecture: "Great Living Chola Architecture",
      description: "Monolithic granitic vimana built by Raja Raja Chola I, an ASI protected site.",
    });
    assert.equal(brihadisvara.tier, "HERITAGE_SIGNIFICANCE");

    // Nature significance
    const sangam = classifySignificance({
      name: "Triveni Sangam",
      category: "NATURE",
      description: "Sacred confluence of Ganga, Yamuna, and mythical Saraswati rivers.",
    });
    assert.equal(sangam.tier, "NATURE_SIGNIFICANCE");

    // Pilgrimage significance
    const tirtha = classifySignificance({
      name: "Kapila Tirtha",
      category: "PILGRIMAGE",
      description: "Ancient sacred tirtha and holy water body at the foothills.",
    });
    assert.equal(tirtha.tier, "PILGRIMAGE_SIGNIFICANCE");
  });

  test("infers appropriate travel style personas", () => {
    // Short drive national landmark fits senior, family, and road trip
    const styles = inferTravelStyles(45, 60, "NATIONAL_SIGNIFICANCE", "TEMPLE");
    assert.ok(styles.includes("FAMILY"));
    assert.ok(styles.includes("SENIOR"));
    assert.ok(styles.includes("ROAD_TRIP"));

    // Long distance multi-hour drive excludes senior ease
    const longTripStyles = inferTravelStyles(250, 260, "REGIONAL_SIGNIFICANCE", "TEMPLE");
    assert.ok(longTripStyles.includes("ROAD_TRIP"));
    assert.ok(!longTripStyles.includes("SENIOR"));
  });

  test("recommends realistic visit duration based on distance and stature", () => {
    const nationalFar = estimateVisitDuration(220, "NATIONAL_SIGNIFICANCE", "TEMPLE");
    assert.equal(nationalFar.duration, "MULTI_DAY");

    const regionalDay = estimateVisitDuration(80, "REGIONAL_SIGNIFICANCE", "TEMPLE");
    assert.equal(regionalDay.duration, "FULL_DAY");

    const quickLocal = estimateVisitDuration(5, "REGIONAL_SIGNIFICANCE", "TEMPLE");
    assert.equal(quickLocal.duration, "QUICK_STOP");
  });
});

describe("V2.4 Natural-Language Geo Search Parser", () => {
  test("extracts spatial radius, anchor location, and category from queries", () => {
    const q1 = parseGeoSearchQuery("temples within 100 km of Madurai");
    assert.equal(q1.hasGeoIntent, true);
    assert.equal(q1.radiusKm, 100);
    assert.equal(q1.distanceBand, "BAND_50_150");
    assert.equal(q1.category, "TEMPLE");
    assert.ok(q1.anchorName?.includes("Madurai"));
    assert.ok(q1.anchorCoordinates?.latitude && q1.anchorCoordinates.latitude > 9.0);
    assert.ok(q1.mapHref?.includes("lat=9.9195"));

    const q2 = parseGeoSearchQuery("heritage places within 200 km of Varanasi");
    assert.equal(q2.hasGeoIntent, true);
    assert.equal(q2.radiusKm, 200);
    assert.equal(q2.distanceBand, "BAND_150_300");
    assert.equal(q2.category, "HERITAGE");
    assert.ok(q2.anchorName?.includes("Varanasi"));

    const q3 = parseGeoSearchQuery("family destinations within 50km of Bengaluru");
    assert.equal(q3.hasGeoIntent, true);
    assert.equal(q3.radiusKm, 50);
    assert.equal(q3.distanceBand, "BAND_10_50");
    assert.equal(q3.travelStyle, "FAMILY");
    assert.ok(q3.anchorName?.includes("Bengaluru"));

    const q4 = parseGeoSearchQuery("satvik food near Tirupati");
    assert.equal(q4.hasGeoIntent, true);
    assert.equal(q4.category, "FOOD");
    assert.ok(q4.anchorName?.includes("Tirupati"));
  });

  test("verifies sovereign coordinates for all known geo anchors", () => {
    for (const [key, anchor] of Object.entries(KNOWN_GEO_ANCHORS)) {
      assert.ok(anchor.lat >= 6.5 && anchor.lat <= 37.5, `${key} lat ${anchor.lat} outside India`);
      assert.ok(anchor.lng >= 68.0 && anchor.lng <= 97.5, `${key} lng ${anchor.lng} outside India`);
      assert.ok(anchor.name.length > 0);
      assert.ok(anchor.state.length > 0);
    }
  });
});
