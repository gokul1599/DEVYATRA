/**
 * DEVYATRA / TEMPLEORA — DATA PIPELINE: VALIDATION STAGE
 * 
 * Command: npm run data:validate
 * 
 * Enforces:
 * 1. Sovereign India Geographic Envelope: 6.0°N - 37.5°N, 68.0°E - 97.5°E
 * 2. Non-null coordinate plausibility (no 0,0 / NaN / inverted coords)
 * 3. Required string fields (name, slug, category, state, district)
 * 4. Canonical state membership against 36 official States & UTs
 * 5. Minimum source provenance verification
 */

import { discoverAllCandidates } from "./discover.js";
import { normalizeAllCandidates, CANONICAL_STATES_UTS } from "./normalize.js";
import { MASTER_CATEGORIES } from "../../src/lib/destinations/categories.js";
import type { PipelineCandidateRecord, ValidationResult } from "./types.js";

export const INDIA_BOUNDS = {
  MIN_LAT: 6.0,
  MAX_LAT: 37.5,
  MIN_LNG: 68.0,
  MAX_LNG: 97.5,
};

export function validateCandidate(c: PipelineCandidateRecord): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Mandatory Identity Checks
  if (!c.name || typeof c.name !== "string" || c.name.trim().length === 0) {
    errors.push("Missing or empty place name.");
  }
  if (!c.slug || typeof c.slug !== "string" || c.slug.trim().length === 0) {
    errors.push("Missing or empty slug.");
  }
  if (!c.category || !(c.category in MASTER_CATEGORIES)) {
    errors.push(`Invalid category '${c.category}'. Must be one of the 15 canonical categories.`);
  }

  // 2. Administrative Integrity
  if (!c.state || !(c.state in CANONICAL_STATES_UTS)) {
    errors.push(`Invalid state '${c.state}'. Must be one of the 36 sovereign States/UTs.`);
  }
  if (!c.district || typeof c.district !== "string" || c.district.trim().length === 0) {
    errors.push("Missing or empty district.");
  }

  // 3. Sovereign Geolocation Integrity (Strict Zero-Centroid / Zero-Null-Island)
  if (typeof c.latitude !== "number" || isNaN(c.latitude)) {
    errors.push("Latitude must be a valid number.");
  }
  if (typeof c.longitude !== "number" || isNaN(c.longitude)) {
    errors.push("Longitude must be a valid number.");
  }

  if (c.latitude === 0 && c.longitude === 0) {
    errors.push("Null Island coordinates (0.0, 0.0) detected. Strictly prohibited.");
  }

  // Swapped coordinate check (India lat is ~8-37, lng is ~68-98)
  if (c.latitude >= 68.0 && c.longitude <= 37.5) {
    errors.push(`Coordinates appear swapped: lat=${c.latitude}, lng=${c.longitude}.`);
  }

  if (
    c.latitude < INDIA_BOUNDS.MIN_LAT ||
    c.latitude > INDIA_BOUNDS.MAX_LAT ||
    c.longitude < INDIA_BOUNDS.MIN_LNG ||
    c.longitude > INDIA_BOUNDS.MAX_LNG
  ) {
    errors.push(
      `Coordinates [${c.latitude}, ${c.longitude}] fall outside sovereign Indian envelope (${INDIA_BOUNDS.MIN_LAT}°N–${INDIA_BOUNDS.MAX_LAT}°N, ${INDIA_BOUNDS.MIN_LNG}°E–${INDIA_BOUNDS.MAX_LNG}°E).`
    );
  }

  // 4. Source & Provenance
  if (!c.sources || c.sources.length === 0) {
    warnings.push("Candidate has zero explicit sources attached.");
  } else {
    for (const src of c.sources) {
      if (!src.publisher || !src.url) {
        warnings.push(`Source '${src.title}' missing publisher or URL.`);
      }
    }
  }

  // 5. Operating hours honesty check (no fake generic 9-5)
  if (c.timings && c.timings.includes("9:00 AM - 5:00 PM") && c.category === "NATURE") {
    warnings.push("Suspect synthetic timings '9:00 AM - 5:00 PM' on wild natural formation.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateAllCandidates(candidates: PipelineCandidateRecord[]): {
  valid: PipelineCandidateRecord[];
  rejected: Array<{ candidate: PipelineCandidateRecord; errors: string[] }>;
} {
  console.log(`==> [VALIDATE] Validating ${candidates.length} candidates...`);
  const valid: PipelineCandidateRecord[] = [];
  const rejected: Array<{ candidate: PipelineCandidateRecord; errors: string[] }> = [];

  for (const c of candidates) {
    const res = validateCandidate(c);
    if (res.valid) {
      valid.push({ ...c, pipelineStatus: "VALIDATED" });
    } else {
      rejected.push({
        candidate: { ...c, pipelineStatus: "REJECTED", rejectionReason: res.errors.join("; ") },
        errors: res.errors,
      });
    }
  }

  console.log(`==> [VALIDATE] Passed: ${valid.length} | Rejected: ${rejected.length}`);
  return { valid, rejected };
}

if (process.argv[1]?.includes("validate")) {
  const raw = discoverAllCandidates();
  const normalized = normalizeAllCandidates(raw);
  const result = validateAllCandidates(normalized);
  console.log(`[VALIDATE COMPLETE] Passed: ${result.valid.length}, Rejected: ${result.rejected.length}`);
  if (result.rejected.length > 0) {
    console.error("Rejections:", JSON.stringify(result.rejected, null, 2));
    process.exit(1);
  }
}
