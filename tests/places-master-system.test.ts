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

  it("correctly models supplemental place classes, multi-faith attributes, and geo-heritage", () => {
    const geoPlace: RawPlaceInput = {
      slug: "st-marys-island-columnar-basalt-malpe",
      name: "St. Mary's Island (GSI Columnar Basaltic Lava Monument)",
      description: "National Geological Monument of columnar basaltic lava.",
      category: "NATURE",
      latitude: 13.3800,
      longitude: 74.6733,
      district: "Udupi",
      state: "Karnataka",
      sourceName: "Geological Survey of India",
      sourceType: "official",
      gsiProtected: true,
      placeKind: "geographic_feature",
      designations: ["GSI National Geological Monument"],
    };

    const sikhPlace: RawPlaceInput = {
      slug: "sri-harmandir-sahib-golden-temple-amritsar",
      name: "Sri Harmandir Sahib",
      description: "Supreme spiritual sanctuary of Sikhism in Amritsar.",
      category: "SACRED",
      latitude: 31.6200,
      longitude: 74.8765,
      district: "Amritsar",
      state: "Punjab",
      sourceName: "SGPC Official",
      sourceType: "official",
      faith: "SIKH",
      placeKind: "religious_site",
    };

    assert.equal(geoPlace.gsiProtected, true);
    assert.equal(geoPlace.placeKind, "geographic_feature");
    assert.equal(sikhPlace.faith, "SIKH");
    assert.equal(sikhPlace.placeKind, "religious_site");
  });

  describe("India All Places Data Expansion Pipeline (2026)", () => {
    it("source registry contains foundational statutory authorities", async () => {
      const { NATIONAL_SOURCE_REGISTRY, getSourceById } = await import("../src/lib/destinations/source-registry.js");
      assert.ok(NATIONAL_SOURCE_REGISTRY.length >= 10);
      assert.ok(getSourceById("asi-national"));
      assert.ok(getSourceById("gsi-geoheritage"));
      assert.ok(getSourceById("unesco-whc"));
      assert.ok(getSourceById("ramsar-india"));
      assert.ok(getSourceById("ntca-india"));
      assert.ok(getSourceById("dc-handicrafts"));
    });

    it("discovery pipeline discovers all candidates with full statutory provenance", async () => {
      const { discoverAllCandidates } = await import("../scripts/pipeline/discover.js");
      const candidates = discoverAllCandidates();
      assert.ok(candidates.length >= 180, "Should discover at least 180 canonical places");
      for (const c of candidates) {
        assert.ok(c.name, "Place must have a name");
        assert.ok(c.slug, "Place must have a slug");
        assert.ok(c.category, "Place must have a category");
        assert.ok(c.state, "Place must have a state");
        assert.ok(c.district, "Place must have a district");
        assert.ok(c.sources.length > 0, "Place must have at least one source");
      }
    });

    it("normalization maps states to official 36 sovereign codes", async () => {
      const { normalizeCandidate } = await import("../scripts/pipeline/normalize.js");
      const sample = {
        id: "test-id",
        slug: "test-place",
        name: "  Test Sanctuary  ",
        category: "WILDLIFE" as const,
        description: "Test description",
        state: "Tamil Nadu",
        district: "Coimbatore",
        latitude: 11.0,
        longitude: 77.0,
        coordinateStatus: "VERIFIED" as const,
        sources: [],
        provenanceTier: "CURATED_DB" as const,
        verificationStatus: "VERIFIED_OFFICIAL" as const,
        pipelineStatus: "DISCOVERED" as const,
      };
      const normalized = normalizeCandidate(sample);
      assert.equal(normalized.name, "Test Sanctuary");
      assert.equal(normalized.stateCode, "TN");
      assert.equal(normalized.country, "India");
    });

    it("validation enforces sovereign envelope (6-37.5 N, 68-97.5 E) and rejects invalid coordinates", async () => {
      const { validateCandidate } = await import("../scripts/pipeline/validate.js");
      const validSample = {
        id: "valid-place",
        slug: "valid-place",
        name: "Valid Place",
        category: "HERITAGE" as const,
        description: "Description",
        state: "Kerala",
        district: "Thrissur",
        latitude: 10.5,
        longitude: 76.2,
        coordinateStatus: "VERIFIED" as const,
        sources: [{ title: "ASI", publisher: "ASI", url: "https://asi.nic.in", sourceType: "STATUTORY" as const }],
        provenanceTier: "OFFICIAL_STATUTORY" as const,
        verificationStatus: "VERIFIED_OFFICIAL" as const,
        pipelineStatus: "VALIDATED" as const,
      };
      const resValid = validateCandidate(validSample);
      assert.equal(resValid.valid, true);

      // Null Island coordinates
      const nullIsland = { ...validSample, latitude: 0.0, longitude: 0.0 };
      assert.equal(validateCandidate(nullIsland).valid, false);

      // Outside India
      const outsideCoords = { ...validSample, latitude: 50.0, longitude: 10.0 };
      assert.equal(validateCandidate(outsideCoords).valid, false);
    });

    it("deduplication detects spatial collisions and merges provenance", async () => {
      const { deduplicateCandidates } = await import("../scripts/pipeline/dedupe.js");
      const candA = {
        id: "p-1",
        slug: "konark-sun-temple-odisha",
        name: "Konark Sun Temple",
        category: "HERITAGE" as const,
        description: "Black Pagoda",
        state: "Odisha",
        district: "Puri",
        latitude: 19.8876,
        longitude: 86.0945,
        coordinateStatus: "VERIFIED" as const,
        sources: [{ title: "UNESCO", publisher: "UNESCO", url: "https://whc.unesco.org", sourceType: "UNESCO" as const }],
        provenanceTier: "INTERNATIONAL_INSTITUTIONAL" as const,
        verificationStatus: "VERIFIED_OFFICIAL" as const,
        pipelineStatus: "VALIDATED" as const,
      };
      const candB = {
        id: "p-2",
        slug: "sun-temple-konark-chariot",
        name: "Sun Temple Konark",
        category: "HERITAGE" as const,
        description: "13th century chariot temple",
        state: "Odisha",
        district: "Puri",
        latitude: 19.8878, // ~25m away
        longitude: 86.0947,
        coordinateStatus: "VERIFIED" as const,
        sources: [{ title: "ASI Gazette", publisher: "ASI", url: "https://asi.nic.in", sourceType: "STATUTORY" as const }],
        provenanceTier: "OFFICIAL_STATUTORY" as const,
        verificationStatus: "VERIFIED_OFFICIAL" as const,
        pipelineStatus: "VALIDATED" as const,
      };

      const result = deduplicateCandidates([candA, candB]);
      assert.equal(result.unique.length, 1);
      assert.equal(result.duplicates.length, 1);
      // Verify merged sources
      assert.equal(result.unique[0].sources.length, 2, "Sources from duplicate should be merged into primary");
    });

    it("data QA audit runs and passes with zero critical errors", async () => {
      const { runDataAudit } = await import("../scripts/pipeline/audit.js");
      const passed = runDataAudit();
      assert.equal(passed, true, "Data QA audit must pass cleanly");
    });
  });
});


