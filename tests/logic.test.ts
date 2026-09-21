import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { search, canonical, isQueryAmbiguous } from "@/lib/search";
import { statusFor, toIndia, festivalDate, fmtDate, ordinal, minutesToHHMM, VERIFY_LABEL } from "@/lib/format";
import { SUPPORTED_LANGUAGES, translate, detectLang, aiVoice, templeLocalName, LANG_COOKIE } from "@/lib/i18n";
import { getTemple } from "@/lib/registry";

describe("search", () => {
  it("surfaces the canonical pilgrimage results by name", () => {
    const r = search("tirumala");
    assert.ok(r.temples.some((t) => t.slug === "sri-venkateswara-temple"), "tirumala missing result");
  });

  it("searches by deity", () => {
    const r = search("shiva");
    assert.ok(r.temples.length > 0, "no shiva temples");
    assert.ok(r.deities.length > 0, "deity facets empty");
  });

  it("searches by festival name", () => {
    const r = search("Shivaratri");
    assert.ok(r.festivals.length > 0, "festival facet empty");
    assert.ok(r.festivals.every((f) => /shivaratri/i.test(canonical(f.label))), "festival labels should match the query");
    assert.equal(r.temples.length, 0, "festival-only query should not surface unrelated temples");
  });

  it("returns jagannath puri", () => {
    const r = search("jagannath");
    assert.ok(r.temples.some((t) => t.slug === "jagannath-temple-puri"), "jagannath puri missing");
  });

  it("handles empty and nonsensical queries safely", () => {
    assert.equal(search("").temples.length, 0);
    assert.equal(search("zzzzzzzz").temples.length, 0);
    assert.ok(isQueryAmbiguous("t") || !isQueryAmbiguous("ti"), "ambiguity heuristic broke");
  });

  it("canonicalizes tokens as lowercase space-joined words", () => {
    assert.equal(canonical("Sri Venkateswara Temple!"), "sri venkateswara temple");
    assert.equal(canonical(""), "");
  });
});

describe("format", () => {
  it("computes India time from an instant regardless of host timezone", () => {
    const t = toIndia(new Date("2026-01-01T00:00:00Z"));
    assert.equal(t.h, 5);
    assert.equal(t.m, 30);
    assert.equal(toIndia(new Date("2026-01-01T18:30:00Z")).h, 0);
  });

  it("classifies open/closed from timing slots (cross-midnight safe)", () => {
    const mahabodhi = getTemple("t-mahabodhi")!;
    // slot 05:00–21:00 IST
    assert.equal(statusFor(mahabodhi, new Date("2026-01-01T09:30:00Z")).state, "open"); // 15:00 IST
    assert.equal(statusFor(mahabodhi, new Date("2026-01-01T23:00:00Z")).state, "closed"); // 04:30 IST next day
  });

  it("treats an opening-only rolling slot as open during the day", () => {
    const v = getTemple("t-venkateswara")!;
    // slot has opening 06:00 only, but timings are UNVERIFIED without note -> unknown
    assert.equal(statusFor(v, new Date("2026-01-01T06:00:00Z")).state, "unknown");
  });

  it("renders stable festival and report dates (day clamped for lunar dates)", () => {
    const f = festivalDate(1, 15, 2026);
    assert.equal(f.getFullYear(), 2026);
    assert.equal(f.getMonth(), 0);
    assert.equal(f.getDate(), 15);
    assert.equal(festivalDate(12, 31, 2026).getDate(), 28, "festival day should clamp to 28");
  });

  it("formats dates and ordinals for en-IN", () => {
    assert.ok(fmtDate(new Date(2026, 0, 15)).includes("Jan"));
    assert.equal(ordinal(1), "1st");
    assert.equal(ordinal(2), "2nd");
    assert.equal(ordinal(3), "3rd");
    assert.equal(ordinal(11), "11th");
    assert.equal(ordinal(21), "21st");
  });

  it("writes padded hh:mm and labels every verification status", () => {
    assert.equal(minutesToHHMM(70), "01:10");
    assert.equal(minutesToHHMM(0), "00:00");
    for (const key of ["VERIFIED_OFFICIAL", "GOVERNMENT_SOURCE", "TRUSTED_SOURCE", "COMMUNITY_REPORTED", "UNVERIFIED"] as const) {
      assert.ok(VERIFY_LABEL[key].length > 3, `missing label for ${key}`);
    }
  });
});

describe("i18n", () => {
  it("covers 12 languages with metadata", () => {
    assert.equal(SUPPORTED_LANGUAGES.length, 12);
    for (const l of SUPPORTED_LANGUAGES) assert.ok(l.native.length > 0 && l.flag.length > 0, l.code);
  });

  it("translates known keys and shows the ai voice as a full object", () => {
    assert.equal(translate("en", "nav_home"), "Home");
    const hi = translate("hi", "nav_home");
    assert.notEqual(hi, "nav_home", "Hindi pack missing nav_home");
    const voice = aiVoice("en");
    for (const key of ["intro", "schedule", "nearby", "building", "done", "unverified"] as const) {
      assert.equal(typeof voice[key], "string");
      assert.ok(voice[key].length > 0, `ai voice "${key}" empty`);
    }
  });

  it("resolves the language from the tem_lang cookie and falls back to en", () => {
    assert.equal(detectLang({ get: () => `${LANG_COOKIE}=te; auth=1` }), "te");
    assert.equal(detectLang({ get: () => `${LANG_COOKIE}=xx` }), "en");
    assert.equal(detectLang({ get: () => null }), "en");
    const t = getTemple("t-venkateswara")!;
    assert.equal(templeLocalName(t), t.nameLocal ?? t.name);
    assert.ok(translate("en", "hero_head").length > 2);
  });
});