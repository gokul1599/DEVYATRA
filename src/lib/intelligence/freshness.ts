/**
 * Phase 15: Temple Data Freshness & Source Tracking Engine
 * 
 * Computes multidimensional freshness scores (0–100), tracks provenance tiers (A–D),
 * flags stale records (>90 days without re-verification), and handles community
 * correction workflows.
 */

import { Temple, SourceType, VerificationStatus } from "@/lib/types";

export type ProvenanceTier = "TIER_A" | "TIER_B" | "TIER_C" | "TIER_D";

export interface FreshnessScore {
  score: number; // 0 to 100
  tier: ProvenanceTier;
  tierLabel: string;
  sourceOrg: string;
  sourceType: SourceType;
  verificationStatus: VerificationStatus;
  lastVerifiedDate: Date;
  daysSinceVerification: number;
  freshnessLabel: string;
  isStale: boolean;
  badgeClass: string;
}

/**
 * Classifies the provenance tier based on the temple source authority.
 */
export function classifyProvenanceTier(org: string = "", sourceType: string = ""): {
  tier: ProvenanceTier;
  tierLabel: string;
  baseScore: number;
} {
  const o = org.toLowerCase();
  const st = sourceType.toLowerCase();

  // TIER A: Statutory Temple Trust / State Endowment / Devaswom Board / LGD
  if (
    o.includes("board") ||
    o.includes("trust") ||
    o.includes("devaswom") ||
    o.includes("hr&ce") ||
    o.includes("hrce") ||
    o.includes("muzrai") ||
    o.includes("devasthan") ||
    o.includes("sansthan") ||
    o.includes("administration") ||
    o.includes("lgd") ||
    st === "official" ||
    st === "government_endowment"
  ) {
    return {
      tier: "TIER_A",
      tierLabel: "Statutory Temple Trust / Endowment Board",
      baseScore: 100,
    };
  }

  // TIER B: State Tourism / Ministry of Culture / Archaeological Survey of India (ASI)
  if (
    o.includes("tourism") ||
    o.includes("asi") ||
    o.includes("archaeological") ||
    o.includes("ministry") ||
    o.includes("culture") ||
    st === "government" ||
    st === "state_tourism"
  ) {
    return {
      tier: "TIER_B",
      tierLabel: "State Tourism / Archaeological Survey (ASI)",
      baseScore: 85,
    };
  }

  // TIER C: Field Survey / District Gazetteer / Academic Gazette
  if (
    o.includes("gazetteer") ||
    o.includes("census") ||
    o.includes("survey") ||
    o.includes("curated") ||
    st === "trusted"
  ) {
    return {
      tier: "TIER_C",
      tierLabel: "Official Gazetteer / Field Cadastral Survey",
      baseScore: 75,
    };
  }

  // TIER D: Community Reported / Web Discovered
  return {
    tier: "TIER_D",
    tierLabel: "Community Reported / Pending Field Verification",
    baseScore: 50,
  };
}

/**
 * Calculates a comprehensive freshness score (0 to 100) combining provenance authority and temporal age.
 */
export function calculateFreshnessScore(temple: Temple, now: Date = new Date()): FreshnessScore {
  const sourceOrg = temple.source?.org || temple.booking?.bookingOrg || "State Endowment Gazetteer";
  const sourceType = (temple.source?.type || "government") as SourceType;
  const verificationStatus = (temple.source?.status || temple.booking?.verification?.status || "GOVERNMENT_SOURCE") as VerificationStatus;

  // Determine last verified date
  let lastVerifiedDate: Date;
  if (temple.source?.lastVerified) {
    lastVerifiedDate = new Date(temple.source.lastVerified);
  } else {
    // Default to recent Phase 14 / Phase 13 verification baseline
    lastVerifiedDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  }

  if (isNaN(lastVerifiedDate.getTime())) {
    lastVerifiedDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const diffMs = now.getTime() - lastVerifiedDate.getTime();
  const daysSinceVerification = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  const { tier, tierLabel, baseScore } = classifyProvenanceTier(sourceOrg, sourceType);

  // Apply decay factor based on days passed
  let decayFactor = 1.0;
  let freshnessLabel = "Verified recently";

  if (daysSinceVerification <= 30) {
    decayFactor = 1.0;
    freshnessLabel = `Verified ${daysSinceVerification === 0 ? "today" : `${daysSinceVerification} days ago`}`;
  } else if (daysSinceVerification <= 90) {
    decayFactor = 0.85;
    freshnessLabel = `Verified ${Math.floor(daysSinceVerification / 30)} months ago`;
  } else if (daysSinceVerification <= 180) {
    decayFactor = 0.65;
    freshnessLabel = `Verified ${Math.floor(daysSinceVerification / 30)} months ago · Verification due`;
  } else {
    decayFactor = 0.40;
    freshnessLabel = "Data unverified for >6 months · Stale notice";
  }

  const isStale = daysSinceVerification > 90 || verificationStatus === "UNVERIFIED";
  const rawScore = Math.round(baseScore * decayFactor);
  const score = Math.min(100, Math.max(15, rawScore));

  let badgeClass = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (score < 50) {
    badgeClass = "bg-terracotta/15 text-[#e08568] border-terracotta/30";
  } else if (score < 75) {
    badgeClass = "bg-amber-500/15 text-amber-400 border-amber-500/30";
  } else if (score < 90) {
    badgeClass = "bg-sky-500/15 text-sky-400 border-sky-500/30";
  }

  return {
    score,
    tier,
    tierLabel,
    sourceOrg,
    sourceType,
    verificationStatus,
    lastVerifiedDate,
    daysSinceVerification,
    freshnessLabel,
    isStale,
    badgeClass,
  };
}
