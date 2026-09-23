/**
 * DEVYATRA / TEMPLEORA — V2.4 EXTENDED DISCOVERY TYPES & PURE CALCULATORS
 * 
 * Client-safe definitions for 300 km regional discovery:
 * distance bands, road travel calibration, significance classification, and travel styles.
 * Contains ZERO server-side database imports.
 */

import { formatGroundedDistance } from "./unified";

export type DistanceBandId = "BAND_0_10" | "BAND_10_50" | "BAND_50_150" | "BAND_150_300";

export interface DistanceBandConfig {
  id: DistanceBandId;
  label: string;
  minKm: number;
  maxKm: number;
  tagline: string;
  idealFor: string;
}

export const DISTANCE_BANDS: Record<DistanceBandId, DistanceBandConfig> = {
  BAND_0_10: {
    id: "BAND_0_10",
    label: "0–10 km",
    minKm: 0,
    maxKm: 10,
    tagline: "Immediate Surroundings & Quick Stops",
    idealFor: "Foot/Auto darshan, sacred tanks, immediate ashrams & parikrama",
  },
  BAND_10_50: {
    id: "BAND_10_50",
    label: "10–50 km",
    minKm: 10,
    maxKm: 50,
    tagline: "Half-Day Circuit & Around This Destination",
    idealFor: "Morning or evening excursions, twin sanctums, hill shrines & heritage forts",
  },
  BAND_50_150: {
    id: "BAND_50_150",
    label: "50–150 km",
    minKm: 50,
    maxKm: 150,
    tagline: "Day Trips & Regional Sacred Nodes",
    idealFor: "Full day pilgrimage drives, major district shrines, ASI world heritage monuments",
  },
  BAND_150_300: {
    id: "BAND_150_300",
    label: "150–300 km",
    minKm: 150,
    maxKm: 300,
    tagline: "Extended Yatra & Sacred Corridors",
    idealFor: "Multi-day highway yatra, connecting Char Dham, Jyotirlinga & Shakti Peetha corridors",
  },
};

export type SignificanceTier =
  | "NATIONAL_SIGNIFICANCE"
  | "REGIONAL_SIGNIFICANCE"
  | "HERITAGE_SIGNIFICANCE"
  | "PILGRIMAGE_SIGNIFICANCE"
  | "NATURE_SIGNIFICANCE";

export type TravelStyle = "FAMILY" | "SENIOR" | "ROAD_TRIP" | "AUTONOMOUS";
export type VisitDuration = "QUICK_STOP" | "HALF_DAY" | "FULL_DAY" | "MULTI_DAY";

export interface ExtendedDiscoveryItem {
  id: string;
  slug: string;
  name: string;
  nativeName?: string | null;
  category: "TEMPLE" | "HERITAGE" | "PILGRIMAGE" | "NATURE" | "VIEWPOINT" | "CULTURE" | "FOOD" | "STAY" | "ESSENTIALS";
  subcategory?: string | null;
  description: string;
  latitude: number;
  longitude: number;
  locality?: string | null;
  district?: string | null;
  state?: string | null;
  airDistanceKm: number;
  roadDistanceKm: number;
  estimatedDriveMinutes: number;
  displayDistance: string;
  distanceBand: DistanceBandId;
  significance: SignificanceTier;
  significanceLabel: string;
  travelStyles: TravelStyle[];
  duration: VisitDuration;
  durationLabel: string;
  provenanceTier: string;
  verificationStatus: string;
  isCentroidFallback: boolean;
  editorialHighlight?: string;
  imageReference?: string | null;
  navLinks: {
    googleMaps: string;
    appleMaps: string;
    internalUrl: string;
  };
}

export interface ExtendedDiscoveryOptions {
  radiusKm?: number; // Up to 300
  categories?: string[]; // TEMPLE, HERITAGE, NATURE, CULTURE, etc.
  distanceBand?: DistanceBandId;
  significance?: SignificanceTier;
  travelStyle?: TravelStyle;
  duration?: VisitDuration;
  limit?: number;
  excludeId?: string;
}

export interface ExtendedDiscoveryResult {
  anchor: {
    name?: string;
    latitude: number;
    longitude: number;
  };
  totalCount: number;
  bands: {
    band: DistanceBandConfig;
    count: number;
    items: ExtendedDiscoveryItem[];
  }[];
  allFiltered: ExtendedDiscoveryItem[];
}

/**
 * Assigns distance band based on air distance
 */
export function getDistanceBand(distanceKm: number): DistanceBandId {
  if (distanceKm <= 10) return "BAND_0_10";
  if (distanceKm <= 50) return "BAND_10_50";
  if (distanceKm <= 150) return "BAND_50_150";
  return "BAND_150_300";
}

/**
 * Calculates estimated road driving distance and drive duration with terrain calibration:
 * - 0-10 km: winding urban/town approach (factor 1.25, 25 km/h)
 * - 10-50 km: state district roads (factor 1.22, 38 km/h)
 * - 50-150 km: state/national highways (factor 1.20, 50 km/h)
 * - 150-300 km: national expressways/multi-lane corridors (factor 1.18, 60 km/h)
 */
export function estimateRoadMetrics(airKm: number): {
  roadKm: number;
  driveMin: number;
} {
  let detourFactor = 1.22;
  let avgSpeedKmh = 40;

  if (airKm <= 10) {
    detourFactor = 1.25;
    avgSpeedKmh = 25;
  } else if (airKm <= 50) {
    detourFactor = 1.22;
    avgSpeedKmh = 38;
  } else if (airKm <= 150) {
    detourFactor = 1.20;
    avgSpeedKmh = 50;
  } else {
    detourFactor = 1.18;
    avgSpeedKmh = 60;
  }

  const roadKm = Number((airKm * detourFactor).toFixed(1));
  const driveMin = Math.max(1, Math.round((roadKm / avgSpeedKmh) * 60));
  return { roadKm, driveMin };
}

/**
 * Classifies destination significance based on badges, architectural lineage, and sacred traditions
 */
export function classifySignificance(item: {
  name: string;
  description?: string | null;
  badges?: string[];
  mainDeity?: string | null;
  architecture?: string | null;
  asiMonumentId?: string | null;
  category?: string;
}): { tier: SignificanceTier; label: string } {
  const text = `${item.name} ${item.description || ""} ${item.badges?.join(" ") || ""} ${item.mainDeity || ""} ${item.architecture || ""}`.toLowerCase();

  // 1. National Significance
  if (
    text.includes("jyotirlinga") ||
    text.includes("char dham") ||
    text.includes("shakti peeth") ||
    text.includes("divya desam") ||
    text.includes("unesco") ||
    text.includes("national significance") ||
    text.includes("tirupati") ||
    text.includes("vaishno devi") ||
    text.includes("kashi vishwanath") ||
    text.includes("puri jagannath") ||
    text.includes("somnath") ||
    text.includes("meenakshi")
  ) {
    return { tier: "NATIONAL_SIGNIFICANCE", label: "National Sacred Landmark" };
  }

  // 2. Heritage Significance (ASI, Ancient Architecture)
  if (
    item.asiMonumentId ||
    item.category === "HERITAGE" ||
    text.includes("asi protected") ||
    text.includes("archaeological") ||
    text.includes("chola") ||
    text.includes("hoysala") ||
    text.includes("chalukya") ||
    text.includes("pallava") ||
    text.includes("vijayanagara") ||
    text.includes("rock-cut") ||
    text.includes("monolithic") ||
    text.includes("ancient monument")
  ) {
    return { tier: "HERITAGE_SIGNIFICANCE", label: "Ancient Heritage & Architecture" };
  }

  // 3. Nature Significance (Holy Hills, Confluences, Sacred Caves)
  if (
    item.category === "NATURE" ||
    item.category === "VIEWPOINT" ||
    text.includes("sangam") ||
    text.includes("confluence") ||
    text.includes("sacred river") ||
    text.includes("parvat") ||
    text.includes("holy hill") ||
    text.includes("cave temple") ||
    text.includes("kund") ||
    text.includes("sacred ghat")
  ) {
    return { tier: "NATURE_SIGNIFICANCE", label: "Sacred Geography & Nature" };
  }

  // 4. Pilgrimage Significance (Ancient tirthas, Paadal Petra Sthalam, Devasthanams)
  if (
    item.category === "PILGRIMAGE" ||
    text.includes("paadal petra") ||
    text.includes("tirtha") ||
    text.includes("swayambhu") ||
    text.includes("abhimana") ||
    text.includes("matha") ||
    text.includes("ashram") ||
    text.includes("parikrama")
  ) {
    return { tier: "PILGRIMAGE_SIGNIFICANCE", label: "Venerated Pilgrimage Kshetra" };
  }

  // Default: Regional Significance
  return { tier: "REGIONAL_SIGNIFICANCE", label: "Prominent Regional Sanctum" };
}

/**
 * Infers travel style compatibility
 */
export function inferTravelStyles(
  airKm: number,
  roadMin: number,
  significance: SignificanceTier,
  category: string
): TravelStyle[] {
  const styles: TravelStyle[] = ["AUTONOMOUS"];

  // Family friendly: accessible distance (< 150 km), prominent site, under 3.5 hrs drive
  if (roadMin <= 210 && (significance === "NATIONAL_SIGNIFICANCE" || significance === "REGIONAL_SIGNIFICANCE" || category === "HERITAGE")) {
    styles.push("FAMILY");
  }

  // Senior friendly: shorter drive (< 90 min) or high-priority sacred landmarks
  if (roadMin <= 100 || (airKm <= 50 && significance === "NATIONAL_SIGNIFICANCE")) {
    styles.push("SENIOR");
  }

  // Road trip: great corridor journeys (40 km to 300 km)
  if (airKm >= 35 && airKm <= 300) {
    styles.push("ROAD_TRIP");
  }

  return styles;
}

/**
 * Estimates recommended visit duration
 */
export function estimateVisitDuration(
  airKm: number,
  significance: SignificanceTier,
  category: string
): { duration: VisitDuration; label: string } {
  if (significance === "NATIONAL_SIGNIFICANCE" && airKm > 100) {
    return { duration: "MULTI_DAY", label: "Multi-Day Yatra (Recommended 2–3 Days)" };
  }
  if (airKm > 50 || significance === "NATIONAL_SIGNIFICANCE" || category === "HERITAGE") {
    return { duration: "FULL_DAY", label: "Full Day Excursion (6–10 Hours)" };
  }
  if (airKm > 10) {
    return { duration: "HALF_DAY", label: "Half-Day Circuit (3–5 Hours)" };
  }
  return { duration: "QUICK_STOP", label: "Quick Visit (1–2 Hours)" };
}

export { formatGroundedDistance };
