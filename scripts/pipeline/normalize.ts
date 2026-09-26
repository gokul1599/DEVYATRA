/**
 * DEVYATRA / TEMPLEORA — DATA PIPELINE: NORMALIZATION STAGE
 * 
 * Command: npm run data:normalize
 * 
 * Normalizes names, administrative hierarchy (States, UTs, Districts),
 * categories, slugs, and language transliterations.
 */

import { discoverAllCandidates } from "./discover.js";
import { normalizeCategory } from "../../src/lib/destinations/categories.js";
import type { PipelineCandidateRecord } from "./types.js";

export const CANONICAL_STATES_UTS: Record<string, { code: string; type: "STATE" | "UT" }> = {
  // 28 States
  "Andhra Pradesh": { code: "AP", type: "STATE" },
  "Arunachal Pradesh": { code: "AR", type: "STATE" },
  "Assam": { code: "AS", type: "STATE" },
  "Bihar": { code: "BR", type: "STATE" },
  "Chhattisgarh": { code: "CG", type: "STATE" },
  "Goa": { code: "GA", type: "STATE" },
  "Gujarat": { code: "GJ", type: "STATE" },
  "Haryana": { code: "HR", type: "STATE" },
  "Himachal Pradesh": { code: "HP", type: "STATE" },
  "Jharkhand": { code: "JH", type: "STATE" },
  "Karnataka": { code: "KA", type: "STATE" },
  "Kerala": { code: "KL", type: "STATE" },
  "Madhya Pradesh": { code: "MP", type: "STATE" },
  "Maharashtra": { code: "MH", type: "STATE" },
  "Manipur": { code: "MN", type: "STATE" },
  "Meghalaya": { code: "ML", type: "STATE" },
  "Mizoram": { code: "MZ", type: "STATE" },
  "Nagaland": { code: "NL", type: "STATE" },
  "Odisha": { code: "OD", type: "STATE" },
  "Punjab": { code: "PB", type: "STATE" },
  "Rajasthan": { code: "RJ", type: "STATE" },
  "Sikkim": { code: "SK", type: "STATE" },
  "Tamil Nadu": { code: "TN", type: "STATE" },
  "Telangana": { code: "TG", type: "STATE" },
  "Tripura": { code: "TR", type: "STATE" },
  "Uttar Pradesh": { code: "UP", type: "STATE" },
  "Uttarakhand": { code: "UK", type: "STATE" },
  "West Bengal": { code: "WB", type: "STATE" },

  // 8 Union Territories
  "Andaman and Nicobar Islands": { code: "AN", type: "UT" },
  "Chandigarh": { code: "CH", type: "UT" },
  "Dadra and Nagar Haveli and Daman and Diu": { code: "DN", type: "UT" },
  "Delhi": { code: "DL", type: "UT" },
  "Jammu and Kashmir": { code: "JK", type: "UT" },
  "Ladakh": { code: "LA", type: "UT" },
  "Lakshadweep": { code: "LD", type: "UT" },
  "Puducherry": { code: "PY", type: "UT" },
};

export function normalizeCandidate(c: PipelineCandidateRecord): PipelineCandidateRecord {
  // Normalize State
  let state = c.state.trim();
  if (state === "Daman and Diu" || state === "Dadra and Nagar Haveli") {
    state = "Dadra and Nagar Haveli and Daman and Diu";
  } else if (state === "Orissa") {
    state = "Odisha";
  } else if (state === "Uttaranchal") {
    state = "Uttarakhand";
  } else if (state === "Pondicherry") {
    state = "Puducherry";
  }

  const stateInfo = CANONICAL_STATES_UTS[state];
  const stateCode = stateInfo?.code;

  // Normalize Category
  const category = normalizeCategory(c.category);

  // Normalize Name
  const cleanName = c.name.trim().replace(/\s+/g, " ");

  // Normalize Slug
  const cleanSlug = c.slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Normalize District
  const cleanDistrict = c.district.trim().replace(/\s+/g, " ");

  return {
    ...c,
    name: cleanName,
    slug: cleanSlug,
    state,
    stateCode,
    district: cleanDistrict,
    category,
    country: "India",
  };
}

export function normalizeAllCandidates(candidates: PipelineCandidateRecord[]): PipelineCandidateRecord[] {
  console.log(`==> [NORMALIZE] Normalizing ${candidates.length} candidates...`);
  const normalized = candidates.map(normalizeCandidate);
  console.log(`==> [NORMALIZE] Completed normalization.`);
  return normalized;
}

if (process.argv[1]?.includes("normalize")) {
  const candidates = discoverAllCandidates();
  const normalized = normalizeAllCandidates(candidates);
  console.log(`[NORMALIZE COMPLETE] Normalized ${normalized.length} records.`);
}
