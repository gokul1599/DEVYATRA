import { describe, it, afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { discoverTemples } from "@/lib/discovery/engine";

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function canned(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function googlePlace(id: string, name: string, lat: number, lng: number, types: string[]) {
  return {
    id,
    displayName: { text: name, languageCode: "en" },
    formattedAddress: `${name} Rd, Karnataka`,
    location: { latitude: lat, longitude: lng },
    primaryType: types[0],
    types,
    googleMapsUri: `https://maps.google.com/?cid=${id}`,
    businessStatus: "OPERATIONAL",
    regularOpeningHours: { openNow: true, weekdayDescriptions: ["Monday: 6:00 AM – 8:00 PM"] },
  };
}

const REAL_FETCH = globalThis.fetch as FetchLike;
let envDirty = false;
const savedKey = process.env.GOOGLE_MAPS_API_KEY;

beforeEach(() => {
  process.env.GOOGLE_MAPS_API_KEY = "test-key";
  envDirty = false;
});

afterEach(() => {
  globalThis.fetch = REAL_FETCH;
  if (envDirty) process.env.GOOGLE_MAPS_API_KEY = savedKey;
});

describe("google/discovery discoverTemples (mocked fetch)", () => {
  it("returns mode degraded without a configured key (honest verified fallback)", async () => {
    process.env.GOOGLE_MAPS_API_KEY = "";
    envDirty = true;
    const r = await discoverTemples({ query: "temple in Varanasi" });
    assert.equal(r.mode, "degraded");
    assert.deepEqual(r.via, ["verified"]);
    assert.ok(r.items.length >= 1, "expected at least one verified temple for Varanasi");
    assert.ok(r.items.every((p) => p.source === "verified"));
    assert.equal(r.usedQueries.length, 0);
    assert.ok(r.warnings.length > 0, "degraded mode must carry an honest warning");
  });

  it("runs diversified text queries and merges near-duplicates", async () => {
    globalThis.fetch = (async (input, init) => {
      const url = String(input);
      if (!url.includes("places:searchText")) return canned({ error: { message: "unexpected" } }, 404);
      const query = (init?.body ? JSON.parse(String(init.body)).textQuery : "") as string;
      const cardinal = googlePlace("ChIJcard", "Kashi Vishwanath Temple", 25.3109, 83.0107, ["hindu_temple"]);
      const dup = googlePlace("ChIJdup", "Shri Kashi Vishwanath Temple", 25.31093, 83.01074, ["hindu_temple"]);
      const church = googlePlace("ChIJchurch", "Sacred Heart Church", 25.311, 83.011, ["church", "place_of_worship"]);
      const hotel = googlePlace("ChIJhotel", "Kashi Lodge", 25.311, 83.0115, ["hotel", "lodging"]);
      const mutt = googlePlace("ChIJmutt", "Kashi Sanatan Mutt", 25.313, 83.012, ["point_of_interest"]);
      const places = query.toLowerCase().includes("shiva") ? [cardinal, dup, mutt] : query.toLowerCase().includes("hindu") ? [cardinal, church] : [cardinal, hotel, mutt];
      return canned({ places });
    }) as FetchLike;

    const r = await discoverTemples({ query: "Shiva temples in Varanasi", forceLive: true });
    assert.equal(r.mode, "live");
    assert.ok(r.usedQueries.length > 0);
    assert.ok(r.usedQueries.every((q) => /temples in/i.test(q)));
    assert.equal(r.count, 2, "expected the near-duplicate to collapse, keeping cardinal + mutt");
    assert.equal(r.items[0].name, "Kashi Vishwanath Temple");
    assert.ok(!r.items.some((p) => p.name === "Shri Kashi Vishwanath Temple"), "near-duplicate must be dropped");
    assert.equal(r.items[0].openNow, true);
    assert.equal(r.items[0].source, "google");
    assert.ok(!r.items.some((p) => p.types.includes("church") || p.types.includes("hotel")), "non-temple entries must be filtered");
    assert.ok(r.warnings.some((w) => /Merged 1/.test(w)), "dedupe should be surfaced in warnings");
  });

  it("surfaces per-query failures as warnings instead of a hard crash (honest, not invented results)", async () => {
    globalThis.fetch = (async () => {
      throw new Error("boom");
    }) as FetchLike;

    const r = await discoverTemples({ query: "Shiva temples in Varanasi", forceLive: true });
    assert.equal(r.mode, "live");
    assert.equal(r.count, 0, "no fabricate results on failure");
    assert.ok(r.warnings.some((w) => /failed/i.test(w)), "query failures must be surfaced");
  });

  it("nearby discovery expands radius when first pass is thin", async () => {
    const calls: Array<{ radiusM: number }> = [];
    globalThis.fetch = (async (_input, init) => {
      const url = String(_input);
      if (!url.includes("places:searchNearby")) return canned({ error: { message: "unexpected" } }, 404);
      const body = JSON.parse(String(init?.body ?? "{}"));
      calls.push({ radiusM: Number(body.locationRestriction?.circle?.radius ?? 0) });
      if (calls.length === 1) return canned({ places: [] });
      return canned({
        places: [googlePlace("ChIJn1", "Temple One", 12.3039, 76.6446, ["hindu_temple"]), googlePlace("ChIJn2", "Mysuru Lakshmi Temple", 12.306, 76.648, ["hindu_temple"])],
      });
    }) as FetchLike;

    const r = await discoverTemples({ center: { latitude: 12.3, longitude: 76.64 }, radiusKm: 10, forceLive: true });
    assert.equal(r.mode, "live");
    assert.equal(r.queryType, "nearby");
    assert.equal(r.count, 2);
    assert.ok(calls.length >= 2, "radius should have expanded");
    assert.ok(calls[calls.length - 1].radiusM > calls[0].radiusM);
    assert.ok(r.items[0].distanceKm !== undefined);
  });
});