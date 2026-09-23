/**
 * DEVYATRA / TEMPLEORA — PHASE 27: SEARCH INTELLIGENCE & EVALUATION
 * 
 * Intent understanding, multilingual search evaluation dataset, and search ranking metrics (P@K, MRR).
 */

export type QueryIntent =
  | "TEMPLE_SEARCH"
  | "DEITY_SEARCH"
  | "LOCATION_SEARCH"
  | "TRAVEL_SEARCH"
  | "BOOKING_SEARCH"
  | "TIMING_SEARCH"
  | "PILGRIMAGE_PLANNING";

export interface SearchEvaluationCase {
  query: string;
  language: string; // "en" | "te" | "ta" | "kn" | "hi" | etc.
  expectedTopMatchSlug: string;
  acceptableSlugs: string[];
  intent: QueryIntent;
  tags: string[];
}

export const SEARCH_EVALUATION_CASES: SearchEvaluationCase[] = [
  // 1. English Standard
  {
    query: "Tirupati Balaji",
    language: "en",
    expectedTopMatchSlug: "sri-venkateswara-temple",
    acceptableSlugs: ["sri-venkateswara-temple", "sri-padmavathi-ammavaru-temple"],
    intent: "TEMPLE_SEARCH",
    tags: ["canonical", "english"],
  },
  // 2. Telugu Script
  {
    query: "తిరుపతి వేంకటేశ్వర స్వామి",
    language: "te",
    expectedTopMatchSlug: "sri-venkateswara-temple",
    acceptableSlugs: ["sri-venkateswara-temple"],
    intent: "TEMPLE_SEARCH",
    tags: ["vernacular", "telugu"],
  },
  // 3. Tamil Script
  {
    query: "திருப்பதி வெங்கடாசலபதி",
    language: "ta",
    expectedTopMatchSlug: "sri-venkateswara-temple",
    acceptableSlugs: ["sri-venkateswara-temple"],
    intent: "TEMPLE_SEARCH",
    tags: ["vernacular", "tamil"],
  },
  // 4. Kannada Script
  {
    query: "ಶ್ರೀ ವೆಂಕಟೇಶ್ವರ ಸ್ವಾಮಿ",
    language: "kn",
    expectedTopMatchSlug: "sri-venkateswara-temple",
    acceptableSlugs: ["sri-venkateswara-temple"],
    intent: "DEITY_SEARCH",
    tags: ["vernacular", "kannada"],
  },
  // 5. Devanagari Hindi Script
  {
    query: "श्री वेंकटेश्वर मंदिर तिरुपति",
    language: "hi",
    expectedTopMatchSlug: "sri-venkateswara-temple",
    acceptableSlugs: ["sri-venkateswara-temple"],
    intent: "TEMPLE_SEARCH",
    tags: ["vernacular", "hindi"],
  },
  // 6. Transliteration / Phonetic
  {
    query: "Tirupathi Venkatachalapathy",
    language: "en",
    expectedTopMatchSlug: "sri-venkateswara-temple",
    acceptableSlugs: ["sri-venkateswara-temple"],
    intent: "TEMPLE_SEARCH",
    tags: ["transliteration"],
  },
  // 7. Deity Intent
  {
    query: "Jyotirlinga temples of Lord Shiva",
    language: "en",
    expectedTopMatchSlug: "somnath-temple",
    acceptableSlugs: ["somnath-temple", "kashi-vishwanath-temple", "mahakaleshwar-temple"],
    intent: "DEITY_SEARCH",
    tags: ["deity", "circuit"],
  },
  // 8. Timing Intent
  {
    query: "What time does Kashi Vishwanath open tomorrow?",
    language: "en",
    expectedTopMatchSlug: "kashi-vishwanath-temple",
    acceptableSlugs: ["kashi-vishwanath-temple"],
    intent: "TIMING_SEARCH",
    tags: ["timing", "nl_query"],
  },
  // 9. Booking Intent
  {
    query: "TTD 300 Rs ticket online darshan booking link",
    language: "en",
    expectedTopMatchSlug: "sri-venkateswara-temple",
    acceptableSlugs: ["sri-venkateswara-temple"],
    intent: "BOOKING_SEARCH",
    tags: ["booking", "anti_fraud"],
  },
  // 10. Pilgrimage Planning Intent
  {
    query: "Plan a 3-day itinerary covering Madurai and Rameshwaram",
    language: "en",
    expectedTopMatchSlug: "meenakshi-amman-temple",
    acceptableSlugs: ["meenakshi-amman-temple", "ramanathaswamy-temple"],
    intent: "PILGRIMAGE_PLANNING",
    tags: ["planning", "multi_day"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 27F: INTENT CLASSIFICATION
// ─────────────────────────────────────────────────────────────────────────────

export function classifyQueryIntent(query: string): QueryIntent {
  const q = query.toLowerCase();

  if (q.includes("plan") || q.includes("itinerary") || q.includes("circuit") || q.includes("trip") || q.includes("days yatra")) {
    return "PILGRIMAGE_PLANNING";
  }
  if (q.includes("book") || q.includes("ticket") || q.includes("slot") || q.includes("price") || q.includes("seva") || q.includes("darshan token")) {
    return "BOOKING_SEARCH";
  }
  if (q.includes("timing") || q.includes("time") || q.includes("open") || q.includes("close") || q.includes("aarti") || q.includes("hours")) {
    return "TIMING_SEARCH";
  }
  if (q.includes("how to reach") || q.includes("distance") || q.includes("route") || q.includes("road") || q.includes("flight") || q.includes("train")) {
    return "TRAVEL_SEARCH";
  }
  if (q.includes("shiva") || q.includes("vishnu") || q.includes("durga") || q.includes("krishna") || q.includes("ganesha") || q.includes("murugan") || q.includes("deity")) {
    return "DEITY_SEARCH";
  }
  if (q.includes("district") || q.includes("state") || q.includes("near") || q.includes("in ") || q.includes("city")) {
    return "LOCATION_SEARCH";
  }

  return "TEMPLE_SEARCH";
}

// ─────────────────────────────────────────────────────────────────────────────
// 27E: SEARCH QUALITY METRICS (P@K, MRR)
// ─────────────────────────────────────────────────────────────────────────────

export function calculatePrecisionAtK(retrievedSlugs: string[], relevantSlugs: string[], k = 3): number {
  if (retrievedSlugs.length === 0 || k === 0) return 0.0;
  const topK = retrievedSlugs.slice(0, k);
  const relevantSet = new Set(relevantSlugs);
  const hits = topK.filter((slug) => relevantSet.has(slug)).length;
  return Math.round((hits / k) * 100) / 100;
}

export function calculateMRR(retrievedSlugs: string[], expectedTopSlug: string): number {
  const rank = retrievedSlugs.indexOf(expectedTopSlug);
  if (rank === -1) return 0.0;
  return Math.round((1 / (rank + 1)) * 100) / 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// 27G: MINIMAL PRIVACY-SAFE TELEMETRY
// ─────────────────────────────────────────────────────────────────────────────

export interface SearchTelemetryLog {
  timestamp: string;
  intent: QueryIntent;
  queryLength: number;
  resultCount: number;
  latencyMs: number;
  hasMatch: boolean;
}

const searchTelemetryBuffer: SearchTelemetryLog[] = [];

export function logSearchTelemetry(entry: Omit<SearchTelemetryLog, "timestamp">): void {
  searchTelemetryBuffer.push({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  if (searchTelemetryBuffer.length > 500) {
    searchTelemetryBuffer.shift();
  }
}

export function getTelemetrySummary(): { totalQueries: number; avgLatencyMs: number } {
  if (searchTelemetryBuffer.length === 0) return { totalQueries: 0, avgLatencyMs: 0 };
  const totalLatency = searchTelemetryBuffer.reduce((acc, curr) => acc + curr.latencyMs, 0);
  return {
    totalQueries: searchTelemetryBuffer.length,
    avgLatencyMs: Math.round(totalLatency / searchTelemetryBuffer.length),
  };
}
