import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { stripNameNoise, nameSimilarity, dedupeById, findNearDuplicates, mergeWithVerified, normalizeNameForMatch, isTempleLike } from "@/lib/google/dedupe";
import type { DiscoveredPlace } from "@/lib/google/types";

function place(p: Partial<DiscoveredPlace> = {}): DiscoveredPlace {
  return {
    id: "p1",
    name: "Chennakeshava Temple",
    address: "Belur",
    latitude: 13.1629,
    longitude: 75.8611,
    types: ["hindu_temple"],
    openNow: null,
    mapsUrl: "https://maps.google.com/?cid=1",
    source: "google",
    certainty: "temple",
    ...p,
  };
}

describe("google/dedupe stripNameNoise", () => {
  it("removes honorific title noise", () => {
    assert.equal(stripNameNoise("Sri Raghavendra Swamy Mutt"), "raghavendra swamy mutt");
    assert.equal(stripNameNoise("Shri Chennakeshava Temple"), "chennakeshava temple");
  });

  it("collapses punctuation and keeps meaningful words", () => {
    assert.equal(stripNameNoise("Sri? Padmanabhaswamy - Temple"), "padmanabhaswamy temple");
  });
});

describe("google/dedupe nameSimilarity", () => {
  it("is 1 for identical normalized names", () => {
    assert.equal(nameSimilarity("Sri Chennakeshava Temple", "Chennakeshava Temple"), 1);
  });

  it("is low for unrelated names", () => {
    assert.ok(nameSimilarity("Chennakeshava Temple", "Railway Station") < 0.5);
  });
});

describe("google/dedupe normalizeNameForMatch", () => {
  it("strips both honorifics and structural words", () => {
    assert.equal(normalizeNameForMatch("Shri Singaravelan Temple"), "singaravelan");
  });
});

describe("google/dedupe dedupeById", () => {
  it("drops repeats of the same Google Place ID", () => {
    const items = [place({ id: "a" }), place({ id: "a" }), place({ id: "b", name: "Other" })];
    assert.equal(dedupeById(items).length, 2);
  });

  it("drops exact-name repeats even with different ids", () => {
    const items = [place({ id: "a" }), place({ id: "b" })];
    assert.equal(dedupeById(items).length, 1);
  });
});

describe("google/dedupe findNearDuplicates", () => {
  it("flags same-name results within the tolerance radius", () => {
    const items = [
      place({ id: "a", name: "Sri Chennakeshava Temple", latitude: 13.1629, longitude: 75.8611 }),
      place({ id: "b", name: "Chennakeshava Temple", latitude: 13.16292, longitude: 75.86113 }),
      place({ id: "c", name: "Railway Station", latitude: 40, longitude: 40 }),
    ];
    const pairs = findNearDuplicates(items);
    assert.equal(pairs.length, 1);
    assert.equal(pairs[0].a, "a");
    assert.equal(pairs[0].b, "b");
  });

  it("does not flag far-apart same-named towns", () => {
    const items = [
      place({ id: "a", name: "Mysuru", latitude: 12.3, longitude: 76.6 }),
      place({ id: "b", name: "Mysuru", latitude: 13, longitude: 80 }),
    ];
    assert.equal(findNearDuplicates(items).length, 0);
  });
});

describe("google/dedupe mergeWithVerified", () => {
  const verified = place({
    id: "verified:t-venkateswara",
    name: "Sri Venkateswara Temple",
    latitude: 13.6811,
    longitude: 79.3478,
    source: "verified",
    verified: { slug: "t-venkateswara", href: "/temples/ap/t-venkateswara", name: "Sri Venkateswara Temple" },
    deity: "Venkateswara",
    description: "On Tirumala hill.",
    region: "Andhra Pradesh",
  });

  it("merges google hit into verified record without overwriting curated fields", () => {
    const google = place({
      id: "g1",
      name: "Venkateswara Temple",
      latitude: 13.6812,
      longitude: 79.3479,
      googlePlaceId: "ChIJg1",
      source: "google",
      openNow: false,
      types: ["hindu_temple"],
    });
    const { items, mergedCount } = mergeWithVerified([google], [verified], { radiusKm: 5 });
    assert.equal(mergedCount, 1);
    const merged = items[0];
    assert.equal(merged.source, "google");
    assert.equal(merged.openNow, false, "live google status survives the merge");
    assert.equal(merged.verified?.href, "/temples/ap/t-venkateswara");
    assert.equal(merged.deity, "Venkateswara");
    assert.equal(merged.description, "On Tirumala hill.");
    assert.equal(merged.region, "Andhra Pradesh");
  });

  it("appends unmatched google places and keeps verified sorted first", () => {
    const far = place({ id: "g2", name: "Some Other Temple", latitude: 20, longitude: 60 });
    const { items } = mergeWithVerified([far], [verified], { radiusKm: 5 });
    assert.equal(items.length, 2);
    assert.equal(items[0].id, "verified:t-venkateswara");
  });
});

describe("google/dedupe isTempleLike", () => {
  it("delegates to classifyTemple certainty", () => {
    assert.equal(isTempleLike(place({ types: ["hindu_temple"] })), true);
    assert.equal(isTempleLike(place({ name: "Hotel", types: ["hotel"] })), false);
  });
});