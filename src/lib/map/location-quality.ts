/**
 * DEVYATRA / TEMPLEORA — V2.4 REAL GEOGRAPHIC MAP ENGINE
 * Location Quality & Geospatial Coordinate Validation Engine
 * 
 * Strict quality hierarchy:
 * EXACT -> SITE_CENTER -> APPROXIMATE -> UNKNOWN
 * 
 * Principle: Zero centroid fallbacks, honest provenance, and strict boundary validation.
 */

export type LocationAccuracy = "EXACT" | "SITE_CENTER" | "APPROXIMATE" | "UNKNOWN";

export type LocationSource =
  | "OFFICIAL_VERIFIED"
  | "GOOGLE_PLACES_VERIFIED"
  | "SURVEY_MAPPED"
  | "COMMUNITY_REPORTED"
  | "CURATED_CATALOG"
  | "UNKNOWN";

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface BoundingBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

export interface LocationQualityAssessment {
  accuracy: LocationAccuracy;
  source: LocationSource;
  qualityScore: number; // 0 to 100
  isValid: boolean;
  isWithinIndia: boolean;
  isCentroidFallback: boolean;
  accuracyLabel: string;
  accuracyDescription: string;
  badgeVariant: "gold" | "emerald" | "amber" | "muted";
}

/**
 * Standard sovereign geographic bounds for the Republic of India:
 * Lat: ~6.5°N (Indira Point/Great Nicobar) to ~37.5°N (Indira Col, Ladakh)
 * Lng: ~68.0°E (Ghuar Mota, Gujarat) to ~97.5°E (Kibithu, Arunachal Pradesh)
 */
export const INDIA_BOUNDS: BoundingBox = {
  minLng: 68.0,
  minLat: 6.5,
  maxLng: 97.5,
  maxLat: 37.5,
};

export const DEFAULT_MAP_CENTER = {
  lat: 20.5937,
  lng: 78.9629,
  zoom: 4.8,
};

/**
 * Validates whether latitude and longitude are real geographic numbers
 */
export function isValidCoordinate(lat?: number | null, lng?: number | null): boolean {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
  if (typeof lat !== "number" || typeof lng !== "number") return false;
  if (Number.isNaN(lat) || Number.isNaN(lng)) return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  // Reject Null Island (0,0)
  if (Math.abs(lat) < 0.0001 && Math.abs(lng) < 0.0001) return false;
  return true;
}

/**
 * Validates whether coordinates fall within India's sovereign bounding envelope
 */
export function isWithinIndiaBounds(lat: number, lng: number): boolean {
  if (!isValidCoordinate(lat, lng)) return false;
  return (
    lat >= INDIA_BOUNDS.minLat &&
    lat <= INDIA_BOUNDS.maxLat &&
    lng >= INDIA_BOUNDS.minLng &&
    lng <= INDIA_BOUNDS.maxLng
  );
}

/**
 * Calculates Haversine distance in kilometers between two points
 */
export function calculateHaversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Evaluates the location accuracy and provenance quality of a destination or temple record
 */
export function assessLocationQuality(record: {
  latitude: number;
  longitude: number;
  isCentroidFallback?: boolean | null;
  verificationStatus?: string | null;
  sourceType?: string | null;
  googlePlaceId?: string | null;
  dataConfidence?: number | null;
}): LocationQualityAssessment {
  const valid = isValidCoordinate(record.latitude, record.longitude);
  const inIndia = valid && isWithinIndiaBounds(record.latitude, record.longitude);
  const isFallback = Boolean(record.isCentroidFallback);

  if (!valid || !inIndia || isFallback) {
    return {
      accuracy: "UNKNOWN",
      source: "UNKNOWN",
      qualityScore: 0,
      isValid: valid,
      isWithinIndia: inIndia,
      isCentroidFallback: isFallback,
      accuracyLabel: "Location Unverified",
      accuracyDescription: "Precise coordinates not yet established or flagged as centroid fallback.",
      badgeVariant: "muted",
    };
  }

  const verStatus = (record.verificationStatus || "").toUpperCase();
  const srcType = (record.sourceType || "").toLowerCase();
  const hasGoogle = Boolean(record.googlePlaceId);

  // Exact accuracy: verified official or statutory source
  if (
    verStatus.includes("VERIFIED_OFFICIAL") ||
    verStatus === "OFFICIAL" ||
    srcType.includes("official") ||
    srcType.includes("asi") ||
    srcType.includes("unesco")
  ) {
    return {
      accuracy: "EXACT",
      source: "OFFICIAL_VERIFIED",
      qualityScore: Math.max(90, record.dataConfidence ?? 95),
      isValid: true,
      isWithinIndia: true,
      isCentroidFallback: false,
      accuracyLabel: "Exact Location",
      accuracyDescription: "Verified from official temple administration or statutory heritage records.",
      badgeVariant: "gold",
    };
  }

  // Site Center: matched via Google Places or Verified Source
  if (
    hasGoogle ||
    verStatus.includes("VERIFIED_SOURCE") ||
    verStatus.includes("SOURCE") ||
    srcType.includes("google") ||
    srcType.includes("government")
  ) {
    return {
      accuracy: "SITE_CENTER",
      source: "GOOGLE_PLACES_VERIFIED",
      qualityScore: Math.max(75, record.dataConfidence ?? 80),
      isValid: true,
      isWithinIndia: true,
      isCentroidFallback: false,
      accuracyLabel: "Site Center",
      accuracyDescription: "Matched with Google Places satellite footprint and ground-truth records.",
      badgeVariant: "emerald",
    };
  }

  // Approximate: community reported or curated catalog
  if (verStatus.includes("COMMUNITY") || srcType.includes("community")) {
    return {
      accuracy: "APPROXIMATE",
      source: "COMMUNITY_REPORTED",
      qualityScore: Math.max(50, record.dataConfidence ?? 60),
      isValid: true,
      isWithinIndia: true,
      isCentroidFallback: false,
      accuracyLabel: "Approximate",
      accuracyDescription: "Reported by pilgrim community; verify entrance gate on arrival.",
      badgeVariant: "amber",
    };
  }

  // Curated Catalog Default
  return {
    accuracy: "APPROXIMATE",
    source: "CURATED_CATALOG",
    qualityScore: record.dataConfidence ?? 65,
    isValid: true,
    isWithinIndia: true,
    isCentroidFallback: false,
    accuracyLabel: "Curated Coordinate",
    accuracyDescription: "Coordinates indexed from directory catalog; confirm approach road.",
    badgeVariant: "amber",
  };
}

/**
 * Validates a bounding box query string [minLng, minLat, maxLng, maxLat]
 */
export function parseBoundingBox(bboxStr?: string | null): BoundingBox | null {
  if (!bboxStr) return null;
  const parts = bboxStr.split(",").map((s) => parseFloat(s.trim()));
  if (parts.length !== 4 || parts.some(isNaN)) return null;

  const [minLng, minLat, maxLng, maxLat] = parts;
  if (minLng < -180 || maxLng > 180 || minLat < -90 || maxLat > 90) return null;
  if (minLng >= maxLng || minLat >= maxLat) return null;

  return { minLng, minLat, maxLng, maxLat };
}
