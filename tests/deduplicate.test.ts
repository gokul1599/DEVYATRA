import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  haversineDistance,
  jaroWinkler,
  tokenAwareSimilarity,
  evaluateDuplicate
} from "../src/lib/importer/deduplicate";

describe("Probabilistic Deduplication Engine", () => {
  it("computes accurate Haversine distance", () => {
    // Distance between Tirumala temple coordinates and a point ~100m away
    const d = haversineDistance(13.6833, 79.3500, 13.6840, 79.3505);
    assert.ok(d > 50 && d < 150, `Expected ~100m, got ${d}`);

    // Identical coords is 0m
    assert.equal(haversineDistance(13.6833, 79.3500, 13.6833, 79.3500), 0);
  });

  it("calculates Jaro-Winkler string similarity with prefix scaling", () => {
    const simExact = jaroWinkler("Somnath", "Somnath");
    assert.equal(simExact, 1.0);

    const simTypo = jaroWinkler("Somnath", "Somanath");
    assert.ok(simTypo > 0.9, `Expected > 0.9, got ${simTypo}`);

    const simDiff = jaroWinkler("Kedarnath", "Meenakshi");
    assert.ok(simDiff < 0.6, `Expected < 0.6, got ${simDiff}`);
  });

  it("calculates token-aware similarity discounting common stop words", () => {
    const sim = tokenAwareSimilarity("Sri Venkateswara Swamy Temple", "Venkateswara Temple");
    assert.ok(sim >= 0.85, `Expected >= 0.85, got ${sim}`);
  });

  it("classifies identical temple with close coords as EXACT_DUPLICATE", () => {
    const result = evaluateDuplicate(
      {
        name: "Sri Venkateswara Swamy Temple",
        stateCode: "AP",
        districtName: "Tirupati",
        mainDeity: "Venkateswara",
        latitude: 13.6833,
        longitude: 79.3500
      },
      {
        name: "Lord Venkateswara Temple",
        stateCode: "AP",
        districtName: "Tirupati",
        mainDeity: "Lord Venkateswara",
        latitude: 13.6835,
        longitude: 79.3502
      }
    );

    assert.equal(result.classification, "EXACT_DUPLICATE");
    assert.ok(result.distanceMeters !== null && result.distanceMeters < 100);
  });

  it("classifies temples in different states as UNIQUE despite similar names", () => {
    const result = evaluateDuplicate(
      {
        name: "Shiva Temple",
        stateCode: "TN",
        districtName: "Madurai",
        mainDeity: "Shiva",
        latitude: 9.9195,
        longitude: 78.1193
      },
      {
        name: "Shiva Temple",
        stateCode: "KA",
        districtName: "Mysuru",
        mainDeity: "Shiva",
        latitude: 12.2958,
        longitude: 76.6394
      }
    );

    assert.equal(result.classification, "UNIQUE");
    assert.equal(result.stateMatch, false);
  });
});
