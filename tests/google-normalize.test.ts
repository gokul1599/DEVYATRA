import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { toGooglePlace, toDiscoveredPlace, classifyTemple, isOtherWorship, modeSummary, OTHER_WORSHIP_TYPES } from "@/lib/google/normalize";

function raw(p: Partial<import("@/lib/google/normalize").RawGooglePlace> = {}): import("@/lib/google/normalize").RawGooglePlace {
  return {
    id: "places/ChIJx",
    displayName: { text: "Sri Meenakshi Amman Temple" },
    formattedAddress: "Madurai Main, Tamil Nadu",
    location: { latitude: 9.9196, longitude: 78.1198 },
    types: ["hindu_temple", "tourist_attraction"],
    primaryType: "hindu_temple",
    googleMapsUri: "https://maps.google.com/?cid=1",
    businessStatus: "OPERATIONAL",
    regularOpeningHours: { openNow: true, weekdayDescriptions: ["Monday: 5:30 AM – 12:30 PM"] },
    photos: [{ name: "places/ChIJx/photos/abc" }],
    ...p,
  };
}

describe("google/normalize toGooglePlace", () => {
  it("maps a well-formed raw place", () => {
    const g = toGooglePlace(raw())!;
    assert.equal(g.placeId, "places/ChIJx");
    assert.equal(g.displayName, "Sri Meenakshi Amman Temple");
    assert.equal(g.latitude, 9.9196);
    assert.equal(g.primaryType, "hindu_temple");
    assert.equal(g.openingHours?.openNow, true);
    assert.deepEqual(g.openingHours?.weekdayDescriptions, ["Monday: 5:30 AM – 12:30 PM"]);
    assert.equal(g.retrievedAt.length, 24);
  });

  it("drops places without id, name or usable coordinates", () => {
    assert.equal(toGooglePlace(raw({ id: undefined })), null);
    assert.equal(toGooglePlace(raw({ displayName: undefined })), null);
    assert.equal(toGooglePlace(raw({ location: { latitude: undefined as unknown as number, longitude: 78 } })), null);
    assert.equal(toGooglePlace(raw({ location: undefined })), null);
  });

  it("falls back to shortFormattedAddress and a place_id maps URL", () => {
    const g = toGooglePlace(raw({ formattedAddress: undefined, shortFormattedAddress: "Belur, Karnataka", googleMapsUri: undefined }))!;
    assert.equal(g.formattedAddress, "Belur, Karnataka");
    assert.equal(g.googleMapsUri, "https://www.google.com/maps/place/?q=place_id:places/ChIJx");
  });
});

describe("google/normalize isOtherWorship", () => {
  it("excludes non-Hindu worship types", () => {
    for (const t of ["church", "mosque", "gurdwara", "synagogue", "masjid", "cathedral", "chapel"]) {
      assert.equal(isOtherWorship([t]), true, `${t} should be excluded`);
    }
    assert.equal(isOtherWorship(["hindu_temple", "tourist_attraction"]), false);
    assert.equal(isOtherWorship([]), false);
  });

  it("treats temple-adjacent geocode kinds as NOT other-worship", () => {
    assert.equal(OTHER_WORSHIP_TYPES.has("hindu_temple"), false);
  });
});

describe("google/normalize classifyTemple", () => {
  it("certain: temple for strict temple types", () => {
    const g = classifyTemple({ name: "Whatever Plaza", types: ["hindu_temple"] });
    assert.deepEqual(g, { certainty: "temple", templeLike: true, excluded: false });
  });

  it("religious_site and included for generic worship types", () => {
    const g = classifyTemple({ name: "Anything", types: ["place_of_worship"] });
    assert.equal(g.templeLike, true);
    assert.equal(g.certainty, "religious_site");
  });

  it("name signals give likely_temple (temple) without types, temple with empty types", () => {
    const withTypes = classifyTemple({ name: "Koodal Azhagar Mandir", types: ["point_of_interest"] });
    assert.equal(withTypes.certainty, "likely_temple");
    const noTypes = classifyTemple({ name: "Chennakeshava Temple", types: [] });
    assert.equal(noTypes.certainty, "temple");
  });

  it("rejects commercial/service places even with religious names", () => {
    const g = classifyTemple({ name: "Rama Lodge", types: ["hotel", "lodging"] });
    assert.equal(g.templeLike, false);
    assert.equal(g.excluded, true);
    assert.match(g.exclusionReason ?? "", /hotel/);
  });

  it("accepts deity-name hints as religious_site", () => {
    const g = classifyTemple({ name: "Hanuman Marg", types: ["route"] });
    assert.equal(g.certainty, "religious_site");
    assert.equal(g.templeLike, true);
  });

  it("rejects unsignalable places", () => {
    const g = classifyTemple({ name: "Quick Mart", types: ["store"] });
    assert.equal(g.templeLike, false);
    assert.equal(g.exclusionReason, "Non-temple primary type: store");
  });
});

describe("google/normalize toDiscoveredPlace", () => {
  it("produces a DiscoveredPlace with google source and computed certainty", () => {
    const d = toDiscoveredPlace(toGooglePlace(raw())!);
    assert.equal(d.id, "places/ChIJx");
    assert.equal(d.source, "google");
    assert.equal(d.certainty, "temple");
    assert.equal(d.openNow, true);
    assert.equal(d.businessStatus, "OPERATIONAL");
    assert.equal(d.mapsUrl, "https://maps.google.com/?cid=1");
    assert.equal(d.region, undefined);
  });

  it("records distance and custom source when requested", () => {
    const d = toDiscoveredPlace(toGooglePlace(raw())!, { source: "cached", distanceKm: 3.2 });
    assert.equal(d.source, "cached");
    assert.equal(d.distanceKm, 3.2);
  });
});

describe("google/normalize modeSummary", () => {
  it("maps business statuses to live-data copy", () => {
    assert.match(modeSummary("OPERATIONAL"), /Open/);
    assert.match(modeSummary("CLOSED_TEMPORARILY"), /Temporarily closed/);
    assert.match(modeSummary("CLOSED_PERMANENTLY"), /Permanently closed/);
    assert.equal(modeSummary(undefined), "");
  });
});