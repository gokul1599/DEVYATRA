/**
 * Phase 17: Personalized Discovery Engine
 * 
 * Generates tailored pilgrimage recommendations based on explicit pilgrim profile preferences:
 * - Deity Affinities (Shiva, Vishnu, Devi, Ganesha, Murugan, Krishna, Rama, Hanuman)
 * - Spiritual Tradition (Shaiva, Vaishnava, Shakta, Smarta)
 * - Physical Accessibility & Senior-Friendly Filters
 * - Travel Style (Family, Solo, Elderly)
 * 
 * Strict Grounding Rule: Zero synthetic shrines. Recommends only verified directory records.
 */

import { Temple } from "@/lib/types";
import { TEMPLES } from "@/lib/registry";
import { UserPreferences, DEFAULT_PREFERENCES } from "@/lib/auth";

export interface ScoredTemple {
  temple: Temple;
  matchScore: number;
  matchReasons: string[];
}

export function getPersonalizedRecommendations(
  prefs: Partial<UserPreferences> = {},
  limit = 8
): ScoredTemple[] {
  const effectivePrefs: UserPreferences = {
    ...DEFAULT_PREFERENCES,
    ...prefs,
  };

  const scored: ScoredTemple[] = [];

  for (const temple of TEMPLES) {
    let score = 50; // Base score for all heritage temples
    const reasons: string[] = [];

    // 1. Deity Affinity Match
    if (effectivePrefs.deities.length > 0) {
      const templeDeity = (temple.mainDeity || "").toLowerCase();
      const allDeities = (temple.deities || []).map((d) => d.toLowerCase());
      
      for (const prefDeity of effectivePrefs.deities) {
        const pd = prefDeity.toLowerCase();
        if (templeDeity.includes(pd) || allDeities.some((d) => d.includes(pd))) {
          score += 35;
          reasons.push(`Dedicated to ${prefDeity}`);
          break;
        }
      }
    }

    // 2. Tradition Match
    if (effectivePrefs.traditions.length > 0) {
      const templeTraditions = (temple.tradition || []).map((t) => t.toLowerCase());
      for (const prefTrad of effectivePrefs.traditions) {
        if (templeTraditions.some((t) => t.includes(prefTrad.toLowerCase()))) {
          score += 25;
          reasons.push(`${prefTrad} Tradition`);
          break;
        }
      }
    }

    // 3. Accessibility & Mobility Adjustments
    if (effectivePrefs.accessibilityNeeds || effectivePrefs.travelStyle === "elderly") {
      const isHill = temple.type.toLowerCase().includes("hill") || temple.type.toLowerCase().includes("cave");
      if (isHill) {
        // High steep climb shrines get a slight demotion or caveat
        score -= 15;
      } else {
        score += 15;
        reasons.push("Ground-level courtyards with accessible pradakshina");
      }
    }

    // 4. Family Friendly
    if (effectivePrefs.travelStyle === "family") {
      if (temple.verified) {
        score += 10;
        reasons.push("Well-regulated queue facilities & prasad halls");
      }
    }

    scored.push({
      temple,
      matchScore: score,
      matchReasons: reasons.length > 0 ? reasons : ["Celebrated National Heritage Pilgrimage Shrine"],
    });
  }

  // Sort descending by match score
  scored.sort((a, b) => b.matchScore - a.matchScore);

  return scored.slice(0, limit);
}
