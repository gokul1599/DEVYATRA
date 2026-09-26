/**
 * DEVYATRA / TEMPLEORA — DATA PIPELINE: DEDUPLICATION STAGE
 * 
 * Command: npm run data:dedupe
 * 
 * Implements deterministic + spatial deduplication:
 * 1. Exact ID & Slug uniqueness
 * 2. Spatial proximity collision detection (Haversine <= 500m)
 * 3. Token-based normalized name similarity
 */

import { discoverAllCandidates } from "./discover.js";
import { normalizeAllCandidates } from "./normalize.js";
import { validateAllCandidates } from "./validate.js";
import { calculateHaversineDistanceKm } from "../../src/lib/nearby/engine.js";
import type { PipelineCandidateRecord, DeduplicationResult } from "./types.js";

function normalizeForComparison(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\b(shri|sri|lord|temple|monument|fort|caves|lake|falls|beach|sanctuary|reserve|park|national)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateTokenSimilarity(a: string, b: string): number {
  const tokensA = new Set(normalizeForComparison(a).split(" ").filter(t => t.length > 2));
  const tokensB = new Set(normalizeForComparison(b).split(" ").filter(t => t.length > 2));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  
  let matches = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) matches++;
  }
  return (2 * matches) / (tokensA.size + tokensB.size);
}

export function deduplicateCandidates(candidates: PipelineCandidateRecord[]): DeduplicationResult {
  console.log(`==> [DEDUPE] Analyzing ${candidates.length} candidates for duplicates...`);
  const unique: PipelineCandidateRecord[] = [];
  const duplicates: DeduplicationResult["duplicates"] = [];

  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  for (const c of candidates) {
    // 1. Exact ID check
    if (seenIds.has(c.id)) {
      const match = unique.find(u => u.id === c.id)!;
      duplicates.push({
        candidate: c,
        matchedWith: match,
        reason: `Exact ID collision: '${c.id}'`,
      });
      continue;
    }

    // 2. Exact Slug check
    if (seenSlugs.has(c.slug)) {
      const match = unique.find(u => u.slug === c.slug)!;
      duplicates.push({
        candidate: c,
        matchedWith: match,
        reason: `Exact Slug collision: '${c.slug}'`,
      });
      continue;
    }

    // 3. Spatial & Semantic Proximity Check (Threshold: 500 meters)
    let spatialDuplicateMatch: PipelineCandidateRecord | null = null;
    let distMeters = 0;

    for (const u of unique) {
      if (u.state === c.state) {
        const distKm = calculateHaversineDistanceKm(u.latitude, u.longitude, c.latitude, c.longitude);
        const distM = distKm * 1000;

        if (distM <= 500) {
          const sim = calculateTokenSimilarity(u.name, c.name);
          if (sim >= 0.5) {
            spatialDuplicateMatch = u;
            distMeters = Math.round(distM);
            break;
          }
        }
      }
    }

    const mergeIntoPrimary = (primary: PipelineCandidateRecord, dup: PipelineCandidateRecord) => {
      // Merge sources
      if (dup.sources && dup.sources.length > 0) {
        for (const s of dup.sources) {
          if (!primary.sources.some(ps => ps.url === s.url)) {
            primary.sources.push(s);
          }
        }
      }
      // Merge alternate names
      if (dup.alternateNames && dup.alternateNames.length > 0) {
        const altSet = new Set([...(primary.alternateNames || []), ...dup.alternateNames]);
        primary.alternateNames = Array.from(altSet);
      }
      // Merge highlights
      if (dup.highlights && dup.highlights.length > 0) {
        const hlSet = new Set([...(primary.highlights || []), ...dup.highlights]);
        primary.highlights = Array.from(hlSet);
      }
      // Merge tags
      if (dup.tags && dup.tags.length > 0) {
        const tagSet = new Set([...(primary.tags || []), ...dup.tags]);
        primary.tags = Array.from(tagSet);
      }
    };

    if (spatialDuplicateMatch) {
      mergeIntoPrimary(spatialDuplicateMatch, c);
      duplicates.push({
        candidate: { ...c, pipelineStatus: "DUPLICATE", duplicateOfId: spatialDuplicateMatch.id },
        matchedWith: spatialDuplicateMatch,
        reason: `Spatial collision within ${distMeters}m with token similarity`,
        distanceMeters: distMeters,
      });
      continue;
    }

    // Passed deduplication
    seenIds.add(c.id);
    seenSlugs.add(c.slug);
    unique.push(c);
  }

  console.log(`==> [DEDUPE] Unique: ${unique.length} | Duplicates: ${duplicates.length}`);
  return { unique, duplicates };
}

if (process.argv[1]?.includes("dedupe")) {
  const raw = discoverAllCandidates();
  const normalized = normalizeAllCandidates(raw);
  const validated = validateAllCandidates(normalized);
  const result = deduplicateCandidates(validated.valid);
  console.log(`[DEDUPE COMPLETE] Unique: ${result.unique.length}, Duplicates: ${result.duplicates.length}`);
}
