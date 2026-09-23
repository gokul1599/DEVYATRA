/**
 * Source Freshness & Prioritization Engine (Phase 20)
 * 
 * Tracks provenance health, schedules reviews, and prioritizes gaps
 * across 917 official administrative districts without fabrication.
 */

export interface SourceHealthEntry {
  sourceType: "GOVERNMENT_ENDOWMENT" | "TEMPLE_BOARD" | "TOURISM_GIS" | "ASI_HERITAGE" | "COMMUNITY";
  sourceName: string;
  sourceDomain?: string;
  lastSyncDate: string;
  recordCount: number;
  healthStatus: "HEALTHY" | "REVIEW_DUE" | "STALE" | "DISCONTINUED";
  nextReviewDate: string;
}

export interface ExpansionQueueTarget {
  stateCode: string;
  stateName: string;
  districtId: string;
  districtName: string;
  currentTemples: number;
  currentVerified: number;
  priorityScore: number; // 0-100, higher means higher import priority
  recommendedSourceTypes: string[];
  justification: string;
}

export const MONITORED_SOURCES: SourceHealthEntry[] = [
  {
    sourceType: "GOVERNMENT_ENDOWMENT",
    sourceName: "Andhra Pradesh Endowments Department",
    sourceDomain: "apendowments.gov.in",
    lastSyncDate: "2026-03-20",
    recordCount: 142,
    healthStatus: "HEALTHY",
    nextReviewDate: "2026-06-20",
  },
  {
    sourceType: "GOVERNMENT_ENDOWMENT",
    sourceName: "Tamil Nadu HR & CE Department",
    sourceDomain: "hrce.tn.gov.in",
    lastSyncDate: "2026-03-18",
    recordCount: 386,
    healthStatus: "HEALTHY",
    nextReviewDate: "2026-06-18",
  },
  {
    sourceType: "TEMPLE_BOARD",
    sourceName: "Tirumala Tirupati Devasthanams (TTD)",
    sourceDomain: "tirupatibalaji.ap.gov.in",
    lastSyncDate: "2026-03-22",
    recordCount: 12,
    healthStatus: "HEALTHY",
    nextReviewDate: "2026-04-22",
  },
  {
    sourceType: "TEMPLE_BOARD",
    sourceName: "Shri Kashi Vishwanath Special Area Development Board",
    sourceDomain: "shrikashivishwanath.org",
    lastSyncDate: "2026-03-21",
    recordCount: 1,
    healthStatus: "HEALTHY",
    nextReviewDate: "2026-04-21",
  },
  {
    sourceType: "ASI_HERITAGE",
    sourceName: "Archaeological Survey of India (ASI) Monument Portal",
    sourceDomain: "asi.nic.in",
    lastSyncDate: "2026-02-15",
    recordCount: 420,
    healthStatus: "HEALTHY",
    nextReviewDate: "2026-05-15",
  },
  {
    sourceType: "TOURISM_GIS",
    sourceName: "Karnataka Tourism GIS & Muzrai Department",
    sourceDomain: "karnatakatourism.org",
    lastSyncDate: "2026-03-12",
    recordCount: 184,
    healthStatus: "HEALTHY",
    nextReviewDate: "2026-06-12",
  },
  {
    sourceType: "GOVERNMENT_ENDOWMENT",
    sourceName: "Kerala Devaswom Boards (Travancore & Malabar)",
    sourceDomain: "travancoredevaswomboard.org",
    lastSyncDate: "2026-03-10",
    recordCount: 198,
    healthStatus: "HEALTHY",
    nextReviewDate: "2026-06-10",
  },
];

export function prioritizeExpansionQueue(districtsWithTemples: {
  stateCode: string;
  stateName: string;
  districtId: string;
  districtName: string;
  templeCount: number;
  verifiedCount: number;
}[]): ExpansionQueueTarget[] {
  return districtsWithTemples
    .map((d) => {
      // Prioritize districts with 0 or low temple coverage to expand toward 917
      let priority = 0;
      let justification = "";

      if (d.templeCount === 0) {
        priority = 95;
        justification = "Unrepresented district in national sacred atlas";
      } else if (d.templeCount < 3) {
        priority = 75;
        justification = "Sparse coverage (<3 shrines recorded)";
      } else if (d.verifiedCount === 0) {
        priority = 60;
        justification = "Needs ground truth source verification";
      } else {
        priority = 35;
        justification = "Deepening secondary shrines & timings";
      }

      return {
        stateCode: d.stateCode,
        stateName: d.stateName,
        districtId: d.districtId,
        districtName: d.districtName,
        currentTemples: d.templeCount,
        currentVerified: d.verifiedCount,
        priorityScore: priority,
        recommendedSourceTypes: ["GOVERNMENT_ENDOWMENT", "ASI_HERITAGE", "TOURISM_GIS"],
        justification,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}
