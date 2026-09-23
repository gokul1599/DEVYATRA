/**
 * DEVYATRA / TEMPLEORA — UNIFIED DESTINATION GRAPH
 * 
 * Provides a single, canonical schema uniting:
 * - Curated Shrines & Temples
 * - Canonical Heritage & Famous Places
 * - Live Google Places / Runtime discoveries
 * - Community Reported Submissions
 * 
 * Guarantees zero data collisions, clean source attribution, and honest distance metrics.
 */

export type DestinationCategory =
  | "TEMPLE"
  | "HERITAGE"
  | "PILGRIMAGE"
  | "NATURE"
  | "VIEWPOINT"
  | "MUSEUM"
  | "MARKET"
  | "CULTURE"
  | "FOOD"
  | "STAY"
  | "PARKING"
  | "TRANSPORT"
  | "FUEL"
  | "EV_CHARGING"
  | "HOSPITAL"
  | "PHARMACY"
  | "POLICE"
  | "ESSENTIALS"
  | "PHOTO_SPOT"
  | "LOCAL_EXPERIENCE";

export type ProvenanceTier =
  | "OFFICIAL_STATUTORY" // ASI, UNESCO, State Endowments (HRCE, Devasthanam)
  | "GOVERNMENT_TOURISM"  // Ministry of Tourism, State Tourism Development Corp
  | "CURATED_DB"          // Verified first-party database record
  | "COMMUNITY_REPORTED"  // User submission verified via admin audit
  | "LIVE_PROVIDER";      // Runtime Google Places Discovery (strictly labeled)

export interface UnifiedDestination {
  id: string;
  slug: string;
  name: string;
  nativeName?: string | null;
  category: DestinationCategory;
  subcategory?: string | null;
  description: string;
  latitude: number;
  longitude: number;
  
  // Locality Hierarchy
  locality?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  country: string;

  // Provenance & Trust
  provenanceTier: ProvenanceTier;
  sourceType?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  officialUrl?: string | null;
  verificationStatus: "VERIFIED_OFFICIAL" | "VERIFIED_SOURCE" | "COMMUNITY_VERIFIED" | "UNVERIFIED";
  lastVerifiedAt?: string | null;
  isCentroidFallback: boolean;

  // Proximity & Routing (Grounded, transparent)
  airDistanceKm?: number | null;
  roadDistanceKm?: number | null;
  estimatedDriveMinutes?: number | null;
  estimatedWalkMinutes?: number | null;
  displayDistance?: string;

  // Facilities & Accessibility (Strictly non-synthetic)
  facilities?: {
    parking?: "VERIFIED" | "UNAVAILABLE" | "UNKNOWN";
    wheelchairRamp?: "AVAILABLE" | "NOT_AVAILABLE" | "UNKNOWN";
    elevator?: "AVAILABLE" | "NOT_AVAILABLE" | "UNKNOWN";
    accessibleRestroom?: "AVAILABLE" | "NOT_AVAILABLE" | "UNKNOWN";
    elderlyRestSeating?: "AVAILABLE" | "NOT_AVAILABLE" | "UNKNOWN";
    drinkingWater?: "AVAILABLE" | "NOT_AVAILABLE" | "UNKNOWN";
    cloakroom?: "AVAILABLE" | "NOT_AVAILABLE" | "UNKNOWN";
    prasadam?: "AVAILABLE" | "NOT_AVAILABLE" | "UNKNOWN";
  };

  // Editorial highlight
  editorialHighlight?: string;
  imageReference?: string | null;
}

/**
 * Format distance string honestly:
 * Straight line: "Approx. X km away"
 * Road distance: "X.X km (~Y min drive)"
 */
export function formatGroundedDistance(
  airKm: number,
  roadKm?: number | null,
  driveMin?: number | null
): string {
  if (roadKm != null && driveMin != null && driveMin > 0) {
    return `${roadKm.toFixed(1)} km (~${driveMin} min drive)`;
  }
  if (airKm < 1.0) {
    return `Approx. ${Math.round(airKm * 1000)}m away`;
  }
  return `Approx. ${airKm.toFixed(1)} km away`;
}

/**
 * Maps a category to its visual theme color and icon identifier
 */
export function getCategoryBadgeTheme(category: DestinationCategory): {
  label: string;
  tone: "gold" | "emerald" | "terracotta" | "azure" | "purple" | "default";
} {
  switch (category) {
    case "TEMPLE":
    case "PILGRIMAGE":
      return { label: "Sacred Shrine", tone: "gold" };
    case "HERITAGE":
      return { label: "Heritage Landmark", tone: "terracotta" };
    case "NATURE":
    case "VIEWPOINT":
      return { label: "Nature & Viewpoint", tone: "emerald" };
    case "MUSEUM":
      return { label: "Museum & History", tone: "terracotta" };
    case "MARKET":
      return { label: "Local Bazaars", tone: "purple" };
    case "PHOTO_SPOT":
      return { label: "Scenic & Photography", tone: "purple" };
    case "CULTURE":
    case "LOCAL_EXPERIENCE":
      return { label: "Culture & Arts", tone: "purple" };
    case "FOOD":
      return { label: "Satvik Dining", tone: "gold" };
    case "STAY":
      return { label: "Pilgrim Stay", tone: "azure" };
    case "HOSPITAL":
    case "PHARMACY":
    case "POLICE":
    case "ESSENTIALS":
      return { label: "Essential Facility", tone: "default" };
    case "PARKING":
    case "TRANSPORT":
    case "FUEL":
    case "EV_CHARGING":
      return { label: "Travel & Parking", tone: "default" };
    default:
      return { label: "Destination", tone: "default" };
  }
}
