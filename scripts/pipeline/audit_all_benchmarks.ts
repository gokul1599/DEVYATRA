import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("docs/FAMOUS_TEMPLES_RECONCILIATION.json", "utf8"));

console.log("=== COMPREHENSIVE BENCHMARK INTEGRITY AUDIT ===");
const corruptedList: any[] = [];
const correctList: any[] = [];

for (const item of data) {
  const expDist = (item.expectedDistrict || "").toLowerCase().trim();
  const matDist = (item.matchedDistrict || "").toLowerCase().trim();
  const expState = (item.expectedState || "").toLowerCase().trim();
  const matState = (item.matchedState || "").toLowerCase().trim();

  // Statutory synonyms / renames
  const districtSynonyms: Record<string, string[]> = {
    "devbhumi dwarka": ["devbhoomi dwarka"],
    "devbhoomi dwarka": ["devbhumi dwarka"],
    "dharashiv": ["osmanabad"],
    "osmanabad": ["dharashiv"],
    "hanamkonda": ["hanumakonda"],
    "hanumakonda": ["hanamkonda"],
    "jogulamba gadwal": ["gadwal jogulamba"],
    "gadwal jogulamba": ["jogulamba gadwal"],
    "maihar": ["satna"],
    "satna": ["maihar"]
  };

  const isDistSynonym = (districtSynonyms[expDist] || []).includes(matDist);
  const distMatch = !matDist || expDist === matDist || expDist.includes(matDist) || matDist.includes(expDist) || isDistSynonym;
  const stateMatch = !matState || expState === matState || expState.includes(matState) || matState.includes(expState);

  const slugHasCorruptedDist =
    item.slug?.includes("tinsukia") && item.benchmarkName.includes("Kamakhya") ||
    item.slug?.includes("mumbai-suburban") && item.benchmarkName.includes("Kolhapur") ||
    item.slug?.includes("ganganagar") && item.benchmarkName.includes("Pushkar") ||
    item.slug?.includes("tehri-garhwal") && item.benchmarkName.includes("Kedarnath") ||
    item.slug?.includes("bargarh") && item.benchmarkName.includes("Rajarani");

  const isCorrupted = !distMatch || !stateMatch || slugHasCorruptedDist;

  if (isCorrupted) {
    corruptedList.push({
      benchmarkName: item.benchmarkName,
      canonicalId: item.canonicalId,
      canonicalName: item.canonicalName,
      expectedState: item.expectedState,
      matchedState: item.matchedState,
      expectedDistrict: item.expectedDistrict,
      matchedDistrict: item.matchedDistrict,
      slug: item.slug,
      reason: !stateMatch ? "STATE_MISMATCH" : !distMatch ? "DISTRICT_MISMATCH" : "CORRUPTED_SLUG",
    });
  } else {
    correctList.push(item);
  }
}

console.log(`Total Benchmarks: ${data.length}`);
console.log(`Correct & Consistent: ${correctList.length}`);
console.log(`Corrupted / Inconsistent Records: ${corruptedList.length}`);

console.log("\n--- CORRUPTED RECORDS BREAKDOWN ---");
for (const c of corruptedList) {
  console.log(`- [${c.reason}] ${c.benchmarkName} (${c.canonicalId})`);
  console.log(`    Expected: ${c.expectedDistrict}, ${c.expectedState}`);
  console.log(`    Actual in DB: ${c.matchedDistrict}, ${c.matchedState}`);
  console.log(`    Slug: ${c.slug}\n`);
}
