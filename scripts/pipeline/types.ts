/**
 * DEVYATRA / TEMPLEORA — NATIONAL DATA EXPANSION PIPELINE TYPES
 * 
 * Strict, auditable types for the reproducible place ingestion pipeline:
 * DISCOVER -> NORMALIZE -> VALIDATE -> DEDUPE -> PROVENANCE -> IMPORT -> REPORT
 */

import type { MasterCategory } from "../../src/lib/destinations/categories.js";

export type PipelineStageStatus =
  | "DISCOVERED"
  | "RESEARCHING"
  | "VALIDATED"
  | "IMPORTED"
  | "DUPLICATE"
  | "REJECTED"
  | "NEEDS_COORDINATES"
  | "NEEDS_SOURCE"
  | "NEEDS_ADMIN_MAPPING";

export type CoordinateStatus = "VERIFIED" | "APPROXIMATE" | "UNVERIFIED";

export type ProvenanceTier =
  | "OFFICIAL_STATUTORY"
  | "INTERNATIONAL_INSTITUTIONAL"
  | "STATE_GOVERNMENT"
  | "LOCAL_AUTHORITY"
  | "REPUTABLE_SECONDARY"
  | "COMMUNITY_REPORTED"
  | "CURATED_DB";

export interface PipelineSourceReference {
  id?: string;
  title: string;
  publisher: string;
  url: string;
  sourceType:
    | "GOVERNMENT"
    | "STATUTORY"
    | "UNESCO"
    | "INSTITUTIONAL"
    | "TOURISM"
    | "ACADEMIC"
    | "SECONDARY"
    | "DISCOVERY";
  accessedAt?: string;
  officialRecordId?: string | null;
}

export interface PipelineCandidateRecord {
  id: string;
  slug: string;
  name: string;
  nativeName?: string;
  alternateNames?: string[];
  category: MasterCategory;
  categories?: MasterCategory[];
  subcategory?: string;
  description: string;

  // Administrative hierarchy
  state: string;
  stateCode?: string;
  district: string;
  subDistrict?: string;
  city?: string;
  locality?: string;
  country?: string;

  // Spatial coordinates
  latitude: number;
  longitude: number;
  coordinateStatus: CoordinateStatus;
  coordinatePrecision?: "EXACT" | "APPROXIMATE" | "ESTIMATED" | "CENTROID" | "UNKNOWN";
  elevationMeters?: number;

  // Access & hours (strictly null if unverified, no synthetic times)
  timings?: string | null;
  entryFee?: string | null;
  bestTimeToVisit?: string;
  recommendedDuration?: string;
  accessType?: "PUBLIC" | "PERMIT_REQUIRED" | "RESTRICTED" | "SEASONAL";
  accessRestrictions?: string;

  // Statutory flags
  asiProtected?: boolean;
  asiMonumentId?: string | null;
  unescoDesignated?: boolean;
  unescoReference?: string | null;
  ramsarSite?: boolean;
  tigerReserve?: boolean;
  nationalPark?: boolean;
  wildlifeSanctuary?: boolean;
  elephantReserve?: boolean;
  biosphereReserve?: boolean;
  communityReserve?: boolean;
  marineProtectedArea?: boolean;
  importantBirdArea?: boolean;
  gsiProtected?: boolean;
  gsiMonumentId?: string | null;

  // Multi-Faith & Cultural Attributes
  placeKind?: string;
  subtypes?: string[];
  activities?: string[];
  designations?: string[];
  faith?: string;
  religiousTradition?: string;

  // Provenance & Trust
  sources: PipelineSourceReference[];
  provenanceTier: ProvenanceTier;
  verificationStatus:
    | "VERIFIED_OFFICIAL"
    | "VERIFIED_INSTITUTIONAL"
    | "VERIFIED_SECONDARY"
    | "COMMUNITY_REPORTED"
    | "NEEDS_REVIEW"
    | "UNVERIFIED"
    | "REJECTED";
  verifiedAt?: string;
  lastCheckedAt?: string;

  // Imagery
  image?: string;
  imageAlt?: string;
  imageCreditName?: string;
  imageCreditSource?: string;
  imageLicense?: string;
  isAiGeneratedImage?: boolean;

  // Tags
  highlights?: string[];
  tags?: string[];
  culturalTags?: string[];
  audienceTags?: string[];

  // Relationships
  nearbyTempleSlugs?: string[];
  parentPlaceId?: string;
  relatedPlaceSlugs?: string[];

  // Pipeline lifecycle tracking
  pipelineStatus: PipelineStageStatus;
  rejectionReason?: string;
  duplicateOfId?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DeduplicationResult {
  unique: PipelineCandidateRecord[];
  duplicates: Array<{
    candidate: PipelineCandidateRecord;
    matchedWith: PipelineCandidateRecord;
    reason: string;
    distanceMeters?: number;
  }>;
}

export interface CoverageMetricSummary {
  datasetVersion: string;
  generatedAt: string;
  totalCandidates: number;
  passedValidation: number;
  rejectedCount: number;
  duplicateCount: number;
  canonicalPlacesImported: number;
  canonicalSourcesLogged: number;
  categoryRelationsLogged: number;
  statesCovered: number;
  statesTotal: number;
  utsCovered: number;
  utsTotal: number;
  districtsCovered: number;
  categoriesRepresented: number;
  categoriesTotal: number;
  verifiedCoordinatePercent: number;
  verifiedSourceProvenancePercent: number;
  templeLinksEstablished: number;
}
