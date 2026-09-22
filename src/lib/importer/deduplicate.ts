/**
 * Probabilistic Temple Duplicate Detection Engine
 * Implements Jaro-Winkler string similarity, token intersection, Haversine geospatial proximity,
 * deity alignment, and administrative parent matching.
 */

export type DuplicateClassification =
  | "EXACT_DUPLICATE"
  | "PROBABLE_DUPLICATE"
  | "POSSIBLE_DUPLICATE"
  | "UNIQUE";

export interface TempleComparisonCandidate {
  id?: string;
  name: string;
  alternativeNames?: string[];
  mainDeity?: string | null;
  stateCode?: string | null;
  districtName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface DuplicateMatchResult {
  classification: DuplicateClassification;
  confidenceScore: number; // 0.0 to 1.0
  nameSimilarity: number;  // 0.0 to 1.0
  distanceMeters: number | null;
  deityMatch: boolean;
  stateMatch: boolean;
  districtMatch: boolean;
  notes: string[];
}

/**
 * Calculate Haversine distance in meters between two lat/long points.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Standard Jaro distance calculation between two strings.
 */
export function jaroDistance(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (!s1.length || !s2.length) return 0.0;

  const matchDistance = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);

  let matches = 0;
  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, s2.length);

    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const m = matches;
  return (m / s1.length + m / s2.length + (m - transpositions / 2) / m) / 3.0;
}

/**
 * Jaro-Winkler distance with common prefix bonus.
 */
export function jaroWinkler(s1: string, s2: string, p = 0.1, maxPrefix = 4): number {
  const jaro = jaroDistance(s1, s2);
  let prefix = 0;
  const limit = Math.min(s1.length, s2.length, maxPrefix);

  for (let i = 0; i < limit; i++) {
    if (s1[i] === s2[i]) {
      prefix++;
    } else {
      break;
    }
  }

  return jaro + prefix * p * (1 - jaro);
}

/**
 * Normalize temple name for comparison (strips common temple stop words).
 */
const STOP_WORDS = new Set([
  "temple",
  "mandir",
  "devasthanam",
  "kovil",
  "gudi",
  "shrine",
  "sri",
  "shri",
  "lord",
  "the",
  "dham",
  "peeth",
  "swamy",
  "swami"
]);

export function cleanTokens(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

/**
 * Multi-token similarity calculation:
 * Combines token overlap (Jaccard) with Jaro-Winkler similarity on cleaned strings.
 */
export function tokenAwareSimilarity(name1: string, name2: string): number {
  const norm1 = name1.toLowerCase().replace(/[^a-z0-9]/g, "");
  const norm2 = name2.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (norm1 === norm2 && norm1.length > 0) return 1.0;

  const tokens1 = cleanTokens(name1);
  const tokens2 = cleanTokens(name2);

  if (!tokens1.length || !tokens2.length) {
    return jaroWinkler(name1.toLowerCase(), name2.toLowerCase());
  }

  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  let intersection = 0;
  for (const t of set1) {
    if (set2.has(t)) intersection++;
  }
  const union = new Set([...tokens1, ...tokens2]).size;
  const jaccard = union > 0 ? intersection / union : 0;

  const strJw = jaroWinkler(tokens1.sort().join(" "), tokens2.sort().join(" "));

  return Math.round((jaccard * 0.4 + strJw * 0.6) * 1000) / 1000;
}

/**
 * Compare two temple candidates and classify potential duplication.
 */
export function evaluateDuplicate(
  t1: TempleComparisonCandidate,
  t2: TempleComparisonCandidate
): DuplicateMatchResult {
  const notes: string[] = [];

  // 1. Name Similarity (including alternative names)
  const allNames1 = [t1.name, ...(t1.alternativeNames || [])].filter(Boolean);
  const allNames2 = [t2.name, ...(t2.alternativeNames || [])].filter(Boolean);

  let maxNameSim = 0;
  for (const n1 of allNames1) {
    for (const n2 of allNames2) {
      const sim = tokenAwareSimilarity(n1, n2);
      if (sim > maxNameSim) maxNameSim = sim;
    }
  }

  // 2. Geospatial Proximity
  let distanceMeters: number | null = null;
  const hasCoords1 = t1.latitude != null && t1.longitude != null;
  const hasCoords2 = t2.latitude != null && t2.longitude != null;

  if (hasCoords1 && hasCoords2) {
    distanceMeters = haversineDistance(
      t1.latitude!,
      t1.longitude!,
      t2.latitude!,
      t2.longitude!
    );
  }

  // 3. Administrative Parent Match
  const stateMatch =
    !t1.stateCode || !t2.stateCode || t1.stateCode.toUpperCase() === t2.stateCode.toUpperCase();
  const districtMatch =
    !t1.districtName ||
    !t2.districtName ||
    t1.districtName.trim().toLowerCase() === t2.districtName.trim().toLowerCase();

  // 4. Deity Alignment
  let deityMatch = false;
  if (t1.mainDeity && t2.mainDeity) {
    const d1 = t1.mainDeity.toLowerCase().replace(/[^a-z0-9]/g, "");
    const d2 = t2.mainDeity.toLowerCase().replace(/[^a-z0-9]/g, "");
    deityMatch = d1.includes(d2) || d2.includes(d1) || jaroWinkler(d1, d2) >= 0.85;
  } else if (!t1.mainDeity || !t2.mainDeity) {
    // Unknown deity is neutral
    deityMatch = true;
  }

  // Calculate composite confidence score
  let score = maxNameSim * 0.5;

  if (distanceMeters !== null) {
    if (distanceMeters <= 100) {
      score += 0.4;
      notes.push(`Near-coincident location (<100m: ${distanceMeters}m)`);
    } else if (distanceMeters <= 250) {
      score += 0.3;
      notes.push(`Close proximity (<250m: ${distanceMeters}m)`);
    } else if (distanceMeters <= 1000) {
      score += 0.1;
      notes.push(`Same vicinity (<1km: ${distanceMeters}m)`);
    } else {
      score -= 0.3;
      notes.push(`Geographically distant (${distanceMeters}m)`);
    }
  }

  if (deityMatch && t1.mainDeity && t2.mainDeity) {
    score += 0.1;
    notes.push("Main deity matches");
  }

  if (!stateMatch) {
    score -= 0.5;
    notes.push("Different states (conflicting administrative boundaries)");
  } else if (!districtMatch) {
    score -= 0.3;
    notes.push("Different districts in same state");
  }

  const confidenceScore = Math.max(0.0, Math.min(1.0, Math.round(score * 100) / 100));

  // Determine Classification
  let classification: DuplicateClassification = "UNIQUE";

  if (!stateMatch) {
    classification = "UNIQUE"; // Never merge cross-state records automatically
  } else if (distanceMeters !== null && distanceMeters <= 100 && maxNameSim >= 0.85) {
    classification = "EXACT_DUPLICATE";
  } else if (confidenceScore >= 0.85 || (distanceMeters !== null && distanceMeters <= 250 && maxNameSim >= 0.75)) {
    classification = "PROBABLE_DUPLICATE";
  } else if (confidenceScore >= 0.65 || (maxNameSim >= 0.80 && districtMatch)) {
    classification = "POSSIBLE_DUPLICATE";
  }

  return {
    classification,
    confidenceScore,
    nameSimilarity: maxNameSim,
    distanceMeters,
    deityMatch,
    stateMatch,
    districtMatch,
    notes
  };
}
