import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { MapDataEngine, MAP_STYLES } from "../src/lib/map/data-engine";

describe("MapDataEngine — Architecture & Style Fallbacks", () => {
  test("provides multi-tier style specifications including vector, satellite, and carto raster", () => {
    assert.ok(typeof MAP_STYLES.primaryVector === "string");
    assert.ok(MAP_STYLES.primaryVector.includes("openfreemap"));

    assert.ok(typeof MAP_STYLES.primaryLiberty === "string");
    assert.ok(MAP_STYLES.primaryLiberty.includes("liberty"));

    assert.equal(MAP_STYLES.esriSatellite.version, 8);
    assert.ok(MAP_STYLES.esriSatellite.sources["esri-satellite"]);

    assert.equal(MAP_STYLES.cartoDark.version, 8);
    assert.ok(MAP_STYLES.cartoDark.sources["carto-dark"]);
  });

  test("generates standard GeoJSON and filters out null-island / centroid fallbacks", () => {
    const temples = [
      {
        id: "t-1",
        slug: "meenakshi-temple",
        name: "Meenakshi Amman Temple",
        latitude: 9.9195,
        longitude: 78.1193,
        state: "Tamil Nadu",
        stateCode: "TN",
        district: "Madurai",
        category: "TEMPLE",
        googlePlaceId: "ChIJ2-VjU3X4wzsR25a2W41qjQY",
        isCentroidFallback: false,
      },
      {
        id: "t-2",
        slug: "null-island-shrine",
        name: "Corrupt Coordinate Shrine",
        latitude: 0,
        longitude: 0,
        state: "Unknown",
        category: "TEMPLE",
        isCentroidFallback: false,
      },
      {
        id: "t-3",
        slug: "centroid-fallback-shrine",
        name: "Centroid Fallback Shrine",
        latitude: 13.0827,
        longitude: 80.2707,
        state: "Tamil Nadu",
        category: "TEMPLE",
        isCentroidFallback: true, // MUST be excluded
      },
    ];

    const geojson = MapDataEngine.toGeoJSON(temples);
    assert.equal(geojson.type, "FeatureCollection");
    assert.equal(geojson.features.length, 1);
    assert.equal(geojson.features[0].id, "t-1");
    assert.equal(geojson.features[0].geometry.coordinates[0], 78.1193);
    assert.equal(geojson.features[0].geometry.coordinates[1], 9.9195);
    assert.equal(geojson.features[0].properties.accuracy, "EXACT");
    assert.equal(geojson.features[0].properties.href, "/temples/tn/meenakshi-temple");
    assert.equal(geojson.metadata.total, 1);
    assert.equal(geojson.metadata.exactCount, 1);
    assert.equal(geojson.metadata.centroidFallbackExcluded, 1);
  });

  test("filters temples within bounding boxes correctly", () => {
    const temples = [
      {
        id: "south-temple",
        name: "Madurai Meenakshi",
        latitude: 9.9195,
        longitude: 78.1193,
        category: "TEMPLE",
      },
      {
        id: "north-temple",
        name: "Kedarnath Temple",
        latitude: 30.7352,
        longitude: 79.0669,
        category: "TEMPLE",
      },
    ];

    // South India Bounding Box: minLng 75, minLat 8, maxLng 82, maxLat 14
    const southResults = MapDataEngine.filterBbox(temples, {
      minLng: 75.0,
      minLat: 8.0,
      maxLng: 82.0,
      maxLat: 14.0,
    });

    assert.equal(southResults.length, 1);
    assert.equal(southResults[0].id, "south-temple");
  });
});
