import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validatePlaceRecord, OFFICIAL_INDIAN_STATES_AND_UTS } from "../scripts/ingest/validate";
import { deduplicatePlaces, normalizeNameForMatch } from "../scripts/ingest/dedupe";
import { normalizeCategory, MASTER_CATEGORIES, getAllCategories } from "../src/lib/destinations/categories";
import type { RawPlaceInput } from "../scripts/ingest/types";

describe("Templeora India Places Master System — Taxonomy & Ingestion Audit", () => {
  it("defines all 15 canonical master categories with icons and statutory authorities", () => {
    const categories = getAllCategories();
    assert.equal(categories.length, 15);

    const expectedKeys = [
      "SACRED", "HERITAGE", "CAVES", "HILLS", "WATERFALLS",
      "LAKES", "NATURE", "BEACHES", "WILDLIFE", "PARKS",
      "FAMILY", "ADVENTURE", "CULTURE", "FOOD", "SHOPPING"
    ];

    for (const key of expectedKeys) {
      assert.ok(MASTER_CATEGORIES[key as keyof typeof MASTER_CATEGORIES], `Missing category ${key}`);
      const cat = MASTER_CATEGORIES[key as keyof typeof MASTER_CATEGORIES];
      assert.ok(cat.subcategories.length > 0, `Category ${key} must have subcategories`);
      assert.ok(cat.authoritativeSources.length > 0, `Category ${key} must have authoritative sources`);
      assert.ok(cat.accentHex.startsWith("#"), `Category ${key} must have a valid accent hex`);
    }
  });

  it("normalizes legacy, variant, and lowercase category names accurately", () => {
    assert.equal(normalizeCategory("temple"), "SACRED");
    assert.equal(normalizeCategory("PILGRIMAGE"), "SACRED");
    assert.equal(normalizeCategory("unesco"), "HERITAGE");
    assert.equal(normalizeCategory("forts"), "HERITAGE");
    assert.equal(normalizeCategory("mountains"), "HILLS");
    assert.equal(normalizeCategory("wetlands"), "LAKES");
    assert.equal(normalizeCategory("cuisine"), "FOOD");
    assert.equal(normalizeCategory("crafts"), "SHOPPING");
    assert.equal(normalizeCategory("theme_park"), "FAMILY");
    assert.equal(normalizeCategory("caves"), "CAVES");
    assert.equal(normalizeCategory("waterfalls"), "WATERFALLS");
    assert.equal(normalizeCategory("wildlife"), "WILDLIFE");
    assert.equal(normalizeCategory("beaches"), "BEACHES");
  });

  it("validates sovereign Indian boundary envelope and rejects coordinates outside India", () => {
    const validPlace: RawPlaceInput = {
      slug: "meenakshi-amman-temple-madurai",
      name: "Meenakshi Amman Temple",
      description: "Historic Dravidian temple complex dedicated to Goddess Meenakshi in Madurai.",
      category: "SACRED",
      latitude: 9.9195,
      longitude: 78.1193,
      district: "Madurai",
      state: "Tamil Nadu",
      sourceName: "HRCE Tamil Nadu",
      sourceType: "official",
    };

    const validRes = validatePlaceRecord(validPlace);
    assert.equal(validRes.valid, true, "Valid Indian place should pass validation");
    assert.equal(validRes.issues.length, 0);

    // Test Null Island (0,0)
    const nullIslandPlace: RawPlaceInput = {
      ...validPlace,
      slug: "null-island",
      latitude: 0.0,
      longitude: 0.0,
    };
    const nullIslandRes = validatePlaceRecord(nullIslandPlace);
    assert.equal(nullIslandRes.valid, false, "Null Island (0,0) must be rejected");

    // Test coordinates outside India (e.g. London: 51.5, -0.12)
    const outsidePlace: RawPlaceInput = {
      ...validPlace,
      slug: "london-eye",
      latitude: 51.5074,
      longitude: -0.1278,
    };
    const outsideRes = validatePlaceRecord(outsidePlace);
    assert.equal(outsideRes.valid, false, "Coordinates outside sovereign India bounds must be rejected");
  });

  it("strictly validates Indian state against the 36 official States and UTs", () => {
    assert.equal(OFFICIAL_INDIAN_STATES_AND_UTS.size, 36);
    assert.ok(OFFICIAL_INDIAN_STATES_AND_UTS.has("Tamil Nadu"));
    assert.ok(OFFICIAL_INDIAN_STATES_AND_UTS.has("Ladakh"));
    assert.ok(OFFICIAL_INDIAN_STATES_AND_UTS.has("Lakshadweep"));
    assert.ok(OFFICIAL_INDIAN_STATES_AND_UTS.has("Arunachal Pradesh"));

    const invalidStatePlace: RawPlaceInput = {
      slug: "invalid-state-place",
      name: "Some Place",
      description: "A description of a place in a non-existent state.",
      category: "HERITAGE",
      latitude: 19.0760,
      longitude: 72.8777,
      district: "Mumbai",
      state: "Atlantis",
      sourceName: "Fictional Gazette",
      sourceType: "unverified",
    };
    const res = validatePlaceRecord(invalidStatePlace);
    assert.equal(res.valid, false);
    assert.ok(res.issues.some((i) => i.field === "state"));
  });

  it("detects and flags exact and spatial duplicate places within 500 meters", () => {
    const basePlace: RawPlaceInput = {
      slug: "hampi-virupaksha-temple",
      name: "Virupaksha Temple",
      description: "7th-century CE monument dedicated to Lord Virupaksha on the banks of Tungabhadra River.",
      category: "SACRED",
      latitude: 15.3350,
      longitude: 76.4600,
      district: "Vijayanagara",
      state: "Karnataka",
      sourceName: "ASI",
      sourceType: "official",
    };

    const duplicateSlugPlace: RawPlaceInput = {
      ...basePlace,
      name: "Virupaksha Temple Copy",
    };

    const nearSpatialDuplicate: RawPlaceInput = {
      ...basePlace,
      slug: "sri-virupaksha-sanctum",
      name: "Sri Virupaksha Temple",
      latitude: 15.3352, // ~25 meters away
      longitude: 76.4601,
    };

    const dedupeReport = deduplicatePlaces([basePlace, duplicateSlugPlace, nearSpatialDuplicate]);
    assert.equal(dedupeReport.unique.length, 1, "Only one unique place should remain");
    assert.equal(dedupeReport.duplicates.length, 2, "Two duplicates should be flagged");
    assert.ok(dedupeReport.duplicates[0].reason.includes("Duplicate slug"));
    assert.ok(dedupeReport.duplicates[1].reason.includes("Spatial duplicate"));
  });

  it("normalizes names correctly for fuzzy duplicate comparison", () => {
    assert.equal(normalizeNameForMatch("Ajanta Caves (UNESCO World Heritage)"), "ajanta caves unesco world heritage");
    assert.equal(normalizeNameForMatch("Kailasa  Temple - Cave 16"), "kailasa temple cave 16");
  });
});
