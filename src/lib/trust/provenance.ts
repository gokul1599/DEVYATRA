/**
 * DEVYATRA / TEMPLEORA — PHASE 25: TRUST, PROVENANCE & TEMPORAL INTELLIGENCE
 * 
 * Versioned, conflict-aware, source-traceable provenance engine for sacred temples.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 25A: FIELD-LEVEL VERSION HISTORY
// ─────────────────────────────────────────────────────────────────────────────

export interface TempleFieldHistory {
  id: string;
  templeId: string;
  fieldName: string;
  oldValue: unknown;
  newValue: unknown;
  sourceId: string;
  changedAt: string; // ISO 8601
  verifiedAt: string; // ISO 8601
  changedBy: string;
  verificationMethod: "STATUTORY_CROSS_CHECK" | "GOVERNMENT_CIRCULAR" | "ADMIN_AUDIT" | "SCRAPE_DELTA" | "COMMUNITY_REPORT";
  reason: string;
}

// In-memory or persistent store abstraction for field changes
const fieldHistoryStore: TempleFieldHistory[] = [];

export function recordFieldChange(params: Omit<TempleFieldHistory, "id" | "changedAt">): TempleFieldHistory {
  const historyEntry: TempleFieldHistory = {
    ...params,
    id: `tfh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    changedAt: new Date().toISOString(),
  };
  fieldHistoryStore.push(historyEntry);
  return historyEntry;
}

export function getFieldHistory(templeId: string, fieldName?: string): TempleFieldHistory[] {
  return fieldHistoryStore.filter((h) => h.templeId === templeId && (!fieldName || h.fieldName === fieldName));
}

export function rollbackFieldChange(historyId: string): { success: boolean; rolledBackTo: unknown; error?: string } {
  const entry = fieldHistoryStore.find((h) => h.id === historyId);
  if (!entry) {
    return { success: false, rolledBackTo: null, error: `History record ${historyId} not found` };
  }
  // Record reverse change
  recordFieldChange({
    templeId: entry.templeId,
    fieldName: entry.fieldName,
    oldValue: entry.newValue,
    newValue: entry.oldValue,
    sourceId: entry.sourceId,
    verifiedAt: new Date().toISOString(),
    changedBy: "SYSTEM_ROLLBACK",
    verificationMethod: "ADMIN_AUDIT",
    reason: `Rollback of revision ${historyId}: ${entry.reason}`,
  });

  return { success: true, rolledBackTo: entry.oldValue };
}

// ─────────────────────────────────────────────────────────────────────────────
// 25B: SOURCE CONFLICT ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export type SourceAuthorityTier =
  | "OFFICIAL_TEMPLE_AUTHORITY" // Tirumala Tirupati Devasthanams, Kashi Board, etc.
  | "GOVERNMENT_ENDOWMENT"     // HR&CE, State Endowments Dept
  | "OFFICIAL_TOURISM"         // Ministry of Tourism / State Tourism Corp
  | "ASI_HERITAGE_AUTHORITY"   // Archaeological Survey of India
  | "RELIABLE_SECONDARY"       // Academic, Gazettes, Encyclopedic Publications
  | "GOOGLE_DISCOVERY"         // Google Places API / Discovered Places
  | "COMMUNITY_USER";          // Pilgrim crowdsourced feedback

export const SOURCE_PRIORITY_HIERARCHY: Record<SourceAuthorityTier, number> = {
  OFFICIAL_TEMPLE_AUTHORITY: 100,
  GOVERNMENT_ENDOWMENT: 85,
  OFFICIAL_TOURISM: 70,
  ASI_HERITAGE_AUTHORITY: 65,
  RELIABLE_SECONDARY: 40,
  GOOGLE_DISCOVERY: 25,
  COMMUNITY_USER: 10,
};

export interface SourceClaim {
  sourceName: string;
  tier: SourceAuthorityTier;
  sourceUrl?: string;
  claimedValue: unknown;
  retrievedAt: string;
}

export interface SourceConflict {
  id: string;
  templeId: string;
  field: string;
  sourceA: SourceClaim;
  sourceB: SourceClaim;
  sourcePriority: SourceAuthorityTier;
  resolutionStatus: "RESOLVED_BY_HIERARCHY" | "NEEDS_MANUAL_REVIEW" | "MANUALLY_RESOLVED";
  resolvedValue: unknown;
  resolver: string;
  resolvedAt: string | null;
  resolutionRationale: string;
}

export function detectSourceConflict(
  templeId: string,
  field: string,
  claimA: SourceClaim,
  claimB: SourceClaim
): SourceConflict | null {
  // Normalize comparison
  const valA = JSON.stringify(claimA.claimedValue);
  const valB = JSON.stringify(claimB.claimedValue);

  if (valA === valB) {
    return null; // No conflict
  }

  const priorityA = SOURCE_PRIORITY_HIERARCHY[claimA.tier] || 0;
  const priorityB = SOURCE_PRIORITY_HIERARCHY[claimB.tier] || 0;

  let resolutionStatus: SourceConflict["resolutionStatus"] = "NEEDS_MANUAL_REVIEW";
  let resolvedValue: unknown = null;
  let rationale = "";
  let winnerTier: SourceAuthorityTier = claimA.tier;

  if (Math.abs(priorityA - priorityB) >= 20) {
    // Clear hierarchy difference
    if (priorityA > priorityB) {
      resolvedValue = claimA.claimedValue;
      winnerTier = claimA.tier;
      resolutionStatus = "RESOLVED_BY_HIERARCHY";
      rationale = `Source A (${claimA.sourceName}: ${claimA.tier}) supersedes Source B (${claimB.sourceName}: ${claimB.tier})`;
    } else {
      resolvedValue = claimB.claimedValue;
      winnerTier = claimB.tier;
      resolutionStatus = "RESOLVED_BY_HIERARCHY";
      rationale = `Source B (${claimB.sourceName}: ${claimB.tier}) supersedes Source A (${claimA.sourceName}: ${claimA.tier})`;
    }
  } else {
    resolutionStatus = "NEEDS_MANUAL_REVIEW";
    rationale = `Equal or close source tiers (${claimA.tier} vs ${claimB.tier}). Flagged for admin verification.`;
  }

  return {
    id: `sc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    templeId,
    field,
    sourceA: claimA,
    sourceB: claimB,
    sourcePriority: winnerTier,
    resolutionStatus,
    resolvedValue,
    resolver: resolutionStatus === "RESOLVED_BY_HIERARCHY" ? "AUTOMATED_HIERARCHY_ENGINE" : "PENDING_ADMIN",
    resolvedAt: resolutionStatus === "RESOLVED_BY_HIERARCHY" ? new Date().toISOString() : null,
    resolutionRationale: rationale,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 25C: TEMPORAL DATA MODEL
// ─────────────────────────────────────────────────────────────────────────────

export type TemporalCategory =
  | "REGULAR"           // Standard daily schedule
  | "SEASONAL"          // High-altitude mountain winter/summer opening
  | "FESTIVAL"          // Brahmotsavam, Mahashivratri, Navratri special darshan
  | "TEMPORARY"         // Renovation / Jeernodharana / solar eclipse closure
  | "SPECIAL_CLOSURE"   // VIP visit / administrative protocol closure
  | "EMERGENCY";        // Flood / landslide / weather emergency closure

export interface TemporalRecord {
  id: string;
  templeId: string;
  category: TemporalCategory;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  openingTime?: string; // HH:mm
  closingTime?: string; // HH:mm
  isOpen: boolean;
  darshanAvailable: boolean;
  specialRulesNote?: string;
  sourceAuthority: string;
  verifiedAt: string;
}

export function getEffectiveTimingForDate(
  records: TemporalRecord[],
  targetDateIso: string
): { activeRecord: TemporalRecord | null; isOperational: boolean; note: string } {
  const targetDate = targetDateIso.slice(0, 10);

  // Precedence order: EMERGENCY > SPECIAL_CLOSURE > TEMPORARY > FESTIVAL > SEASONAL > REGULAR
  const precedence: Record<TemporalCategory, number> = {
    EMERGENCY: 100,
    SPECIAL_CLOSURE: 80,
    TEMPORARY: 60,
    FESTIVAL: 40,
    SEASONAL: 20,
    REGULAR: 10,
  };

  const matchingRecords = records.filter(
    (r) => targetDate >= r.startDate && targetDate <= r.endDate
  );

  if (matchingRecords.length === 0) {
    return {
      activeRecord: null,
      isOperational: true,
      note: "No special temporal override. Standard verified temple schedule applies.",
    };
  }

  // Pick highest precedence record
  matchingRecords.sort((a, b) => (precedence[b.category] || 0) - (precedence[a.category] || 0));
  const active = matchingRecords[0];

  return {
    activeRecord: active,
    isOperational: active.isOpen,
    note: `[${active.category}] ${active.title}: ${active.specialRulesNote || "Special schedule active."}`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 25D: SOURCE FRESHNESS ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export type FreshnessStatus = "FRESH" | "AGING" | "STALE" | "EXPIRED" | "UNKNOWN";

export interface SourceFreshnessRecord {
  sourceName: string;
  field: string;
  lastVerifiedAt: string; // ISO 8601
  expectedRefreshDays: number;
  freshnessStatus: FreshnessStatus;
  daysSinceVerification: number;
}

export function evaluateSourceFreshness(
  lastVerifiedAt: string | null | undefined,
  expectedRefreshDays = 90
): { status: FreshnessStatus; daysElapsed: number } {
  if (!lastVerifiedAt) {
    return { status: "UNKNOWN", daysElapsed: -1 };
  }

  const verified = new Date(lastVerifiedAt).getTime();
  const now = Date.now();
  const diffDays = Math.floor((now - verified) / (1000 * 60 * 60 * 24));

  if (diffDays <= expectedRefreshDays * 0.5) {
    return { status: "FRESH", daysElapsed: diffDays };
  } else if (diffDays <= expectedRefreshDays) {
    return { status: "AGING", daysElapsed: diffDays };
  } else if (diffDays <= expectedRefreshDays * 1.5) {
    return { status: "STALE", daysElapsed: diffDays };
  } else {
    return { status: "EXPIRED", daysElapsed: diffDays };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 25E: TEMPLE COMPLEX MODEL
// ─────────────────────────────────────────────────────────────────────────────

export interface ComplexDeity {
  id: string;
  name: string;
  isMainDeity: boolean;
  significance?: string;
}

export interface ComplexShrine {
  id: string;
  name: string;
  complexId: string;
  shrineType: "MAIN_SANCTUM" | "SUBSIDIARY_SANCTUM" | "PARIVARA_DEVATA" | "MANDAPAM" | "SACRED_TANK";
  deities: ComplexDeity[];
  historicalPeriod?: string;
}

export interface TempleComplex {
  id: string;
  canonicalTempleId: string;
  complexName: string;
  state: string;
  district: string;
  shrines: ComplexShrine[];
  totalShrinesCount: number;
  sacredGhatsCount?: number;
}

export function buildTempleComplexGraph(
  complexName: string,
  canonicalTempleId: string,
  state: string,
  district: string,
  shrines: ComplexShrine[]
): TempleComplex {
  return {
    id: `cx_${canonicalTempleId}`,
    canonicalTempleId,
    complexName,
    state,
    district,
    shrines,
    totalShrinesCount: shrines.length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 25F: MEDIA PROVENANCE & COPYRIGHT RIGHTS
// ─────────────────────────────────────────────────────────────────────────────

export type MediaClassification =
  | "OFFICIAL"         // Released by Temple Trust / Devasthanam Press Office
  | "GOVERNMENT"       // Released by ASI / State Tourism under Open Data
  | "LICENSED"         // Commercial royalty-free / purchased editorial license
  | "PUBLIC_DOMAIN"    // CC0 / Wikimedia Commons Public Domain
  | "USER_SUBMITTED"   // Contributed by verified yatris under Devyatra CC BY 4.0
  | "UNKNOWN_RIGHTS";  // Unverified provenance — restricted from commercial / high-res use

export interface TempleMediaRecord {
  id: string;
  templeId: string;
  url: string;
  mediaType: "IMAGE" | "AUDIO_CHANT" | "FLOOR_PLAN" | "EPIGRAPH";
  source: string;
  creator?: string;
  license: string;
  copyright: string;
  attribution: string;
  commercialUse: boolean;
  usageAllowed: boolean;
  classification: MediaClassification;
  retrievedAt: string;
}

export function validateMediaUsage(media: TempleMediaRecord): {
  isPermitted: boolean;
  attributionRequired: boolean;
  warning?: string;
} {
  if (media.classification === "UNKNOWN_RIGHTS") {
    return {
      isPermitted: false,
      attributionRequired: true,
      warning: "Media rights are unverified. Public display requires rights verification.",
    };
  }

  const attributionRequired = media.classification !== "PUBLIC_DOMAIN";

  return {
    isPermitted: media.usageAllowed,
    attributionRequired,
    warning: media.commercialUse ? undefined : "Restricted to non-commercial educational/pilgrim display only.",
  };
}
