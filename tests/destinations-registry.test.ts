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
  test("contains verified destinations covering all core categories", () => {
    assert.ok(VERIFIED_DESTINATIONS.length >= 10, "Registry must contain rich destinations");

    const categoriesFound = new Set(VERIFIED_DESTINATIONS.map((d) => d.category));
    assert.ok(categoriesFound.has("HERITAGE"), "Must contain HERITAGE destinations");
    assert.ok(categoriesFound.has("NATURE"), "Must contain NATURE destinations");
    assert.ok(categoriesFound.has("BEACHES"), "Must contain BEACHES destinations");
    assert.ok(categoriesFound.has("WILDLIFE"), "Must contain WILDLIFE destinations");
    assert.ok(categoriesFound.has("CULTURE"), "Must contain CULTURE destinations");
    assert.ok(categoriesFound.has("FOOD"), "Must contain FOOD destinations");
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
    assert.equal(hampi.name, "Group of Monuments at Hampi");
    assert.equal(hampi.category, "HERITAGE");

    const nonExistent = getDestinationBySlug("non-existent-destination-xyz");
    assert.equal(nonExistent, undefined);
  });

  test("category metadata defines labels, icons, and hero taglines for all categories", () => {
    const requiredCategories: DestinationCategory[] = [
      "SACRED",
      "HERITAGE",
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
