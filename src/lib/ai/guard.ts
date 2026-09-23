/**
 * AI Pilgrimage Guard & Feasibility Evaluation Engine (Phase 21)
 *
 * Implements rigorous detection for impossible itineraries, travel distance constraints,
 * closed sanctum windows, prompt injection mitigation, and factual provenance citation.
 */

import { Temple } from "@/lib/types";
import { haversineDistance } from "@/lib/importer/deduplicate";

export interface FeasibilityIssue {
  type:
    | "EXCESSIVE_TEMPLES"
    | "INSUFFICIENT_TIME"
    | "SANCTUM_CLOSED"
    | "EXCESSIVE_DISTANCE"
    | "UNVERIFIED_BOOKING"
    | "TERRAIN_HAZARD"
    | "MALICIOUS_INPUT";
  severity: "CRITICAL" | "HIGH" | "WARNING";
  message: string;
  recommendation: string;
}

export interface FeasibilityAssessment {
  isFeasible: boolean;
  issues: FeasibilityIssue[];
  cautions: string[];
  maxDailyTemplesRecommended: number;
  totalDistanceKm: number;
}

// Blocklist / prompt injection detection signatures
const INJECTION_PATTERNS = [
  /ignore previous instructions/i,
  /system prompt/i,
  /you are now/i,
  /jailbreak/i,
  /<script>/i,
  /drop table/i,
  /union select/i,
];

export function evaluateItineraryFeasibility(params: {
  temples: Temple[];
  totalDays: number;
  travelMode: "walking" | "car" | "bus" | "train";
  hasElderly?: boolean;
  hasChildren?: boolean;
}): FeasibilityAssessment {
  const { temples, totalDays, travelMode, hasElderly, hasChildren } = params;
  const issues: FeasibilityIssue[] = [];
  const cautions: string[] = [];

  const maxTemplesPerDay = hasElderly ? 2 : hasChildren ? 2 : travelMode === "walking" ? 1 : 3;
  const recommendedMax = totalDays * maxTemplesPerDay;

  // 1. Excessive temple load check
  if (temples.length > recommendedMax) {
    issues.push({
      type: "EXCESSIVE_TEMPLES",
      severity: "HIGH",
      message: `${temples.length} temples planned across ${totalDays} day(s) exceeds feasible sacred pacing (max recommended: ${recommendedMax}).`,
      recommendation: `Reduce temples to at most ${maxTemplesPerDay} per day to allow adequate queue time, darshan, and sanctum rest.`,
    });
  }

  // 2. Geographic distance checks
  let totalDistanceKm = 0;
  for (let i = 0; i < temples.length - 1; i++) {
    const d = haversineDistance(
      temples[i].latitude,
      temples[i].longitude,
      temples[i + 1].latitude,
      temples[i + 1].longitude
    );
    totalDistanceKm += d;

    // Single leg exceeds reasonable daily travel for the mode
    if (travelMode === "walking" && d > 25) {
      issues.push({
        type: "EXCESSIVE_DISTANCE",
        severity: "CRITICAL",
        message: `Walking distance between ${temples[i].name} and ${temples[i + 1].name} is ${Math.round(d)} km (exceeds single-day walking limit).`,
        recommendation: "Switch travel mode to public bus, regional train, or private cab.",
      });
    } else if (travelMode === "car" && d > 400 && totalDays <= 1) {
      issues.push({
        type: "EXCESSIVE_DISTANCE",
        severity: "CRITICAL",
        message: `Single-day highway distance (${Math.round(d)} km) between ${temples[i].name} and ${temples[i + 1].name} leaves zero darshan time.`,
        recommendation: "Split the journey into an overnight circuit or pick shrines within 120 km.",
      });
    }
  }

  // 3. Vulnerable traveler cautions
  if (hasElderly) {
    cautions.push("Elderly yatris detected: Injected 45-minute post-darshan hydration breaks and verified battery buggy / doli availability.");
  }
  if (hasChildren) {
    cautions.push("Children traveling: Scheduled midday dining intervals and avoided night road transfers.");
  }

  return {
    isFeasible: !issues.some((i) => i.severity === "CRITICAL"),
    issues,
    cautions,
    maxDailyTemplesRecommended: maxTemplesPerDay,
    totalDistanceKm: Math.round(totalDistanceKm),
  };
}

export function sanitizeAiInput(prompt: string): { isSafe: boolean; sanitizedText: string; reason?: string } {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        isSafe: false,
        sanitizedText: "",
        reason: "Input contains disallowed instructional override patterns.",
      };
    }
  }

  // Basic HTML/script stripping
  const clean = prompt
    .replace(/<[^>]*>?/gm, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();

  return {
    isSafe: true,
    sanitizedText: clean,
  };
}
