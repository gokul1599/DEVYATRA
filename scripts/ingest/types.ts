import type { MasterCategory } from "../../src/lib/destinations/categories";

export type CoordinatePrecision = "EXACT" | "APPROXIMATE" | "ESTIMATED" | "CENTROID" | "UNKNOWN";

export type ProvenanceTier =
  | "OFFICIAL_STATUTORY"
  | "INTERNATIONAL_INSTITUTIONAL"
  | "STATE_GOVERNMENT"
  | "LOCAL_AUTHORITY"
  | "REPUTABLE_SECONDARY"
  | "COMMUNITY_REPORTED"
  | "CURATED_DB";

export type VerificationStatus =
  | "VERIFIED_OFFICIAL"
  | "VERIFIED_INSTITUTIONAL"
  | "VERIFIED_SECONDARY"
  | "COMMUNITY_REPORTED"
  | "NEEDS_REVIEW"
  | "UNVERIFIED"
  | "REJECTED";

export interface RawPlaceInput {
  slug: string;
  name: string;
  nativeName?: string;
  alternateNames?: string[];
  category: MasterCategory;
  categories?: MasterCategory[];
  subcategory?: string;
  description: string;
  
  // Geolocation
  latitude: number;
  longitude: number;
  coordinatePrecision?: CoordinatePrecision;
  elevationMeters?: number;
  address?: string;
  city?: string;
  district: string;
  state: string;
  country?: string;
  
  // Lifecycle & Access
  status?: "ACTIVE" | "SEASONAL" | "TEMPORARILY_CLOSED" | "PERMANENTLY_CLOSED" | "RESTRICTED_ACCESS";
  timings?: string | null;
  entryFee?: string | null;
  bestTimeToVisit?: string;
  recommendedDuration?: string;
  facilities?: string[];
  accessibilityFeatures?: string[];

  // Statutory Designations
  asiProtected?: boolean;
  asiMonumentId?: string;
  unescoDesignated?: boolean;
  unescoReference?: string;
  ramsarSite?: boolean;
  tigerReserve?: boolean;
  nationalPark?: boolean;
  wildlifeSanctuary?: boolean;
  giProductTag?: string;

  // Provenance & Source
  verificationStatus?: VerificationStatus;
  provenanceTier?: ProvenanceTier;
  sourceName: string;
  sourceType: string;
  sourceUrl?: string;
  officialWebsite?: string | null;

  // Media
  image?: string;
  imageAlt?: string;
  imageCreditName?: string;
  imageCreditSource?: string;
  imageLicense?: string;
  isAiGeneratedImage?: boolean;

  // Tags & Highlights
  highlights?: string[];
  tags?: string[];
  culturalTags?: string[];
  audienceTags?: string[];

  // Nearby Temple Linkages (for bridging with existing devyatra temples)
  nearbyTempleSlugs?: string[];
}

export interface ValidationIssue {
  field: string;
  message: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}
