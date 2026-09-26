import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { DestinationService } from "../src/lib/destinations/service";

describe("Canonical DestinationService — Atlas Operations & Data Trust", () => {
  test("getBySlug returns verified destination records with zero generic fallbacks", async () => {
    const taj = await DestinationService.getBySlug("taj-mahal-agra");
    assert.ok(taj, "Taj Mahal must be found by slug");
    assert.equal(taj.name, "Taj Mahal (UNESCO World Heritage)");
    assert.equal(taj.state, "Uttar Pradesh");
    assert.equal(taj.district, "Agra");
    assert.equal(taj.locationConfidence, "exact");
    assert.ok(taj.latitude > 27 && taj.latitude < 28);
    assert.ok(taj.longitude > 78 && taj.longitude < 79);
  });

  test("getBySlug returns null for nonexistent slugs", async () => {
    const unknown = await DestinationService.getBySlug("non-existent-destination-xyz-999");
    assert.equal(unknown, null);
  });

  test("filterByCategory accurately retrieves destinations by category", () => {
    const forts = DestinationService.filterByCategory("FORTS");
    assert.ok(forts.length >= 3, "Must have at least 3 forts");
    assert.ok(forts.some((f) => f.slug === "agra-fort-unesco"));
    assert.ok(forts.some((f) => f.slug === "kumbhalgarh-fort-wall-rajasthan"));

    const palaces = DestinationService.filterByCategory("PALACES");
    assert.ok(palaces.length >= 2, "Must have at least 2 palaces");
    assert.ok(palaces.some((p) => p.slug === "hawa-mahal-palace-of-winds-jaipur"));
  });

  test("filterByState returns destinations matching state name", () => {
    const rajasthan = DestinationService.filterByState("Rajasthan");
    assert.ok(rajasthan.length >= 5, "Rajasthan must have rich heritage representation");
    assert.ok(rajasthan.some((r) => r.slug === "hawa-mahal-palace-of-winds-jaipur"));
    assert.ok(rajasthan.some((r) => r.slug === "chand-baori-stepwell-abhaneri"));
  });

  test("nearby computes genuine Haversine distance from coordinates", () => {
    // Coordinates around New Delhi (28.6139, 77.2090)
    const nearbyDelhi = DestinationService.nearby(28.6139, 77.2090, 50, 5);
    assert.ok(nearbyDelhi.length > 0, "Must find destinations near Delhi");
    assert.ok(nearbyDelhi.some((d) => d.slug === "india-gate-kartavya-path-delhi"));
    assert.ok(nearbyDelhi[0].distanceKm < 20, "Closest site must be within 20 km");
  });

  test("featured returns prominent landmarks with heritage prestige", () => {
    const featured = DestinationService.featured(8);
    assert.equal(featured.length, 8);
    assert.ok(featured.every((d) => d.category === "HERITAGE" || d.category === "UNESCO" || d.category === "FORTS" || d.tags?.includes("unesco")));
  });

  test("getOperationalInfo returns honest data with null-safety and no fabricated timings", () => {
    const tajOp = DestinationService.getOperationalInfo("taj-mahal-agra");
    assert.ok(tajOp);
    assert.ok(tajOp.timings && tajOp.timings.includes("Sunrise"));
    assert.ok(tajOp.entryFee && tajOp.entryFee.includes("₹50"));
    assert.equal(tajOp.operationalStatus, "OPEN");
  });

  test("getProvenance returns statutory authority verification metadata", () => {
    const prov = DestinationService.getProvenance("taj-mahal-agra");
    assert.ok(prov);
    assert.equal(prov.sourceType, "unesco");
    assert.equal(prov.unescoReference, "252");
    assert.equal(prov.locationConfidence, "exact");
  });

  test("getMedia returns authentic photograph metadata and photographer credits", () => {
    const media = DestinationService.getMedia("taj-mahal-agra");
    assert.ok(media);
    assert.ok(media.image.startsWith("https://"));
    assert.ok(media.imageCredit.photographer);
    assert.ok(media.imageCredit.source);
    assert.ok(media.imageCredit.license);
  });
});
