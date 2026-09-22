/**
 * Standardized State Ingestion Framework Types
 * Mandate: Source-first, provenance-recorded, idempotency-guaranteed.
 */

export type SourceType =
  | "government"
  | "official"
  | "trusted"
  | "asi"
  | "tourism"
  | "community"
  | "google";

export interface RawTempleRecord {
  name: string;
  nameLocal?: string;
  stateCode: string;
  districtName: string;
  subDistrictName?: string;
  localityName?: string;
  latitude: number;
  longitude: number;
  mainDeity?: string;
  deities?: string[];
  templeType?: string;
  tradition?: string[];
  architecture?: string;
  historicalPeriod?: string;
  description?: string;
  officialWebsite?: string;
  sourceRecordId?: string;
  sourceName: string;
  sourceUrl: string;
  sourceType: SourceType;
  sourceLastUpdated?: string;
  parserVersion?: string;
}

export interface ImporterOptions {
  dryRun?: boolean;
  force?: boolean;
  parserVersion?: string;
}

export interface ImporterTelemetry {
  jobId?: string;
  source: string;
  sourceUrl?: string;
  retrievedAt: string;
  recordsFound: number;
  recordsAdded: number;
  recordsUpdated: number;
  duplicates: number;
  rejected: number;
  needsVerification: number;
  errors: string[];
  durationMs?: number;
  duplicateDetails?: Array<{
    name: string;
    existingId: string;
    existingName: string;
    reason: string;
  }>;
  addedDetails?: Array<{
    identifier: string;
    name: string;
    district: string;
  }>;
}
