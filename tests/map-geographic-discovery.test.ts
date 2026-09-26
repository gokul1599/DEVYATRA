import test, { describe } from "node:test";
import assert from "node:assert/strict";
import {
  getStateBoundary,
  getDistrictBoundary,
  getLocalityBoundary,
  STATE_BOUNDARIES,
  POPULAR_DISTRICTS,
  POPULAR_LOCALITIES,
} from "../src/lib/map/admin-boundaries";
import { MAP_CATEGORIES, getCategoryVisual } from "../src/lib/map/categories";
import { normalizeCategory, isValidCategory } from "../src/lib/destinations/categories";

describe("Map Geographic Discovery & Administrative Hierarchy", () => {
  test("covers all 36 States & Union Territories with authoritative bounds & centers", () => {
    const states = Object.keys(STATE_BOUNDARIES);
    assert.ok(states.length >= 36, `Expected at least 36 States/UTs, found ${states.length}`);

    // Verify Karnataka
    const ka = getStateBoundary("karnataka");
    assert.ok(ka !== null);
    assert.equal(ka?.name, "Karnataka");
    assert.equal(ka?.code, "KA");
    assert.ok(ka?.center.lat > 11 && ka?.center.lat < 19);
    assert.ok(ka?.center.lng > 74 && ka?.center.lng < 79);

    // Verify Uttarakhand
    const uk = getStateBoundary("uttarakhand");
    assert.ok(uk !== null);
    assert.equal(uk?.name, "Uttarakhand");
    assert.equal(uk?.code, "UK");

    // Verify Delhi UT
    const dl = getStateBoundary("delhi");
    assert.ok(dl !== null);
    assert.equal(dl?.type, "union_territory");
  });

  test("resolves key districts with geodetic coordinates and recommended zoom levels", () => {
    // Shivamogga (Waterfalls & Nature hub)
    const shivamogga = getDistrictBoundary("shivamogga");
    assert.ok(shivamogga !== null);
    assert.equal(shivamogga?.name, "Shivamogga");
    assert.equal(shivamogga?.parent, "Karnataka");
    assert.ok(shivamogga?.center.lat > 13.5 && shivamogga?.center.lat < 14.5);

    // Varanasi (Sacred & Heritage hub)
    const varanasi = getDistrictBoundary("Varanasi");
    assert.ok(varanasi !== null);
    assert.equal(varanasi?.name, "Varanasi");
    assert.equal(varanasi?.parent, "Uttar Pradesh");

    // Chamoli (Pancha Kedar & Badrinath Himalayas)
    const chamoli = getDistrictBoundary("chamoli");
    assert.ok(chamoli !== null);
    assert.equal(chamoli?.name, "Chamoli");
    assert.equal(chamoli?.parent, "Uttarakhand");
  });

  test("resolves key localities and pilgrim centers with high-zoom geodetic coordinates", () => {
    // Hampi
    const hampi = getLocalityBoundary("hampi");
    assert.ok(hampi !== null);
    assert.equal(hampi?.name, "Hampi");
    assert.ok(hampi?.parent?.includes("Vijayanagara"));
    assert.ok(hampi?.recommendedZoom >= 13);

    // Jog Falls
    const jogFalls = getLocalityBoundary("jog-falls");
    assert.ok(jogFalls !== null);
    assert.equal(jogFalls?.name, "Jog Falls");
    assert.ok(jogFalls?.parent?.includes("Shivamogga"));

    // Rishikesh
    const rishikesh = getLocalityBoundary("rishikesh");
    assert.ok(rishikesh !== null);
    assert.equal(rishikesh?.name, "Rishikesh");
    assert.ok(rishikesh?.parent?.includes("Uttarakhand"));
  });

  test("validates complete 15-category map taxonomy and category visuals", () => {
    const expectedCategories = [
      "all",
      "sacred",
      "heritage",
      "caves",
      "hills",
      "waterfalls",
      "lakes",
      "nature",
      "beaches",
      "wildlife",
      "parks",
      "family",
      "adventure",
      "culture",
      "food",
      "shopping",
    ];

    for (const catId of expectedCategories) {
      const match = MAP_CATEGORIES.find((c) => c.id === catId);
      assert.ok(match, `Category ${catId} must be present in MAP_CATEGORIES`);
      assert.ok(match?.label, `Category ${catId} must have a user-facing label`);
      assert.ok(match?.iconName, `Category ${catId} must have an iconName`);
    }

    // Verify visual color mapping
    const waterfallsVisual = getCategoryVisual("WATERFALLS");
    assert.equal(waterfallsVisual.id, "waterfalls");
    assert.ok(waterfallsVisual.color);

    const cavesVisual = getCategoryVisual("CAVES");
    assert.equal(cavesVisual.id, "caves");

    const foodVisual = getCategoryVisual("FOOD");
    assert.equal(foodVisual.id, "food");
  });

  test("accurately normalizes category slugs and query parameters", () => {
    assert.equal(normalizeCategory("waterfalls"), "WATERFALLS");
    assert.equal(normalizeCategory("WATERFALLS"), "WATERFALLS");
    assert.equal(normalizeCategory("caves"), "CAVES");
    assert.equal(normalizeCategory("hills"), "HILLS");
    assert.equal(normalizeCategory("heritage"), "HERITAGE");
    assert.equal(normalizeCategory("temples"), "SACRED");
    assert.equal(normalizeCategory("pilgrimage"), "SACRED");
    assert.equal(normalizeCategory("beaches"), "BEACHES");
    assert.equal(normalizeCategory("wildlife"), "WILDLIFE");
    assert.equal(normalizeCategory("parks"), "PARKS");
    assert.equal(normalizeCategory("family"), "FAMILY");
    assert.equal(normalizeCategory("adventure"), "ADVENTURE");
    assert.equal(normalizeCategory("culture"), "CULTURE");
    assert.equal(normalizeCategory("food"), "FOOD");
    assert.equal(normalizeCategory("shopping"), "SHOPPING");

    assert.equal(isValidCategory("WATERFALLS"), true);
    assert.equal(isValidCategory("HERITAGE"), true);
    assert.equal(isValidCategory("INVALID_CAT"), false);
  });
});
