import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  CANONICAL_BENCHMARK_SPECS,
  haversineDistanceKm,
  ReconciliationResult
} from "../scripts/pipeline/build_canonical_temple_index";
import { ALL_INDIA_DESTINATIONS } from "../src/lib/destinations/all-india-data";

describe("Famous Temples National Audit — Canonical Ground Truth & Disambiguation", () => {
  const reconPath = "docs/FAMOUS_TEMPLES_RECONCILIATION.json";

  test("reconciliation report exists and contains 143 verified benchmark shrines", () => {
    assert.ok(existsSync(reconPath), "Reconciliation report must exist at docs/FAMOUS_TEMPLES_RECONCILIATION.json");
    const data: ReconciliationResult[] = JSON.parse(readFileSync(reconPath, "utf-8"));
    assert.strictEqual(data.length, 143, "Must evaluate exactly 143 national benchmark shrines");

    const verifiedCount = data.filter(r => r.status === "PRESENT_VERIFIED").length;
    assert.strictEqual(verifiedCount, 143, "All 143 shrines must be PRESENT_VERIFIED");

    const missingCount = data.filter(r => r.status === "MISSING").length;
    assert.strictEqual(missingCount, 0, "No benchmark shrine can be marked MISSING");
  });

  test("resolves known historical false positive failure cases to their TRUE canonical identity", () => {
    const data: ReconciliationResult[] = JSON.parse(readFileSync(reconPath, "utf-8"));

    const findResult = (benchmarkName: string) => {
      const match = data.find(r => r.benchmarkName.toLowerCase() === benchmarkName.toLowerCase());
      assert.ok(match, `Benchmark "${benchmarkName}" must be present in reconciliation report`);
      return match;
    };

    // 1. Tirumala Venkateswara (NOT Varaha Swami, NOT Bedi Anjaneya)
    const tirumala = findResult("Tirumala Venkateswara");
    assert.ok(tirumala.canonicalName?.toLowerCase().includes("venkateswara"), "Must match Venkateswara Swamy");
    assert.ok(!tirumala.canonicalName?.toLowerCase().includes("varaha"), "Must NOT match Varaha Swami");
    assert.strictEqual(tirumala.expectedState, "Andhra Pradesh");
    assert.ok((tirumala.distanceKm || 0) < 1.0, "Must be physically centered on Tirumala sanctum");

    // 2. Srisailam Mallikarjuna (NOT Araku Mallikarjuna)
    const srisailam = findResult("Srisailam Mallikarjuna");
    assert.ok(srisailam.canonicalName?.toLowerCase().includes("mallikarjuna"), "Must match Mallikarjuna");
    assert.strictEqual(srisailam.matchedDistrict, "Nandyal", "Must be in Nandyal District, not Visakhapatnam/Araku");
    assert.ok((srisailam.distanceKm || 0) < 1.0, "Must be physically centered on Srisailam sanctum");

    // 3. Kashi Vishwanath (NOT Maa Annapurna, NOT Kaal Bhairav)
    const vishwanath = findResult("Kashi Vishwanath");
    assert.ok(vishwanath.canonicalName?.toLowerCase().includes("vishwanath"), "Must match Vishwanath");
    assert.ok(!vishwanath.canonicalName?.toLowerCase().includes("annapurna"), "Must NOT match Annapurna");
    assert.ok((vishwanath.distanceKm || 0) < 1.0, "Must be physically centered on Kashi Vishwanath sanctum");

    // 4. Mahakaleshwar (NOT Maa Harsiddhi)
    const ujjain = findResult("Mahakaleshwar");
    assert.ok(ujjain.canonicalName?.toLowerCase().includes("mahakaleshwar"), "Must match Mahakaleshwar");
    assert.ok(!ujjain.canonicalName?.toLowerCase().includes("harsiddhi"), "Must NOT match Harsiddhi");
    assert.ok((ujjain.distanceKm || 0) < 1.0, "Must be physically centered on Mahakaleshwar sanctum");

    // 5. Konark Sun Temple (NOT Deo Sun Temple in Bihar)
    const konark = findResult("Konark");
    assert.ok(konark.canonicalName?.toLowerCase().includes("konark"), "Must match Konark Sun Temple");
    assert.strictEqual(konark.expectedState, "Odisha", "Konark must be in Odisha, not Bihar");
    assert.ok(!konark.canonicalName?.toLowerCase().includes("deo"), "Must NOT match Deo Sun Temple");
    assert.ok((konark.distanceKm || 0) < 1.0, "Must be physically centered on Konark sanctum");

    // 6. Lingaraj Bhubaneswar (NOT Mukteshwar Temple)
    const lingaraj = findResult("Lingaraj");
    assert.ok(lingaraj.canonicalName?.toLowerCase().includes("lingaraj"), "Must match Lingaraj Temple");
    assert.ok(!lingaraj.canonicalName?.toLowerCase().includes("mukteshwar"), "Must NOT match Mukteshwar Temple");
    assert.ok((lingaraj.distanceKm || 0) < 1.0, "Must be physically centered on Lingaraj sanctum");

    // 7. Kamakshi Amman Kanchipuram (NOT Ekambareswarar)
    const kamakshi = findResult("Kamakshi");
    assert.ok(kamakshi.canonicalName?.toLowerCase().includes("kamakshi"), "Must match Kamakshi Amman");
    assert.ok(!kamakshi.canonicalName?.toLowerCase().includes("ekambareswarar"), "Must NOT match Ekambareswarar");
    assert.ok((kamakshi.distanceKm || 0) < 1.0, "Must be physically centered on Kamakshi Amman sanctum");

    // 8. Varadaraja Perumal Kanchipuram (NOT Ekambareswarar)
    const varadaraja = findResult("Varadaraja Perumal");
    assert.ok(varadaraja.canonicalName?.toLowerCase().includes("varadaraja"), "Must match Varadaraja Perumal");
    assert.ok(!varadaraja.canonicalName?.toLowerCase().includes("ekambareswarar"), "Must NOT match Ekambareswarar");
    assert.ok((varadaraja.distanceKm || 0) < 1.0, "Must be physically centered on Varadaraja sanctum");

    // 9. Padmanabhaswamy (NOT Attukal Bhagavathy)
    const padmanabhaswamy = findResult("Padmanabhaswamy");
    assert.ok(padmanabhaswamy.canonicalName?.toLowerCase().includes("padmanabhaswamy"), "Must match Padmanabhaswamy");
    assert.ok(!padmanabhaswamy.canonicalName?.toLowerCase().includes("attukal"), "Must NOT match Attukal Bhagavathy");
    assert.ok((padmanabhaswamy.distanceKm || 0) < 1.0, "Must be physically centered on Padmanabhaswamy sanctum");

    // 10. Dakshineswar Kali (NOT Thillai Kali)
    const dakshineswar = findResult("Dakshineswar");
    assert.ok(dakshineswar.canonicalName?.toLowerCase().includes("dakshineswar"), "Must match Dakshineswar Kali");
    assert.strictEqual(dakshineswar.expectedState, "West Bengal");
    assert.ok(!dakshineswar.canonicalName?.toLowerCase().includes("thillai"), "Must NOT match Thillai Kali");
    assert.ok((dakshineswar.distanceKm || 0) < 1.0, "Must be physically centered on Dakshineswar sanctum");

    // 11. Tarakeswar (NOT Hangseshwari)
    const tarakeswar = findResult("Tarakeswar");
    assert.ok(
      tarakeswar.canonicalName?.toLowerCase().includes("taraknath") ||
      tarakeswar.canonicalName?.toLowerCase().includes("tarakeswar"),
      "Must match Taraknath / Tarakeswar"
    );
    assert.ok(!tarakeswar.canonicalName?.toLowerCase().includes("hangseshwari"), "Must NOT match Hangseshwari");
    assert.ok((tarakeswar.distanceKm || 0) < 2.0, "Must be physically centered on Tarakeswar sanctum");

    // 12. Sri Kalahasteeswara strictly in Andhra Pradesh (Tirupati district), NOT Tamil Nadu
    const kalahasti = findResult("Srikalahasteeswara");
    assert.strictEqual(kalahasti.expectedState, "Andhra Pradesh", "Kalahasti must be in Andhra Pradesh");
    assert.strictEqual(kalahasti.matchedState, "Andhra Pradesh", "Matched state must be Andhra Pradesh");
    assert.ok(!kalahasti.canonicalName?.toLowerCase().includes("madurai"), "Must NOT match Madurai temple");
  });

  test("all 143 benchmark specifications define valid geodetics and official provenance", () => {
    assert.strictEqual(CANONICAL_BENCHMARK_SPECS.length, 143, "Spec catalog must contain exactly 143 benchmark specs");

    for (const spec of CANONICAL_BENCHMARK_SPECS) {
      assert.ok(spec.latitude >= 6.0 && spec.latitude <= 38.0, `Latitude for ${spec.benchmarkName} must be within India bounds`);
      assert.ok(spec.longitude >= 68.0 && spec.longitude <= 98.0, `Longitude for ${spec.benchmarkName} must be within India bounds`);
      assert.ok(spec.officialSourceUrl.startsWith("http"), `Official source URL for ${spec.benchmarkName} must be valid HTTP/HTTPS link`);
      assert.ok(spec.primaryKeywords.length > 0, `Benchmark ${spec.benchmarkName} must define primary keywords`);
      assert.ok(spec.expectedState.length > 0, `Benchmark ${spec.benchmarkName} must specify expected state`);
      assert.ok(spec.expectedDistrict.length > 0, `Benchmark ${spec.benchmarkName} must specify expected district`);
    }
  });

  test("verifies that all 7 expanded canonical shrines exist in ALL_INDIA_DESTINATIONS", () => {
    const expectedIds = [
      "dest-res-arulmigu-varadaraja-perumal-temple-kanchipuram-tamil-nadu",
      "dest-res-arulmigu-kamakshi-amman-temple-kanchipuram-tamil-nadu",
      "dest-res-swayambhu-ganpati-temple-ganpatipule-ratnagiri-maharashtra",
      "dest-res-bhadrakali-temple-warangal-hanamkonda-telangana",
      "dest-res-prem-mandir-vrindavan-mathura-uttar-pradesh",
      "dest-res-kaal-bhairav-temple-kotwal-of-varanasi-uttar-pradesh",
      "dest-res-shri-shantadurga-temple-kavlem-ponda-south-goa"
    ];

    const destIds = new Set(ALL_INDIA_DESTINATIONS.map(d => d.id));

    for (const id of expectedIds) {
      assert.ok(destIds.has(id), `Expanded canonical destination "${id}" must exist in ALL_INDIA_DESTINATIONS`);
    }
  });
});
