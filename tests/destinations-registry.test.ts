import test, { describe } from "node:test";
import assert from "node:assert/strict";
import {
  VERIFIED_DESTINATIONS,
  CATEGORY_METADATA,
  queryDestinations,
  getDestinationBySlug,
  type DestinationCategory,
} from "../src/lib/destinations/registry";
import { isValidCoordinate, isWithinIndiaBounds } from "../src/lib/map/location-quality";

describe("V3.0 Destination & Experience Registry — Data Integrity & Provenance", () => {
  test("contains verified destinations covering all core categories including caves, hills, waterfalls", () => {
    assert.ok(VERIFIED_DESTINATIONS.length >= 80, "Registry must contain rich destinations (>= 80)");

    const categoriesFound = new Set(VERIFIED_DESTINATIONS.map((d) => d.category));
    assert.ok(categoriesFound.has("HERITAGE"), "Must contain HERITAGE destinations");
    assert.ok(categoriesFound.has("CAVES"), "Must contain CAVES destinations");
    assert.ok(categoriesFound.has("HILLS"), "Must contain HILLS destinations");
    assert.ok(categoriesFound.has("WATERFALLS"), "Must contain WATERFALLS destinations");
    assert.ok(categoriesFound.has("LAKES"), "Must contain LAKES destinations");
    assert.ok(categoriesFound.has("NATURE"), "Must contain NATURE destinations");
    assert.ok(categoriesFound.has("BEACHES"), "Must contain BEACHES destinations");
    assert.ok(categoriesFound.has("WILDLIFE"), "Must contain WILDLIFE destinations");
    assert.ok(categoriesFound.has("CULTURE"), "Must contain CULTURE destinations");
    assert.ok(categoriesFound.has("FOOD"), "Must contain FOOD destinations");
    assert.ok(categoriesFound.has("PARKS"), "Must contain PARKS destinations");
    assert.ok(categoriesFound.has("FAMILY"), "Must contain FAMILY destinations");
    assert.ok(categoriesFound.has("ADVENTURE"), "Must contain ADVENTURE destinations");
  });

  test("covers all 28 Indian States and 8 Union Territories with zero forgotten territories", () => {
    const EXPECTED_28_STATES = [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
      "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
      "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
      "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
      "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
      "Uttar Pradesh", "Uttarakhand", "West Bengal"
    ];

    const EXPECTED_8_UNION_TERRITORIES = [
      "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
      "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
    ];

    const statesCovered = new Set(VERIFIED_DESTINATIONS.map((d) => d.state));

    for (const stateName of EXPECTED_28_STATES) {
      assert.ok(statesCovered.has(stateName), `State "${stateName}" must have representation in the registry`);
    }

    for (const utName of EXPECTED_8_UNION_TERRITORIES) {
      assert.ok(statesCovered.has(utName), `Union Territory "${utName}" must have representation in the registry`);
    }

    assert.equal(statesCovered.size, 36, "All 36 States and UTs must be covered");
  });

  test("all destinations possess genuine coordinates strictly within India's sovereign envelope", () => {
    for (const d of VERIFIED_DESTINATIONS) {
      assert.ok(
        isValidCoordinate(d.latitude, d.longitude),
        `Destination ${d.name} has invalid coordinates (${d.latitude}, ${d.longitude})`
      );
      assert.ok(
        isWithinIndiaBounds(d.latitude, d.longitude),
        `Destination ${d.name} coordinates (${d.latitude}, ${d.longitude}) fall outside sovereign territory of India`
      );
    }
  });

  test("all destinations have authentic imagery and strict license provenance", () => {
    for (const d of VERIFIED_DESTINATIONS) {
      assert.ok(d.image && d.image.startsWith("https://"), `${d.name} must have a valid HTTPS image URL`);
      assert.ok(d.imageCredit, `${d.name} must have image credit metadata`);
      assert.ok(d.imageCredit.photographer, `${d.name} must attribute the photographer`);
      assert.ok(d.imageCredit.license, `${d.name} must declare licensing`);
      assert.ok(d.provenance.sourceType, `${d.name} must declare provenance source type`);
    }
  });

  test("queryDestinations filters properly by category, state, and search query", () => {
    // 1. Category Filter
    const heritage = queryDestinations({ category: "HERITAGE" });
    assert.ok(heritage.items.length > 0);
    assert.ok(heritage.items.every((d) => d.category === "HERITAGE"));

    const caves = queryDestinations({ category: "CAVES" });
    assert.ok(caves.items.length > 0);
    assert.ok(caves.items.every((d) => d.category === "CAVES"));

    const hills = queryDestinations({ category: "HILLS" });
    assert.ok(hills.items.length > 0);
    assert.ok(hills.items.every((d) => d.category === "HILLS"));

    const waterfalls = queryDestinations({ category: "WATERFALLS" });
    assert.ok(waterfalls.items.length > 0);
    assert.ok(waterfalls.items.every((d) => d.category === "WATERFALLS"));

    const lakes = queryDestinations({ category: "LAKES" });
    assert.ok(lakes.items.length > 0);
    assert.ok(lakes.items.every((d) => d.category === "LAKES"));

    const beaches = queryDestinations({ category: "BEACHES" });
    assert.ok(beaches.items.length > 0);
    assert.ok(beaches.items.every((d) => d.category === "BEACHES"));

    // 2. State Filter
    const karnataka = queryDestinations({ state: "Karnataka" });
    assert.ok(karnataka.items.length > 0);
    assert.ok(karnataka.items.every((d) => d.state.toLowerCase().includes("karnataka")));

    // 3. Search query
    const hampi = queryDestinations({ query: "Hampi" });
    assert.ok(hampi.items.length >= 1);
    assert.equal(hampi.items[0].slug, "hampi-group-of-monuments");
  });

  test("getDestinationBySlug resolves exact canonical entries", () => {
    const hampi = getDestinationBySlug("hampi-group-of-monuments");
    assert.ok(hampi);
    assert.equal(hampi.name, "Group of Monuments at Hampi (UNESCO)");
    assert.equal(hampi.category, "HERITAGE");

    const ajanta = getDestinationBySlug("ajanta-caves");
    assert.ok(ajanta);
    assert.equal(ajanta.name, "Ajanta Caves (UNESCO World Heritage)");
    assert.equal(ajanta.category, "CAVES");

    const dalLake = getDestinationBySlug("dal-lake-and-shikara-srinagar");
    assert.ok(dalLake);
    assert.equal(dalLake.category, "LAKES");

    const nonExistent = getDestinationBySlug("non-existent-destination-xyz");
    assert.equal(nonExistent, undefined);
  });

  test("category metadata defines labels, icons, and hero taglines for all categories", () => {
    const requiredCategories: DestinationCategory[] = [
      "SACRED",
      "HERITAGE",
      "CAVES",
      "HILLS",
      "WATERFALLS",
      "LAKES",
      "NATURE",
      "BEACHES",
      "PARKS",
      "WILDLIFE",
      "ADVENTURE",
      "CULTURE",
      "FAMILY",
      "FOOD",
      "SHOPPING",
    ];

    for (const cat of requiredCategories) {
      const meta = CATEGORY_METADATA[cat];
      assert.ok(meta, `Missing metadata for category: ${cat}`);
      assert.ok(meta.label, `Missing label for ${cat}`);
      assert.ok(meta.icon, `Missing icon for ${cat}`);
      assert.ok(meta.heroTagline, `Missing heroTagline for ${cat}`);
    }
  });
});
