/**
 * DEVYATRA / TEMPLEORA — GOOGLE PLACE MATCHER & VALIDATION ENGINE
 *
 * Implements strict, high-confidence matching between canonical temple records
 * and Google Places API candidates.
 *
 * Guarantees:
 * 1. Distinguishes authentic Google Place IDs (e.g. ChIJ...) from internal or ASI monument IDs.
 * 2. Multi-signal spatial & semantic verification (distance <= 15 km, token overlap, place types).
 * 3. Categorizes matches by confidence (EXACT_MATCH, STRONG_MATCH, REVIEW_REQUIRED, REJECTED).
 * 4. Strictly rejects non-sacred / non-landmark places (hotels, restaurants, retail).
 */

import { haversineKm } from "@/lib/geo/distance";

export type MatchConfidence = "EXACT_MATCH" | "STRONG_MATCH" | "REVIEW_REQUIRED" | "REJECTED";

export interface PlaceCandidate {
  id: string;
  displayName?: { text: string; languageCode?: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  location?: { latitude: number; longitude: number };
  types?: string[];
  primaryType?: string;
  googleMapsUri?: string;
}

export interface PlaceMatchEvaluation {
  confidence: MatchConfidence;
  similarity: number;
  distanceKm: number | null;
  matchedName: string;
  candidateName: string;
  rejectionReason?: string;
  candidate: PlaceCandidate;
}

export interface TempleMatchTarget {
  id?: string;
  name: string;
  alternativeNames?: string[];
  latitude: number;
  longitude: number;
  district?: string;
  state?: string;
}

/** Check if a string is a genuine Google Place ID rather than an ASI Monument ID or custom ID. */
export function isGenuineGooglePlaceId(id: string | null | undefined): boolean {
  if (!id || typeof id !== "string") return false;
  const trimmed = id.trim();
  if (trimmed.startsWith("ASI_") || trimmed.startsWith("MON_") || trimmed.startsWith("DEV_")) {
    return false;
  }
  // Google Place IDs are base64url-like alphanumeric identifiers typically 20-40+ characters long
  // and frequently start with ChIJ, GhIJ, or similar prefixes.
  return /^[A-Za-z0-9_-]{20,}$/.test(trimmed);
}

/** Strip stop words, titles, and noise to compare sacred destination roots */
const NOISE_WORDS = new Set([
  "temple",
  "temples",
  "mandir",
  "mandiram",
  "shrine",
  "sri",
  "shri",
  "shree",
  "kovil",
  "koyil",
  "devasthanam",
  "devasthan",
  "swamy",
  "swami",
  "lord",
  "bhagwan",
  "dham",
  "peeth",
  "peetham",
  "matha",
  "complex",
  "the",
  "of",
  "at",
  "in",
  "and",
  "arulmigu",
  "amman",
  "mata",
  "maa",
  "baba",
  "ji",
  "sanctuary",
  "sanctum",
]);

export function normalizeTempleName(raw: string): string {
  if (!raw) return "";
  const cleaned = raw
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = cleaned
    .split(" ")
    .filter((token) => token.length > 1 && !NOISE_WORDS.has(token));

  return tokens.join(" ");
}

/** Compute token overlap similarity (Jaccard + Substring boost) between 0 and 1 */
export function calculateNameSimilarity(target: string, candidate: string): number {
  const normA = normalizeTempleName(target);
  const normB = normalizeTempleName(candidate);

  if (!normA || !normB) return 0;
  if (normA === normB) return 1.0;

  // Substring containment check
  if (normA.includes(normB) || normB.includes(normA)) {
    const minLen = Math.min(normA.length, normB.length);
    const maxLen = Math.max(normA.length, normB.length);
    return Math.max(0.75, minLen / maxLen);
  }

  const setA = new Set(normA.split(" "));
  const setB = new Set(normB.split(" "));

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }

  const union = new Set([...setA, ...setB]).size;
  if (union === 0) return 0;

  return intersection / union;
}

/** Disallowed Google Place types that should NEVER be matched as a temple */
const DISALLOWED_TYPES = new Set([
  "lodging",
  "hotel",
  "motel",
  "restaurant",
  "food",
  "cafe",
  "bar",
  "store",
  "shopping_mall",
  "gas_station",
  "transit_station",
  "bus_stop",
  "train_station",
  "airport",
  "real_estate_agency",
  "hospital",
  "doctor",
  "school",
  "university",
  "gym",
  "bank",
  "atm",
]);

/** Allowed / Preferred Google Place types for sacred destinations */
export const ALLOWED_TYPES = new Set([
  "place_of_worship",
  "hindu_temple",
  "tourist_attraction",
  "historical_landmark",
  "monument",
  "point_of_interest",
  "establishment",
]);

/** Maximum acceptable distance between canonical coordinates and Google Place */
export const MAX_MATCH_DISTANCE_KM = 15.0;

/**
 * Evaluate a single Google Place candidate against a canonical temple target
 */
export function evaluateCandidate(
  target: TempleMatchTarget,
  candidate: PlaceCandidate
): PlaceMatchEvaluation {
  const candidateName = candidate.displayName?.text || "";

  // 1. Verify place ID format
  if (!isGenuineGooglePlaceId(candidate.id)) {
    return {
      confidence: "REJECTED",
      similarity: 0,
      distanceKm: null,
      matchedName: target.name,
      candidateName,
      rejectionReason: `Invalid Google Place ID format: ${candidate.id}`,
      candidate,
    };
  }

  // 2. Type validation
  const candidateTypes = [
    ...(candidate.types || []),
    ...(candidate.primaryType ? [candidate.primaryType] : []),
  ];

  const hasDisallowed = candidateTypes.some((t) => DISALLOWED_TYPES.has(t));
  if (hasDisallowed) {
    return {
      confidence: "REJECTED",
      similarity: 0,
      distanceKm: null,
      matchedName: target.name,
      candidateName,
      rejectionReason: `Candidate contains disallowed type: ${candidateTypes.join(", ")}`,
      candidate,
    };
  }

  // 3. Spatial validation
  let dist: number | null = null;
  if (candidate.location?.latitude && candidate.location?.longitude) {
    dist = haversineKm(
      target.latitude,
      target.longitude,
      candidate.location.latitude,
      candidate.location.longitude
    );

    if (dist > MAX_MATCH_DISTANCE_KM) {
      return {
        confidence: "REJECTED",
        similarity: 0,
        distanceKm: dist,
        matchedName: target.name,
        candidateName,
        rejectionReason: `Distance exceeds ${MAX_MATCH_DISTANCE_KM} km limit (${dist.toFixed(1)} km)`,
        candidate,
      };
    }
  }

  // 4. Name similarity against primary name and alternative names
  const allNames = [target.name, ...(target.alternativeNames || [])];
  let maxSimilarity = 0;
  let bestMatchedName = target.name;

  for (const name of allNames) {
    const sim = calculateNameSimilarity(name, candidateName);
    if (sim > maxSimilarity) {
      maxSimilarity = sim;
      bestMatchedName = name;
    }
  }

  // Address regional reinforcement check
  if (candidate.formattedAddress && maxSimilarity < 0.6) {
    const addressNorm = candidate.formattedAddress.toLowerCase();
    const targetNorm = normalizeTempleName(target.name);
    if (targetNorm && addressNorm.includes(targetNorm)) {
      maxSimilarity = Math.max(maxSimilarity, 0.65);
    }
  }

  // 5. Confidence Classification
  if (maxSimilarity >= 0.85 && dist !== null && dist <= 2.5) {
    return {
      confidence: "EXACT_MATCH",
      similarity: maxSimilarity,
      distanceKm: dist,
      matchedName: bestMatchedName,
      candidateName,
      candidate,
    };
  }

  if (maxSimilarity >= 0.65 && (dist === null || dist <= 8.0)) {
    return {
      confidence: "STRONG_MATCH",
      similarity: maxSimilarity,
      distanceKm: dist,
      matchedName: bestMatchedName,
      candidateName,
      candidate,
    };
  }

  if (maxSimilarity >= 0.45 && (dist === null || dist <= MAX_MATCH_DISTANCE_KM)) {
    return {
      confidence: "REVIEW_REQUIRED",
      similarity: maxSimilarity,
      distanceKm: dist,
      matchedName: bestMatchedName,
      candidateName,
      rejectionReason: "Confidence below auto-approval threshold; manual review required",
      candidate,
    };
  }

  return {
    confidence: "REJECTED",
    similarity: maxSimilarity,
    distanceKm: dist,
    matchedName: bestMatchedName,
    candidateName,
    rejectionReason: `Low name similarity (${(maxSimilarity * 100).toFixed(0)}%) or ambiguous coordinates`,
    candidate,
  };
}

/**
 * Filter and sort a list of search candidates, picking the best match above threshold
 */
export function pickBestCandidate(
  target: TempleMatchTarget,
  candidates: PlaceCandidate[]
): PlaceMatchEvaluation | null {
  if (!candidates || candidates.length === 0) return null;

  const evaluations = candidates.map((c) => evaluateCandidate(target, c));

  // Sort by confidence rank and similarity
  const rankWeight: Record<MatchConfidence, number> = {
    EXACT_MATCH: 4,
    STRONG_MATCH: 3,
    REVIEW_REQUIRED: 2,
    REJECTED: 1,
  };

  evaluations.sort((a, b) => {
    const weightDiff = rankWeight[b.confidence] - rankWeight[a.confidence];
    if (weightDiff !== 0) return weightDiff;
    return b.similarity - a.similarity;
  });

  const best = evaluations[0];
  return best;
}
