import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  TEMPLES,
  TEMPLE_INDEX,
  getState,
  getDistrict,
  getTemple,
  templeUrl,
  getFestivalAll,
  nearbyFor,
  NEARBY,
} from "@/lib/registry";
import {
  type TempleBadge,
  type NearbyKind,
  type VerificationStatus,
} from "@/lib/types";
import { slugify } from "@/lib/data/temples";

const VERIFY_STATUSES: VerificationStatus[] = [
  "VERIFIED_OFFICIAL",
  "GOVERNMENT_SOURCE",
  "TRUSTED_SOURCE",
  "COMMUNITY_REPORTED",
  "UNVERIFIED",
];

const BADGES: TempleBadge[] = [
  "Historic",
  "Major Pilgrimage",
  "Heritage",
  "Online Booking",
  "Free Entry",
  "Festival",
  "Verified",
  "UNESCO World Heritage",
];

const NEARBY_KINDS: NearbyKind[] = [
  "temple",
  "restaurant",
  "hotel",
  "attraction",
  "parking",
  "hospital",
  "pharmacy",
  "restroom",
  "atm",
  "fuel",
  "transport",
  "police",
  "shopping",
  "nature",
];

describe("temple data integrity", () => {
  it("has at least 25 temples, each with unique id and slug", () => {
    assert.ok(TEMPLES.length >= 25, `expected >= 25 temples, got ${TEMPLES.length}`);
    assert.equal(new Set(TEMPLES.map((t) => t.id)).size, TEMPLES.length, "duplicate temple ids");
    assert.equal(new Set(TEMPLES.map((t) => t.slug)).size, TEMPLES.length, "duplicate temple slugs");
  });

  it("indexes id and slug for every temple", () => {
    for (const t of TEMPLES) {
      assert.equal(TEMPLE_INDEX.get(t.id), t, `index missing id ${t.id}`);
      assert.equal(TEMPLE_INDEX.get(t.slug), t, `index missing slug ${t.slug}`);
    }
  });

  it("links every temple to a real state with a routable URL", () => {
    for (const t of TEMPLES) {
      const st = getState(t.stateCode);
      assert.ok(st, `${t.id} has unknown stateCode ${t.stateCode}`);
      assert.ok(st.slug, `${st.code} has no slug`);
      assert.ok(templeUrl(t).startsWith("/temples/"), `${t.id} has broken url ${templeUrl(t)}`);
      assert.ok(getTemple(t.slug), `${t.id} unreachable by slug`);
    }
  });

  it("places every districtSlug inside its state's district list", () => {
    for (const t of TEMPLES) {
      const st = getState(t.stateCode)!;
      const ok = st.districts.some((d) => slugify(d) === t.districtSlug);
      assert.ok(ok, `${t.id} districtSlug ${t.districtSlug} not a district of ${st.name}`);
      const d = getDistrict(st.code, t.districtSlug);
      assert.ok(d, `${t.id} getDistrict failed`);
      assert.ok(d!.temples.some((x) => x.id === t.id), `${t.id} missing from its district listing`);
    }
  });

  it("gives every temple a populated record", () => {
    for (const t of TEMPLES) {
      assert.ok(t.name.length > 1, `${t.id} missing name`);
      assert.ok(t.mainDeity, `${t.id} missing mainDeity`);
      assert.ok(t.deities.length > 0, `${t.id} missing deities`);
      assert.ok(t.description.length > 80, `${t.id} description too short`);
      assert.ok(t.whyFamous.length > 0, `${t.id} missing whyFamous`);
      assert.ok(t.history.length > 0, `${t.id} missing history`);
      assert.ok(["village", "town", "city"].includes(t.locationKind), `${t.id} bad locationKind ${t.locationKind}`);
      for (const b of t.badges) assert.ok(BADGES.includes(b), `${t.id} unknown badge ${b}`);
    }
  });

  it("validates booking semantics against the trust rules", () => {
    for (const t of TEMPLES) {
      const b = t.booking;
      assert.ok(["free", "paid", "unavailable"].includes(b.generalDarshan), `${t.id} bad generalDarshan`);
      assert.ok(
        ["online", "offline", "unavailable", "free"].includes(b.bookingMode),
        `${t.id} bad bookingMode ${b.bookingMode}`
      );
      assert.ok(VERIFY_STATUSES.includes(b.verification.status), `${t.id} bad booking status`);
      if (b.bookingUrl && b.bookingMode !== "online" && b.bookingMode !== "free") {
        assert.fail(`${t.id} has url ${b.bookingUrl} but bookingMode ${b.bookingMode}`);
      }
      if (t.verified) {
        assert.notEqual(
          b.verification.status,
          "UNVERIFIED",
          `${t.id} marked verified but booking unverified`
        );
      }
    }
  });

  it("keeps timing verification honest", () => {
    for (const t of TEMPLES) {
      if (!t.timings) continue;
      assert.ok(t.timings.slots.length > 0, `${t.id} empty timings slots`);
      assert.ok(VERIFY_STATUSES.includes(t.timings.verification.status), `${t.id} bad timings status`);
      for (const s of t.timings.slots) {
        if (s.opening) assert.match(s.opening, /^\d{2}:\d{2}$/, `${t.id} malformed opening ${s.opening}`);
        if (s.closing) assert.match(s.closing, /^\d{2}:\d{2}$/, `${t.id} malformed closing ${s.closing}`);
      }
    }
  });

  it("validates festivals (1-based month, bounded day, unique ids, own temple)", () => {
    const all = getFestivalAll();
    assert.equal(all.length, TEMPLES.reduce((n, t) => n + t.festivals.length, 0));
    assert.equal(new Set(all.map((f) => f.id)).size, all.length, "duplicate festival ids");
    for (const f of all) {
      assert.ok(f.month >= 1 && f.month <= 12, `festival ${f.id} bad month ${f.month}`);
      assert.ok(f.day >= 1 && f.day <= 31, `festival ${f.id} bad day ${f.day}`);
      assert.ok(f.dateLabel.length > 0, `festival ${f.id} missing label`);
      assert.ok(f.description.length > 40, `festival ${f.id} short description`);
      assert.equal(getTemple(f.templeId)?.id, f.templeId, `festival ${f.id} orphan temple ${f.templeId}`);
    }
  });

  it("validates every nearby place against its temple and kind contract", () => {
    const ids = new Set<string>();
    for (const [templeId, places] of Object.entries(NEARBY)) {
      assert.ok(getTemple(templeId), `nearby group for unknown temple ${templeId}`);
      assert.equal(nearbyFor(templeId), places, "nearbyFor must return its group");
      for (const p of places) {
        assert.ok(!ids.has(p.id), `duplicate nearby id ${p.id}`);
        ids.add(p.id);
        assert.ok(NEARBY_KINDS.includes(p.kind), `nearby ${p.id} bad kind ${p.kind}`);
        assert.ok(p.distanceKm >= 0, `nearby ${p.id} negative distance`);
        assert.ok(p.name.length > 1, `nearby ${p.id} missing name`);
        if (p.url) assert.ok(p.url.startsWith("http"), `nearby ${p.id} bad url`);
      }
    }
    assert.ok(ids.size > 0, "no nearby data at all");
  });

  it("keeps per-state district slugs collision-free", () => {
    for (const t of TEMPLES) {
      const s = getState(t.stateCode)!;
      const dDups = s.districts.map(slugify).filter((x, i, all) => all.indexOf(x) !== i);
      assert.deepEqual(dDups, [], `${s.code} districts collide after slugify`);
    }
  });
});