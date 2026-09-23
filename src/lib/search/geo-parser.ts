/**
 * DEVYATRA / TEMPLEORA — V2.4 NATURAL-LANGUAGE GEO SEARCH PARSER
 * 
 * Product Principle:
 * REAL GEOGRAPHY -> REAL LOCATIONS -> VERIFIED DESTINATIONS -> INTELLIGENT JOURNEYS
 * 
 * Parses natural conversational queries with spatial, radius, and categorical constraints:
 * - "temples within 100 km of Madurai"
 * - "heritage places within 200 km of Varanasi"
 * - "family destinations within 50 km of Bengaluru"
 * - "satvik food within 25 km of Tirupati"
 * - "ancient shrines near Hampi"
 * 
 * Extracts:
 * - Anchor city/temple and genuine coordinates
 * - Spatial radius (10–300 km) and corresponding distance band
 * - Category filter (TEMPLE, HERITAGE, NATURE, FOOD, STAY)
 * - Travel persona (Family, Senior Ease, Road Trip)
 * - Deep links to Map Explorer and Extended Discovery API
 */

import {
  type DistanceBandId,
  getDistanceBand,
  type TravelStyle,
} from "@/lib/destinations/extended-types";

export interface ParsedGeoQuery {
  rawQuery: string;
  hasGeoIntent: boolean;
  anchorName?: string;
  anchorCoordinates?: {
    latitude: number;
    longitude: number;
  };
  radiusKm: number;
  distanceBand: DistanceBandId;
  category: "ALL" | "TEMPLE" | "HERITAGE" | "NATURE" | "FOOD" | "STAY" | "CULTURE";
  travelStyle?: TravelStyle;
  deity?: string;
  mapHref?: string;
  discoveryHref?: string;
  searchHref?: string;
  summary: string;
}

/**
 * Verified sovereign geographic coordinates for major Indian pilgrimage nodes and city anchors
 */
export const KNOWN_GEO_ANCHORS: Record<string, { name: string; lat: number; lng: number; state: string }> = {
  madurai: { name: "Madurai", lat: 9.9195, lng: 78.1193, state: "Tamil Nadu" },
  chennai: { name: "Chennai", lat: 13.0827, lng: 80.2707, state: "Tamil Nadu" },
  thanjavur: { name: "Thanjavur", lat: 10.787, lng: 79.1378, state: "Tamil Nadu" },
  kanchipuram: { name: "Kanchipuram", lat: 12.8342, lng: 79.7036, state: "Tamil Nadu" },
  rameswaram: { name: "Rameswaram", lat: 9.2876, lng: 79.3129, state: "Tamil Nadu" },
  tiruchirappalli: { name: "Tiruchirappalli (Trichy)", lat: 10.7905, lng: 78.7047, state: "Tamil Nadu" },
  trichy: { name: "Tiruchirappalli", lat: 10.7905, lng: 78.7047, state: "Tamil Nadu" },
  kumbakonam: { name: "Kumbakonam", lat: 10.9602, lng: 79.3845, state: "Tamil Nadu" },
  tirupati: { name: "Tirupati", lat: 13.6288, lng: 79.4192, state: "Andhra Pradesh" },
  varanasi: { name: "Varanasi (Kashi)", lat: 25.3176, lng: 82.9739, state: "Uttar Pradesh" },
  kashi: { name: "Varanasi (Kashi)", lat: 25.3176, lng: 82.9739, state: "Uttar Pradesh" },
  ayodhya: { name: "Ayodhya", lat: 26.7922, lng: 82.1998, state: "Uttar Pradesh" },
  mathura: { name: "Mathura", lat: 27.4924, lng: 77.6737, state: "Uttar Pradesh" },
  vrindavan: { name: "Vrindavan", lat: 27.5806, lng: 77.7006, state: "Uttar Pradesh" },
  haridwar: { name: "Haridwar", lat: 29.9457, lng: 78.1642, state: "Uttarakhand" },
  rishikesh: { name: "Rishikesh", lat: 30.0869, lng: 78.2676, state: "Uttarakhand" },
  badrinath: { name: "Badrinath", lat: 30.7433, lng: 79.4938, state: "Uttarakhand" },
  kedarnath: { name: "Kedarnath", lat: 30.7352, lng: 79.0669, state: "Uttarakhand" },
  puri: { name: "Puri", lat: 19.8135, lng: 85.8312, state: "Odisha" },
  bhubaneswar: { name: "Bhubaneswar", lat: 20.2961, lng: 85.8245, state: "Odisha" },
  somnath: { name: "Somnath", lat: 20.888, lng: 70.401, state: "Gujarat" },
  dwarka: { name: "Dwarka", lat: 22.2442, lng: 68.9685, state: "Gujarat" },
  ujjain: { name: "Ujjain", lat: 23.1765, lng: 75.7885, state: "Madhya Pradesh" },
  omkareshwar: { name: "Omkareshwar", lat: 22.2458, lng: 76.1511, state: "Madhya Pradesh" },
  nashik: { name: "Nashik", lat: 19.9975, lng: 73.7898, state: "Maharashtra" },
  shirdi: { name: "Shirdi", lat: 19.7667, lng: 74.4767, state: "Maharashtra" },
  kolhapur: { name: "Kolhapur", lat: 16.705, lng: 74.2433, state: "Maharashtra" },
  bengaluru: { name: "Bengaluru", lat: 12.9716, lng: 77.5946, state: "Karnataka" },
  bangalore: { name: "Bengaluru", lat: 12.9716, lng: 77.5946, state: "Karnataka" },
  mysuru: { name: "Mysuru", lat: 12.2958, lng: 76.6394, state: "Karnataka" },
  mysore: { name: "Mysuru", lat: 12.2958, lng: 76.6394, state: "Karnataka" },
  hampi: { name: "Hampi", lat: 15.335, lng: 76.46, state: "Karnataka" },
  gokarna: { name: "Gokarna", lat: 14.5479, lng: 74.3188, state: "Karnataka" },
  udupi: { name: "Udupi", lat: 13.3409, lng: 74.7421, state: "Karnataka" },
  hyderabad: { name: "Hyderabad", lat: 17.385, lng: 78.4867, state: "Telangana" },
  mumbai: { name: "Mumbai", lat: 19.076, lng: 72.8777, state: "Maharashtra" },
  delhi: { name: "New Delhi", lat: 28.6139, lng: 77.209, state: "Delhi" },
  kolkata: { name: "Kolkata", lat: 22.5726, lng: 88.3639, state: "West Bengal" },
  amritsar: { name: "Amritsar", lat: 31.634, lng: 74.8723, state: "Punjab" },
  jaipur: { name: "Jaipur", lat: 26.9124, lng: 75.7873, state: "Rajasthan" },
  guwahati: { name: "Guwahati", lat: 26.1445, lng: 91.7362, state: "Assam" },
};

/**
 * Parse natural language query into structured geo parameters
 */
export function parseGeoSearchQuery(query: string): ParsedGeoQuery {
  const q = query.toLowerCase().trim();

  // 1. Detect radius pattern: "within 100 km", "within 50km", "around 200 km", "in 30 km"
  let radiusKm = 50;
  const radiusMatch = q.match(/(?:within|in|around|under|upto|radius of)\s*(\d{1,3})\s*(?:km|kms|kilometers|kilometres)?/i) ||
    q.match(/(\d{1,3})\s*(?:km|kms|kilometers)\s*(?:of|around|from|near)/i);

  if (radiusMatch && radiusMatch[1]) {
    const parsed = parseInt(radiusMatch[1], 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      radiusKm = Math.min(300, Math.max(5, parsed));
    }
  }

  // 2. Detect category
  let category: ParsedGeoQuery["category"] = "ALL";
  if (/\b(heritage|monument|fort|palace|ancient|history|asi|unesco)\b/i.test(q)) {
    category = "HERITAGE";
  } else if (/\b(nature|river|lake|ghat|sangam|hill|parvat|waterfall|cave)\b/i.test(q)) {
    category = "NATURE";
  } else if (/\b(food|bhojanalaya|satvik|prasad|dining|restaurant|meals)\b/i.test(q)) {
    category = "FOOD";
  } else if (/\b(stay|dharamshala|ashram|hotel|lodge|accommodation)\b/i.test(q)) {
    category = "STAY";
  } else if (/\b(temple|temples|mandir|sanctum|devalaya|shrine|shrines)\b/i.test(q)) {
    category = "TEMPLE";
  }

  // 3. Detect travel style
  let travelStyle: TravelStyle | undefined;
  if (/\b(senior|elder|parents|wheelchair|accessible)\b/i.test(q)) {
    travelStyle = "SENIOR";
  } else if (/\b(family|kids|children)\b/i.test(q)) {
    travelStyle = "FAMILY";
  } else if (/\b(road trip|drive|corridor|highway|car)\b/i.test(q)) {
    travelStyle = "ROAD_TRIP";
  }

  // 4. Detect deity
  let deity: string | undefined;
  const deities = ["shiva", "vishnu", "krishna", "rama", "devi", "durga", "ganesh", "murugan", "hanuman"];
  for (const d of deities) {
    if (new RegExp(`\\b${d}\\b`, "i").test(q)) {
      deity = d.charAt(0).toUpperCase() + d.slice(1);
      break;
    }
  }

  // 5. Match Anchor Location
  let matchedAnchorKey: string | undefined;
  for (const key of Object.keys(KNOWN_GEO_ANCHORS)) {
    // Check whole word match
    const regex = new RegExp(`\\b${key}\\b`, "i");
    if (regex.test(q)) {
      matchedAnchorKey = key;
      break;
    }
  }

  const hasGeoIntent = !!matchedAnchorKey || !!radiusMatch;
  const anchor = matchedAnchorKey ? KNOWN_GEO_ANCHORS[matchedAnchorKey] : undefined;
  const distanceBand = getDistanceBand(radiusKm);

  // Deep Links
  let mapHref: string | undefined;
  let discoveryHref: string | undefined;
  let searchHref: string | undefined;

  if (anchor) {
    const zoomLevel = radiusKm <= 15 ? 12 : radiusKm <= 50 ? 10 : radiusKm <= 150 ? 8 : 7;
    mapHref = `/map?lat=${anchor.lat}&lng=${anchor.lng}&zoom=${zoomLevel}&radius=${radiusKm}`;
    discoveryHref = `/api/destinations/extended-discovery?lat=${anchor.lat}&lng=${anchor.lng}&radiusKm=${radiusKm}&category=${category}`;
    searchHref = `/search?q=${encodeURIComponent(query)}&lat=${anchor.lat}&lng=${anchor.lng}`;
  }

  // Generate clear natural language summary
  let summary = "";
  if (anchor) {
    const catLabel = category === "ALL" ? "destinations" : category.toLowerCase() + (category === "TEMPLE" ? "s" : " places");
    summary = `Showing ${deity ? deity + " " : ""}${catLabel} within ${radiusKm} km of ${anchor.name}, ${anchor.state}`;
    if (travelStyle) {
      summary += ` tailored for ${travelStyle === "FAMILY" ? "families" : travelStyle === "SENIOR" ? "seniors" : "road trip travelers"}`;
    }
  } else {
    summary = `Search within ${radiusKm} km radius across verified sacred India atlas`;
  }

  return {
    rawQuery: query,
    hasGeoIntent,
    anchorName: anchor ? `${anchor.name}, ${anchor.state}` : undefined,
    anchorCoordinates: anchor ? { latitude: anchor.lat, longitude: anchor.lng } : undefined,
    radiusKm,
    distanceBand,
    category,
    travelStyle,
    deity,
    mapHref,
    discoveryHref,
    searchHref,
    summary,
  };
}
