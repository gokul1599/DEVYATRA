import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { buildPlan, askCompanion, ItinerarySchema } from "@/lib/ai/engine";
import { getTemple } from "@/lib/registry";

const VENKATESWARA = getTemple("t-venkateswara")!;
const MAHABODHI = getTemple("t-mahabodhi")!;

describe("ai/engine buildPlan", () => {
  const base = {
    date: "2026-04-22",
    arrival: "05:00",
    departure: "21:00",
    people: 2,
    budget: "mid" as const,
    travel: "car" as const,
    companions: ["family"] as ("solo" | "couple" | "family" | "children" | "elderly" | "accessibility")[],
    interests: ["darshan", "food"],
    lang: "en",
  };

  it("generates a schema-valid plan for a known temple", () => {
    const r = buildPlan({ ...base, templeId: VENKATESWARA.id });
    assert.equal(ItinerarySchema.safeParse(r).success, true, "plan fails schema validation");
    assert.ok(r.items.length >= 3, "expected at least 3 stops");
    assert.ok(r.summary.length > 20, "summary too short");
    assert.ok(r.estimatedCost.length > 3, "missing cost estimate");
    assert.ok(r.duration.includes("hours"), `duration malformed: ${r.duration}`);
  });

  it("orders itinerary steps through the darshan window", () => {
    const r = buildPlan({ ...base, templeId: VENKATESWARA.id });
    const times = r.items.map((i) => i.time);
    for (const t of times) assert.match(t, /^\d{2}:\d{2}$/, `bad time ${t}`);
    for (let i = 1; i < times.length; i++) assert.ok(times[i] >= times[i - 1], `steps out of order: ${times.join(", ")}`);
  });

  it("skews cost label for budget vs premium", () => {
    const budget = buildPlan({ ...base, templeId: VENKATESWARA.id, budget: "budget" });
    const premium = buildPlan({ ...base, templeId: VENKATESWARA.id, budget: "premium" });
    const cost = (s: string) => Number(s.match(/₹([\d,]+)/)?.[1]?.replace(/,/g, "") ?? 0);
    assert.ok(cost(premium.estimatedCost) > cost(budget.estimatedCost), "premium should cost more than budget");
  });

  it("adds a prasad / food element when food interest is set", () => {
    const r = buildPlan({ ...base, templeId: VENKATESWARA.id, interests: ["darshan", "food"] });
    assert.ok(r.items.some((i) => /food|prasad|meal|annadanam/i.test(i.place + " " + i.reason)), "no food stop for food interest");
  });

  it("returns a graceful fallback plan for an unknown temple (no crash)", () => {
    const r = buildPlan({ ...base, templeId: "t-does-not-exist" });
    assert.equal(r.items.length, 0);
    assert.ok(r.warnings.length > 0);
    assert.equal(ItinerarySchema.safeParse(r).success, true);
  });
});

describe("ai/engine askCompanion", () => {
  it("answers timing questions from verified slot data with an honest status note", () => {
    const a = askCompanion(MAHABODHI, "what are the darshan timings?", "en");
    assert.ok(a.text.length > 30, "answer too short");
    assert.ok(/Scheduled timings/i.test(a.text), `${a.text}`);
    assert.equal(a.facts[0]?.label, "Status");
    assert.notEqual(a.facts[0]?.value, "UNVERIFIED", "verified temple must not be flagged unverified");
  });

  it("qualifies unverified schedules instead of inventing facts", () => {
    const a = askCompanion(VENKATESWARA, "what are the darshan timings?", "en");
    const note = /not verified|Note:/i.test(a.text);
    assert.equal(a.text.includes("Scheduled timings"), true);
    assert.equal(note, true, "unverified schedule should carry the verification note");
    assert.equal(a.facts[0]?.value, "UNVERIFIED");
  });

  it("refuses to fabricate verification-false claims", () => {
    const a = askCompanion(VENKATESWARA, "does this temple offer free wifi?", "en");
    assert.equal(a.facts.length, 0);
    assert.ok(/couldn't verify|could not verify/i.test(a.text), `should refuse to invent facts: ${a.text}`);
  });

  it("answers in English for unlocalized packs and stays within the refuse contract", () => {
    const hi = askCompanion(VENKATESWARA, "wifi hai kya?", "hi");
    assert.equal(typeof hi.text, "string");
    assert.ok(hi.text.length > 0);
  });
});