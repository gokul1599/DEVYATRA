/**
 * DEVYATRA / TEMPLEORA — CANONICAL TEMPLE IDENTITY & GEOSPATIAL VERIFICATION ENGINE
 * 
 * GOLDEN RULE: SEARCH RESULT ≠ CANONICAL IDENTITY.
 * 
 * Never consider two temples identical merely because:
 * - Their names are similar
 * - They contain the same deity
 * - They are in the same district or city
 * - They belong to the same pilgrimage circuit
 * - Their names share words or search substrings
 * - They are commonly confused or historically related
 */

export type MatchStatus =
  | "PRESENT_EXACT"
  | "PRESENT_CANONICAL"
  | "PRESENT_ALIAS"
  | "WRONG_LOCATION"
  | "WRONG_RECORD"
  | "DUPLICATE"
  | "MISSING"
  | "REVIEW_REQUIRED";

export type VerificationTier =
  | "VERIFIED_OFFICIAL"
  | "GOVERNMENT_SOURCE"
  | "TRUSTED_SOURCE"
  | "COMMUNITY_REPORTED"
  | "UNVERIFIED";

export interface CanonicalTempleEntity {
  canonicalId: string;
  canonicalName: string;
  nativeNames: string[];
  aliases: string[];
  deity: string[];
  tradition: string[];
  state: string;
  stateCode: string;
  district: string;
  subUnit?: string;
  locality?: string;
  latitude: number;
  longitude: number;
  coordinateConfidence: "EXACT_SURVEY" | "HIGH_GEODETIC" | "MUNICIPAL" | "APPROXIMATE";
  sources: Array<{
    name: string;
    type: "official" | "government" | "asi" | "unesco" | "hrce" | "devasthanam" | "trusted";
    url?: string;
  }>;
  verificationStatus: VerificationTier;
  officialWebsite?: string;
  canonicalSlug: string;
  alternateSlugs: string[];
  identityEvidence: string[];
  lifecycleStatus: "ACTIVE" | "ARCHIVED" | "MERGED" | "UNDER_REVIEW";
}

/**
 * Standard Haversine distance in kilometers between two geodetic coordinates (WGS84).
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371.0; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  const dLon = ((lon2 - lon1) * Math.PI) / 180.0;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180.0) *
      Math.cos((lat2 * Math.PI) / 180.0) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Canonical string normalizer: lowercase, diacritics stripped, non-alphanumeric replaced with spaces.
 */
export function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Standardized State Code Lookup
 */
export const STATE_CODE_MAP: Record<string, string> = {
  "andhra pradesh": "AP",
  "arunachal pradesh": "AR",
  "assam": "AS",
  "bihar": "BR",
  "chhattisgarh": "CG",
  "goa": "GA",
  "gujarat": "GJ",
  "haryana": "HR",
  "himachal pradesh": "HP",
  "jharkhand": "JH",
  "karnataka": "KA",
  "kerala": "KL",
  "madhya pradesh": "MP",
  "maharashtra": "MH",
  "manipur": "MN",
  "meghalaya": "ML",
  "mizoram": "MZ",
  "nagaland": "NL",
  "odisha": "OD",
  "punjab": "PB",
  "rajasthan": "RJ",
  "sikkim": "SK",
  "tamil nadu": "TN",
  "telangana": "TS",
  "tripura": "TR",
  "uttar pradesh": "UP",
  "uttarakhand": "UK",
  "west bengal": "WB",
  "delhi": "DL",
  "jammu and kashmir": "JK",
  "ladakh": "LA",
  "puducherry": "PY",
  "chandigarh": "CH",
  "andaman and nicobar": "AN",
  "dadra and nagar haveli and daman and diu": "DH",
  "lakshadweep": "LD"
};

/**
 * Critical Disambiguation Pairs (Negative Matching Constraints).
 * These ensure that commonly confused or nearby temples are NEVER falsely merged.
 */
export const KNOWN_DISAMBIGUATION_PAIRS: Array<{
  targetName: string;
  targetState: string;
  forbiddenMatchKeywords: string[];
  reason: string;
}> = [
  {
    targetName: "Tirumala Venkateswara Temple",
    targetState: "AP",
    forbiddenMatchKeywords: ["varaha", "bedi anjaneya", "govindaraja", "kodandarama", "padmavathi", "dwaraka tirumala"],
    reason: "Tirumala Venkateswara is distinct from subsidiary or nearby shrines."
  },
  {
    targetName: "Srisailam Mallikarjuna",
    targetState: "AP",
    forbiddenMatchKeywords: ["araku", "basaralu", "nadkalsi"],
    reason: "Srisailam Jyotirlinga is distinct from other regional Mallikarjuna temples."
  },
  {
    targetName: "Srikalahasteeswara",
    targetState: "AP",
    forbiddenMatchKeywords: ["madurai", "kalahastiswamy"],
    reason: "Srikalahasti Pancha Bhoota Sthalam is distinct from other Shiva shrines."
  },
  {
    targetName: "Kamakhya Temple",
    targetState: "AS",
    forbiddenMatchKeywords: ["navagraha", "umananda", "sukreswar", "tinsukia"],
    reason: "Kamakhya Shakti Peeth in Guwahati is distinct from other Assam temples."
  },
  {
    targetName: "Umananda Temple",
    targetState: "AS",
    forbiddenMatchKeywords: ["chandrasekhar", "kamakhya", "navagraha"],
    reason: "Umananda Island temple is distinct from Peacock Island mainland shrines."
  },
  {
    targetName: "Mundeshwari Temple",
    targetState: "BR",
    forbiddenMatchKeywords: ["chamundeshwari", "kaimur fort"],
    reason: "Mundeshwari Temple in Kaimur, Bihar is distinct from Karnataka's Chamundeshwari."
  },
  {
    targetName: "Modhera Sun Temple",
    targetState: "GJ",
    forbiddenMatchKeywords: ["deo sun", "konark", "martand", "katarmal"],
    reason: "Modhera Sun Temple in Gujarat is distinct from Sun temples in Bihar, Odisha, or J&K."
  },
  {
    targetName: "Mansa Devi Temple",
    targetState: "HR",
    forbiddenMatchKeywords: ["pinjore", "pinjore gardens", "yadavindra"],
    reason: "Mansa Devi Temple is a sacred shrine, distinct from Pinjore Gardens."
  },
  {
    targetName: "Shankaracharya Temple",
    targetState: "JK",
    forbiddenMatchKeywords: ["mughal gardens", "nishat", "shalimar bagh", "chashme shahi"],
    reason: "Shankaracharya Temple on Gopadri Hill is distinct from Srinagar Mughal Gardens."
  },
  {
    targetName: "Somanathapura Chennakeshava Temple",
    targetState: "KA",
    forbiddenMatchKeywords: ["belur", "hassan", "chennakesava temple, belur"],
    reason: "Somanathapura Keshava Temple (Mysuru) is distinct from Belur Chennakeshava (Hassan)."
  },
  {
    targetName: "Padmanabhaswamy Temple",
    targetState: "KL",
    forbiddenMatchKeywords: ["attukal", "attukal bhagavathy", "pazhavangadi"],
    reason: "Padmanabhaswamy Temple is distinct from Attukal Bhagavathy Temple."
  },
  {
    targetName: "Mahakaleshwar Jyotirlinga",
    targetState: "MP",
    forbiddenMatchKeywords: ["harsiddhi", "kal bhairav", "mangalnath", "gadkalika"],
    reason: "Mahakaleshwar Jyotirlinga is distinct from Ujjain subsidiary Shakti shrines."
  },
  {
    targetName: "Bhojeshwar Temple",
    targetState: "MP",
    forbiddenMatchKeywords: ["jain", "bhojpur jain"],
    reason: "Bhojeshwar Shiva Temple is distinct from the adjacent Bhojpur Jain temple."
  },
  {
    targetName: "Mahalakshmi Temple Kolhapur",
    targetState: "MH",
    forbiddenMatchKeywords: ["kanaka mahalakshmi", "mumbai suburban", "visakhapatnam"],
    reason: "Kolhapur Ambabai Shakti Peetha is distinct from Visakhapatnam Kanaka Mahalakshmi."
  },
  {
    targetName: "Brahma Temple Pushkar",
    targetState: "RJ",
    forbiddenMatchKeywords: ["monastery", "ganganagar", "gurdwara"],
    reason: "Brahma Temple in Pushkar (Ajmer) is distinct from monasteries or distant districts."
  },
  {
    targetName: "Sankat Mochan Temple Varanasi",
    targetState: "UP",
    forbiddenMatchKeywords: ["annapurna", "kashi vishwanath", "kaal bhairav", "durga kund"],
    reason: "Sankat Mochan Hanuman Temple is distinct from other Varanasi temples."
  },
  {
    targetName: "Kedarnath Temple",
    targetState: "UK",
    forbiddenMatchKeywords: ["tehri garhwal", "tungnath", "rudranath", "madhyamaheshwar"],
    reason: "Kedarnath Jyotirlinga in Rudraprayag is distinct from Tehri Garhwal and other Panch Kedars."
  },
  {
    targetName: "Dakshineswar Kali Temple",
    targetState: "WB",
    forbiddenMatchKeywords: ["thillai kali", "kalighat", "tarapith"],
    reason: "Dakshineswar Kali Temple is distinct from Kalighat and Tamil Nadu Thillai Kali."
  }
];

export interface CandidateRecord {
  id: string;
  name: string;
  slug: string;
  stateCode?: string;
  stateName?: string;
  districtName?: string;
  districtId?: string;
  locality?: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  sourceType?: string | null;
  verificationStatus?: string | null;
  origin: "prisma.temple" | "prisma.place" | "ALL_INDIA_DESTINATIONS";
}

export interface EvaluationResult {
  status: MatchStatus;
  canonicalId?: string;
  canonicalName?: string;
  slug?: string;
  distanceKm?: number;
  score: number;
  evidence: string[];
  discrepancies: string[];
}

/**
 * Staged Canonical Identity Matching Engine
 */
export function evaluateTempleCandidate(
  benchmark: {
    id: string;
    benchmarkName: string;
    canonicalName: string;
    expectedState: string;
    expectedStateCode: string;
    expectedDistrict: string;
    expectedLocality?: string;
    latitude: number;
    longitude: number;
    primaryKeywords: string[];
    secondaryKeywords?: string[];
    negativeKeywords: string[];
  },
  candidate: CandidateRecord
): EvaluationResult {
  const evidence: string[] = [];
  const discrepancies: string[] = [];
  let score = 0;

  const candNameNorm = normalizeText(candidate.name);
  const candSlugNorm = normalizeText(candidate.slug);
  const candAddrNorm = normalizeText(candidate.address || "");
  const candDistNorm = normalizeText(candidate.districtName || "");

  // 1. STAGE F: NEGATIVE KEYWORD & FORBIDDEN PAIR CHECK (Fast Reject)
  for (const neg of benchmark.negativeKeywords) {
    const negNorm = normalizeText(neg);
    if (candNameNorm.includes(negNorm) || candSlugNorm.includes(negNorm) || candAddrNorm.includes(negNorm)) {
      discrepancies.push(`Violates negative keyword: "${neg}"`);
      return {
        status: "WRONG_RECORD",
        canonicalId: candidate.id,
        canonicalName: candidate.name,
        slug: candidate.slug,
        distanceKm: haversineDistanceKm(candidate.latitude, candidate.longitude, benchmark.latitude, benchmark.longitude),
        score: -100,
        evidence,
        discrepancies
      };
    }
  }

  // 2. GEOGRAPHIC STATE CHECK
  const expectedStateCode = benchmark.expectedStateCode.toUpperCase();
  const candStateCode = (candidate.stateCode || STATE_CODE_MAP[normalizeText(candidate.stateName || "")] || "").toUpperCase();
  const stateMatches =
    candStateCode === expectedStateCode ||
    (candStateCode === "UT" && expectedStateCode === "UK") ||
    (candStateCode === "UK" && expectedStateCode === "UT");

  if (!stateMatches) {
    discrepancies.push(`State mismatch: candidate in ${candidate.stateName || candStateCode}, expected ${benchmark.expectedState} (${expectedStateCode})`);
    return {
      status: "WRONG_RECORD",
      canonicalId: candidate.id,
      canonicalName: candidate.name,
      slug: candidate.slug,
      distanceKm: haversineDistanceKm(candidate.latitude, candidate.longitude, benchmark.latitude, benchmark.longitude),
      score: -50,
      evidence,
      discrepancies
    };
  }
  evidence.push(`State matches: ${benchmark.expectedState} (${expectedStateCode})`);
  score += 30;

  // 3. GEODETIC PROXIMITY CHECK (Haversine km)
  const distanceKm = haversineDistanceKm(
    candidate.latitude,
    candidate.longitude,
    benchmark.latitude,
    benchmark.longitude
  );

  if (distanceKm > 100.0) {
    discrepancies.push(`Distance exceeds threshold: ${distanceKm.toFixed(1)} km from benchmark coordinates`);
    return {
      status: "WRONG_LOCATION",
      canonicalId: candidate.id,
      canonicalName: candidate.name,
      slug: candidate.slug,
      distanceKm,
      score: -30,
      evidence,
      discrepancies
    };
  }

  if (distanceKm <= 5.0) {
    evidence.push(`Exact geodesic proximity: ${distanceKm.toFixed(2)} km`);
    score += 40;
  } else if (distanceKm <= 20.0) {
    evidence.push(`Close geodesic proximity: ${distanceKm.toFixed(2)} km`);
    score += 25;
  } else {
    evidence.push(`Regional proximity: ${distanceKm.toFixed(2)} km`);
    score += 10;
  }

  // 4. DISTRICT & LOCALITY CHECK
  const expDistNorm = normalizeText(benchmark.expectedDistrict);
  const districtMatches =
    candDistNorm === expDistNorm ||
    candDistNorm.includes(expDistNorm) ||
    expDistNorm.includes(candDistNorm) ||
    candAddrNorm.includes(expDistNorm);

  if (districtMatches) {
    evidence.push(`District matches: ${benchmark.expectedDistrict}`);
    score += 20;
  } else {
    discrepancies.push(`District discrepancy: candidate in "${candidate.districtName || 'unknown'}", expected "${benchmark.expectedDistrict}"`);
    // Deduct score if district is completely different and not a synthetic label
    if (candDistNorm && !candDistNorm.includes("central")) {
      score -= 15;
    }
  }

  // 5. NAME & KEYWORD MATCHING
  let matchedKeyword = false;
  for (const kw of benchmark.primaryKeywords) {
    const kwNorm = normalizeText(kw);
    if (candNameNorm.includes(kwNorm) || candSlugNorm.includes(kwNorm)) {
      matchedKeyword = true;
      evidence.push(`Primary keyword matched: "${kw}"`);
      score += 25;
      break;
    }
  }

  if (!matchedKeyword && benchmark.secondaryKeywords) {
    for (const kw of benchmark.secondaryKeywords) {
      const kwNorm = normalizeText(kw);
      if (candNameNorm.includes(kwNorm) || candSlugNorm.includes(kwNorm)) {
        matchedKeyword = true;
        evidence.push(`Secondary keyword matched: "${kw}"`);
        score += 15;
        break;
      }
    }
  }

  if (!matchedKeyword) {
    discrepancies.push("No primary or secondary benchmark keywords matched");
    return {
      status: "MISSING",
      canonicalId: candidate.id,
      canonicalName: candidate.name,
      slug: candidate.slug,
      distanceKm,
      score: 0,
      evidence,
      discrepancies
    };
  }

  // 6. EXACT CANONICAL ID OR NAME MATCH BONUS
  if (candNameNorm === normalizeText(benchmark.canonicalName)) {
    evidence.push(`Exact canonical name match: "${candidate.name}"`);
    score += 15;
  }

  // 7. DETERMINE FINAL STATUS
  let status: MatchStatus = "REVIEW_REQUIRED";
  if (score >= 80 && distanceKm <= 5.0 && districtMatches) {
    status = "PRESENT_EXACT";
  } else if (score >= 65 && distanceKm <= 15.0) {
    status = "PRESENT_CANONICAL";
  } else if (score >= 50 && distanceKm <= 30.0) {
    status = "PRESENT_ALIAS";
  } else if (distanceKm > 30.0) {
    status = "WRONG_LOCATION";
  } else {
    status = "REVIEW_REQUIRED";
  }

  return {
    status,
    canonicalId: candidate.id,
    canonicalName: candidate.name,
    slug: candidate.slug,
    distanceKm: Number(distanceKm.toFixed(2)),
    score,
    evidence,
    discrepancies
  };
}
