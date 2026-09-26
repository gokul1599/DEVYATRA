/**
 * DEVYATRA / TEMPLEORA — DATA PIPELINE: AUDIT & QA STAGE
 * 
 * Command: npm run data:audit
 * 
 * Runs strict automated QA checks as specified in Section 60:
 * 1. Missing names check
 * 2. Missing categories check
 * 3. Invalid or Null Island coordinates (lat != 0, lon != 0)
 * 4. Duplicate IDs and Slugs
 * 5. Missing source provenance
 * 6. Administrative consistency (State in canonical 36 States/UTs)
 * 7. Coordinate clustering anomalies (suspicious identical coordinates)
 * 8. Zero synthetic operating hours on wild natural formations
 */

import { discoverAllCandidates } from "./discover.js";
import { normalizeAllCandidates, CANONICAL_STATES_UTS } from "./normalize.js";
import { validateAllCandidates, INDIA_BOUNDS } from "./validate.js";
import { deduplicateCandidates } from "./dedupe.js";

export function runDataAudit(): boolean {
  console.log("==> [AUDIT] Running National Data QA Suite...");

  const raw = discoverAllCandidates();
  const normalized = normalizeAllCandidates(raw);
  const { valid, rejected } = validateAllCandidates(normalized);
  const { unique, duplicates } = deduplicateCandidates(valid);

  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Missing names
  const missingNames = unique.filter(p => !p.name || p.name.trim().length === 0);
  if (missingNames.length > 0) errors.push(`QA FAIL: ${missingNames.length} places have missing names.`);

  // 2. Missing category
  const missingCat = unique.filter(p => !p.category);
  if (missingCat.length > 0) errors.push(`QA FAIL: ${missingCat.length} places have missing category.`);

  // 3. Invalid coordinates & bounds
  const invalidCoords = unique.filter(
    p =>
      p.latitude === 0 ||
      p.longitude === 0 ||
      p.latitude < INDIA_BOUNDS.MIN_LAT ||
      p.latitude > INDIA_BOUNDS.MAX_LAT ||
      p.longitude < INDIA_BOUNDS.MIN_LNG ||
      p.longitude > INDIA_BOUNDS.MAX_LNG
  );
  if (invalidCoords.length > 0) errors.push(`QA FAIL: ${invalidCoords.length} places have invalid or out-of-bounds coordinates.`);

  // 4. Duplicate IDs
  const idSet = new Set<string>();
  const dupIds: string[] = [];
  for (const p of unique) {
    if (idSet.has(p.id)) dupIds.push(p.id);
    idSet.add(p.id);
  }
  if (dupIds.length > 0) errors.push(`QA FAIL: Found duplicate IDs: ${dupIds.join(", ")}`);

  // 5. Duplicate Slugs
  const slugSet = new Set<string>();
  const dupSlugs: string[] = [];
  for (const p of unique) {
    if (slugSet.has(p.slug)) dupSlugs.push(p.slug);
    slugSet.add(p.slug);
  }
  if (dupSlugs.length > 0) errors.push(`QA FAIL: Found duplicate slugs: ${dupSlugs.join(", ")}`);

  // 6. Missing sources
  const missingSources = unique.filter(p => !p.sources || p.sources.length === 0 || !p.sources[0].url);
  if (missingSources.length > 0) errors.push(`QA FAIL: ${missingSources.length} places missing source citations.`);

  // 7. Administrative consistency
  const invalidStates = unique.filter(p => !(p.state in CANONICAL_STATES_UTS));
  if (invalidStates.length > 0) errors.push(`QA FAIL: ${invalidStates.length} places have non-canonical state names.`);

  // 8. Coordinate clustering anomalies: check if unrelated places share exact coordinates
  const coordMap: Record<string, string[]> = {};
  for (const p of unique) {
    const key = `${p.latitude.toFixed(4)},${p.longitude.toFixed(4)}`;
    if (!coordMap[key]) coordMap[key] = [];
    coordMap[key].push(p.name);
  }
  for (const [coord, names] of Object.entries(coordMap)) {
    if (names.length > 1) {
      warnings.push(`QA WARNING: Exact coordinate collision at [${coord}]: ${names.join(" AND ")}`);
    }
  }

  // 9. Operational hours honesty check
  const fakeHours = unique.filter(
    p => p.category === "NATURE" && p.timings && p.timings.includes("9:00 AM - 5:00 PM")
  );
  if (fakeHours.length > 0) {
    warnings.push(`QA WARNING: ${fakeHours.length} nature sites have suspect synthetic 9-5 hours.`);
  }

  console.log("\n=======================================================");
  console.log("✔ DATA QA AUDIT RESULTS");
  console.log("=======================================================");
  console.log(`Total Records Audited:      ${unique.length}`);
  console.log(`Critical Errors:            ${errors.length}`);
  console.log(`Warnings / Advisories:      ${warnings.length}`);
  console.log("=======================================================\n");

  if (warnings.length > 0) {
    console.log("Advisories:");
    warnings.forEach(w => console.log(" -", w));
  }

  if (errors.length > 0) {
    console.error("Critical Errors:");
    errors.forEach(e => console.error(" ✖", e));
    return false;
  }

  console.log("✔ ALL DATA QA CHECKS PASSED WITH ZERO ERRORS.\n");
  return true;
}

if (process.argv[1]?.includes("audit")) {
  const passed = runDataAudit();
  process.exit(passed ? 0 : 1);
}
