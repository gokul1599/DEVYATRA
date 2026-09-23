import test, { describe } from "node:test";
import assert from "node:assert/strict";
import {
  isValidCoordinate,
  isWithinIndiaBounds,
  calculateHaversineKm,
  assessLocationQuality,
  parseBoundingBox,
} from "../src/lib/map/location-quality";
import {
  discoveredPlacesToGeoJSON,
  unifiedDestinationsToGeoJSON,
} from "../src/lib/map/geojson";
import type { DiscoveredPlace } from "../src/lib/google/types";
import type { UnifiedDestination } from "../src/lib/destinations/unified";

describe("V2.4 Real Geographic Map Engine — Location Quality & Bounds", () => {
  test("validates genuine geographic coordinates and rejects null island / NaN", () => {
    assert.equal(isValidCoordinate(13.0827, 80.2707), true); // Chennai
    assert.equal(isValidCoordinate(0, 0), false); // Null Island
    assert.equal(isValidCoordinate(null, 80.0), false);
    assert.equal(isValidCoordinate(13.0, undefined), false);
    assert.equal(isValidCoordinate(NaN, 80.0), false);
    assert.equal(isValidCoordinate(100.0, 80.0), false); // Lat > 90
    assert.equal(isValidCoordinate(13.0, 200.0), false); // Lng > 180
  });

  test("enforces sovereign India bounding envelope", () => {
    // Kanyakumari (Southern India)
    assert.equal(isWithinIndiaBounds(8.0883, 77.5385), true);
    // Kedarnath (Himalayas, Northern India)
    assert.equal(isWithinIndiaBounds(30.7352, 79.0669), true);
    // Somnath (Western India)
    assert.equal(isWithinIndiaBounds(20.888, 70.401), true);
    // Kamakhya (Eastern India)
    assert.equal(isWithinIndiaBounds(26.1664, 91.7058), true);

    // London (Outside India)
    assert.equal(isWithinIndiaBounds(51.5074, -0.1278), false);
    // New York (Outside India)
    assert.equal(isWithinIndiaBounds(40.7128, -74.006), false);
  });

  test("calculates accurate Haversine distance between sacred sites", () => {
    // Somnath to Dwarka (~200 km)
    const somnathLat = 20.888;
    const somnathLng = 70.401;
    const dwarkaLat = 22.2442;
    const dwarkaLng = 68.9685;

    const dist = calculateHaversineKm(somnathLat, somnathLng, dwarkaLat, dwarkaLng);
    assert.ok(dist > 190 && dist < 220, `Expected distance ~205km, got ${dist}`);
  });

  test("correctly ranks location quality hierarchy without centroid fallbacks", () => {
    // Exact official
    const officialQuality = assessLocationQuality({
      latitude: 9.9195,
      longitude: 78.1193,
      verificationStatus: "VERIFIED_OFFICIAL",
      sourceType: "official_statutory",
      isCentroidFallback: false,
    });
    assert.equal(officialQuality.accuracy, "EXACT");
    assert.equal(officialQuality.badgeVariant, "gold");
    assert.ok(officialQuality.qualityScore >= 90);

    // Site Center (Google Places matched)
    const googleQuality = assessLocationQuality({
      latitude: 9.9195,
      longitude: 78.1193,
      googlePlaceId: "ChIJb_fake_place_id",
      verificationStatus: "VERIFIED_SOURCE",
      sourceType: "google",
      isCentroidFallback: false,
    });
    assert.equal(googleQuality.accuracy, "SITE_CENTER");
    assert.equal(googleQuality.badgeVariant, "emerald");
    assert.ok(googleQuality.qualityScore >= 75);

    // Centroid fallback must be strictly UNKNOWN and quality 0
    const fallbackQuality = assessLocationQuality({
      latitude: 9.9195,
      longitude: 78.1193,
      isCentroidFallback: true,
    });
    assert.equal(fallbackQuality.accuracy, "UNKNOWN");
    assert.equal(fallbackQuality.qualityScore, 0);
    assert.equal(fallbackQuality.isCentroidFallback, true);
  });

  test("parses and validates bounding box string query parameters", () => {
    const valid = parseBoundingBox("77.0,8.0,80.0,13.0");
    assert.deepEqual(valid, {
      minLng: 77.0,
      minLat: 8.0,
      maxLng: 80.0,
      maxLat: 13.0,
    });

    // Inverted bounds should return null
    assert.equal(parseBoundingBox("80.0,13.0,77.0,8.0"), null);
    // Malformed string
    assert.equal(parseBoundingBox("not,a,valid,bbox"), null);
    assert.equal(parseBoundingBox(""), null);
    assert.equal(parseBoundingBox(null), null);
  });
});

describe("V2.4 Real Geographic Map Engine — GeoJSON Conversion", () => {
  test("converts discovered places to standard GeoJSON with [longitude, latitude] coordinates", () => {
    const mockPlaces: DiscoveredPlace[] = [
      {
        id: "place-1",
        name: "Meenakshi Amman Temple",
        latitude: 9.9195,
        longitude: 78.1193,
        address: "Madurai, Tamil Nadu",
        region: "Madurai",
        certainty: "temple",
        source: "verified",
        types: ["hindu_temple"],
        openNow: true,
        mapsUrl: "https://maps.google.com/?cid=12345",
        verified: {
          slug: "meenakshi-amman",
          href: "/temple/meenakshi-amman",
          name: "Meenakshi Amman Temple",
        },
      },
    ];

    const geojson = discoveredPlacesToGeoJSON(mockPlaces);
    assert.equal(geojson.type, "FeatureCollection");
    assert.equal(geojson.features.length, 1);

    const feature = geojson.features[0];
    assert.equal(feature.geometry.type, "Point");
    // Standard GeoJSON: [longitude, latitude]
    assert.equal(feature.geometry.coordinates[0], 78.1193);
    assert.equal(feature.geometry.coordinates[1], 9.9195);
    assert.equal(feature.properties.accuracy, "EXACT");
    assert.equal(geojson.metadata.exactCount, 1);
  });

  test("excludes centroid fallback records from GeoJSON feature collections", () => {
    const mockDestinations: UnifiedDestination[] = [
      {
        id: "d-1",
        slug: "valid-temple",
        name: "Valid Temple",
        category: "TEMPLE",
        description: "A real temple",
        latitude: 13.0827,
        longitude: 80.2707,
        locality: "Chennai",
        state: "Tamil Nadu",
        country: "India",
        provenanceTier: "OFFICIAL_STATUTORY",
        verificationStatus: "VERIFIED_OFFICIAL",
        isCentroidFallback: false,
        displayDistance: "0 km",
        facilities: {
          parking: "UNKNOWN",
          wheelchairRamp: "UNKNOWN",
          elevator: "UNKNOWN",
          accessibleRestroom: "UNKNOWN",
          elderlyRestSeating: "UNKNOWN",
          drinkingWater: "UNKNOWN",
          cloakroom: "UNKNOWN",
          prasadam: "UNKNOWN",
        },
      },
      {
        id: "d-2",
        slug: "fallback-temple",
        name: "Fallback Temple",
        category: "TEMPLE",
        description: "A centroid fallback",
        latitude: 13.0827,
        longitude: 80.2707,
        locality: "Chennai",
        state: "Tamil Nadu",
        country: "India",
        provenanceTier: "CURATED_DB",
        verificationStatus: "UNVERIFIED",
        isCentroidFallback: true, // Should be excluded!
        displayDistance: "0 km",
        facilities: {
          parking: "UNKNOWN",
          wheelchairRamp: "UNKNOWN",
          elevator: "UNKNOWN",
          accessibleRestroom: "UNKNOWN",
          elderlyRestSeating: "UNKNOWN",
          drinkingWater: "UNKNOWN",
          cloakroom: "UNKNOWN",
          prasadam: "UNKNOWN",
        },
      },
    ];

    const geojson = unifiedDestinationsToGeoJSON(mockDestinations);
    assert.equal(geojson.features.length, 1);
    assert.equal(geojson.features[0].id, "d-1");
    assert.equal(geojson.metadata.centroidFallbackExcluded, 1);
  });
});
