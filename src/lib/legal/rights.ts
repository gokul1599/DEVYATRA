/**
 * DEVYATRA / TEMPLEORA — PHASE 29: DATA RIGHTS, MEDIA RIGHTS & DISASTER RECOVERY DRILLS
 * 
 * Statutory source rights registry, media licensing ledgers, and automated DR drill logging.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 29B: DATA & STATUTORY SOURCE RIGHTS REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export type DataUsageRights =
  | "OPEN_GOVERNMENT_DATA"   // OGD India / Creative Commons Attribution
  | "STATUTORY_PUBLIC_NOTICE" // Temple circulars, Gazettes, High Court judgments
  | "COMMERCIAL_API_LICENSE" // Licensed commercial API (e.g. Google Places)
  | "RESTRICTED_ACADEMIC"    // Epigraphia Indica / Archaeological Survey
  | "RIGHTS_UNKNOWN";        // Quarantined, permission not assumed

export interface SourceRightsRecord {
  sourceKey: string;
  sourceName: string;
  ownerOrg: string;
  license: string;
  usageRights: DataUsageRights;
  commercialUseAllowed: boolean;
  attributionRequired: boolean;
  storageAllowed: boolean;
  derivedDataAllowed: boolean;
  lastReviewed: string; // ISO 8601
  notes: string;
}

export const SOURCE_RIGHTS_REGISTRY: Record<string, SourceRightsRecord> = {
  asi_monuments: {
    sourceKey: "asi_monuments",
    sourceName: "Archaeological Survey of India National Monument Register",
    ownerOrg: "Ministry of Culture, Government of India",
    license: "National Open Data License (India)",
    usageRights: "OPEN_GOVERNMENT_DATA",
    commercialUseAllowed: true,
    attributionRequired: true,
    storageAllowed: true,
    derivedDataAllowed: true,
    lastReviewed: "2026-09-01T00:00:00Z",
    notes: "Public heritage register of nationally protected monuments and surveyed coordinates.",
  },
  ttd_official: {
    sourceKey: "ttd_official",
    sourceName: "Tirumala Tirupati Devasthanams Official Portal",
    ownerOrg: "TTD Board / Government of Andhra Pradesh",
    license: "Statutory Devasthanam Public Notice",
    usageRights: "STATUTORY_PUBLIC_NOTICE",
    commercialUseAllowed: false,
    attributionRequired: true,
    storageAllowed: true,
    derivedDataAllowed: false,
    lastReviewed: "2026-09-10T00:00:00Z",
    notes: "Direct booking links and official seva schedules published for public pilgrim access.",
  },
  smvdsb_official: {
    sourceKey: "smvdsb_official",
    sourceName: "Shri Mata Vaishno Devi Shrine Board",
    ownerOrg: "SMVDSB Statutory Shrine Board",
    license: "Statutory Shrine Board Public Notice",
    usageRights: "STATUTORY_PUBLIC_NOTICE",
    commercialUseAllowed: false,
    attributionRequired: true,
    storageAllowed: true,
    derivedDataAllowed: false,
    lastReviewed: "2026-09-10T00:00:00Z",
    notes: "Yatra registration guidelines and darshan helicopter slot notices.",
  },
  google_places_api: {
    sourceKey: "google_places_api",
    sourceName: "Google Places API (New)",
    ownerOrg: "Google LLC",
    license: "Google Maps Platform Terms of Service",
    usageRights: "COMMERCIAL_API_LICENSE",
    commercialUseAllowed: true,
    attributionRequired: true,
    storageAllowed: false, // Places cache restrictions apply per ToS
    derivedDataAllowed: false,
    lastReviewed: "2026-08-15T00:00:00Z",
    notes: "Requires Google logo attribution and prohibits permanent caching beyond 30-day refresh.",
  },
};

export function lookupSourceRights(sourceKey: string): SourceRightsRecord {
  if (SOURCE_RIGHTS_REGISTRY[sourceKey]) {
    return SOURCE_RIGHTS_REGISTRY[sourceKey];
  }
  return {
    sourceKey,
    sourceName: "Unregistered External Source",
    ownerOrg: "Unknown Entity",
    license: "Unspecified",
    usageRights: "RIGHTS_UNKNOWN",
    commercialUseAllowed: false,
    attributionRequired: true,
    storageAllowed: false,
    derivedDataAllowed: false,
    lastReviewed: new Date().toISOString(),
    notes: "Rights are unverified. Data must be quarantined from production display without approval.",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 29H: DISASTER RECOVERY DRILL RECORDER
// ─────────────────────────────────────────────────────────────────────────────

export interface DisasterRecoveryDrillLog {
  id: string;
  drillName: string;
  drillType: "SIMULATED_DATA_CORRUPTION" | "PITR_BRANCH_RESTORE" | "COLD_SNAPSHOT_RECOVERY";
  restoreStarted: string; // ISO 8601
  restoreCompleted: string; // ISO 8601
  durationSeconds: number;
  recordsRestored: number;
  expectedRecords: number;
  checksumMatches: boolean;
  status: "DRILL_PASSED" | "DRILL_FAILED";
  conductedBy: string;
  findings: string[];
}

const drillAuditStore: DisasterRecoveryDrillLog[] = [];

export function recordDisasterRecoveryDrill(params: Omit<DisasterRecoveryDrillLog, "id">): DisasterRecoveryDrillLog {
  const drill: DisasterRecoveryDrillLog = {
    ...params,
    id: `dr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  };
  drillAuditStore.push(drill);
  return drill;
}

export function getDisasterRecoveryDrills(): DisasterRecoveryDrillLog[] {
  return [...drillAuditStore];
}
