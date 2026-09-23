/**
 * Phase 17: Holy Alerts & Followed Temple Intelligence
 * 
 * Computes verified, real-world alerts for temples followed by the pilgrim:
 * 1. Upcoming major festivals & utsavams (derived from Phase 15 Hindu Panchang).
 * 2. Seasonal portal closures (Garhwal Himalayan winter shifts to lower seats).
 * 3. Mandatory online token / registration advisories (TTD, Vaishno Devi, Sabarimala).
 * 
 * Strict Grounding Rule: Zero fabricated or synthetic alerts.
 */

import { getTemple, TEMPLES } from "@/lib/registry";
import { getTempleFestivalsIntelligence } from "./festivals";
import { getBookingIntelligence } from "./bookings";
import { getLiveTempleTiming } from "./timings";

export interface TempleAlert {
  id: string;
  templeSlug: string;
  templeName: string;
  type: "FESTIVAL_UPCOMING" | "SEASONAL_CLOSURE" | "BOOKING_MANDATORY" | "TIMING_UPDATE";
  title: string;
  message: string;
  severity: "info" | "warning" | "urgent";
  effectiveDate?: string;
  actionUrl?: string;
  source: string;
}

export function getFollowedTempleAlerts(slugs: string[]): TempleAlert[] {
  const alerts: TempleAlert[] = [];

  for (const slug of slugs) {
    const temple = getTemple(slug) || TEMPLES.find((t) => t.slug === slug);
    if (!temple) continue;

    // 1. Check for upcoming major festivals within 45 days
    const festivals = getTempleFestivalsIntelligence(temple);
    for (const fest of festivals) {
      if (fest.countdownDays <= 45) {
        alerts.push({
          id: `alert-fest-${temple.slug}-${fest.id}`,
          templeSlug: temple.slug,
          templeName: temple.name,
          type: "FESTIVAL_UPCOMING",
          title: `${fest.name} · ${fest.countdownText}`,
          message: `${fest.name} is approaching. Expected crowd density is ${fest.crowdLevel} with queue wait times of ${fest.expectedWaitTime}. Plan your visit and book accommodation early.`,
          severity: fest.crowdLevel === "EXTREME" ? "urgent" : "warning",
          effectiveDate: fest.nextDate.toISOString().split("T")[0],
          source: "Astronomical Hindu Panchang & Festival Intelligence",
        });
      }
    }

    // 2. Check for seasonal winter closures (Himalayan shrines)
    const timing = getLiveTempleTiming(temple);
    if (timing.state === "SEASONAL" || temple.stateCode === "UT" || temple.stateCode === "UK" || temple.district.toLowerCase().includes("chamoli") || temple.district.toLowerCase().includes("rudraprayag")) {
      if (timing.state === "SEASONAL") {
        alerts.push({
          id: `alert-season-${temple.slug}`,
          templeSlug: temple.slug,
          templeName: temple.name,
          type: "SEASONAL_CLOSURE",
          title: "Winter Portal Closure (Kapat Bandh)",
          message: `Sanctum portals are currently closed for the Himalayan winter season. Traditional daily pujas continue at the winter deity seat.`,
          severity: "warning",
          source: "Shri Badrinath-Kedarnath Temple Committee (BKTC)",
        });
      }
    }

    // 3. Check for mandatory online booking
    const booking = getBookingIntelligence(temple);
    if (booking.modality === "ONLINE_MANDATORY") {
      alerts.push({
        id: `alert-booking-${temple.slug}`,
        templeSlug: temple.slug,
        templeName: temple.name,
        type: "BOOKING_MANDATORY",
        title: "Mandatory Online Registration Required",
        message: `Advance online registration or slot booking is compulsory for darshan. Physical on-spot tokens are strictly limited or discontinued.`,
        severity: "urgent",
        actionUrl: booking.officialPortal.url || undefined,
        source: booking.officialPortal.trustName,
      });
    }
  }

  return alerts;
}
