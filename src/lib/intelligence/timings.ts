/**
 * Phase 15: Temple Timings Engine
 * 
 * Provides real-time India Standard Time (IST / Asia/Kolkata) darshan timing calculations,
 * aarti / pooja schedules, break intervals, seasonal variation support, and granular status
 * indicators (OPEN_NOW, CLOSING_SOON, AFTERNOON_BREAK, AARTI_IN_PROGRESS, CLOSED, SEASONAL).
 */

import { Temple, TimingSlot } from "@/lib/types";
import { toIndia } from "@/lib/format";

export type LiveTimingState =
  | "OPEN_NOW"
  | "CLOSING_SOON"
  | "AFTERNOON_BREAK"
  | "AARTI_IN_PROGRESS"
  | "CLOSED"
  | "SEASONAL"
  | "UNKNOWN";

export interface AartiSlot {
  name: string;
  time: string;
  description: string;
  isCurrent: boolean;
}

export interface LiveTimingInfo {
  state: LiveTimingState;
  label: string;
  detail: string;
  badgeClass: string;
  pulse: boolean;
  currentSlot: TimingSlot | null;
  nextSlot: { label: string; time: string } | null;
  minutesUntilClosing: number | null;
  minutesUntilOpening: number | null;
  aartis: AartiSlot[];
  darshanSlots: { label: string; opening: string; closing: string }[];
  isIstConfirmed: boolean;
  currentTimeIst: string;
  seasonalNotice?: string;
}

const toMinutes = (hhmm?: string): number | null => {
  if (!hhmm) return null;
  const parts = hhmm.trim().split(":");
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
};

const formatTimeFromMinutes = (min: number): string => {
  const norm = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
};

/**
 * Standard Aarti schedules for major temple traditions if not explicitly recorded in slots.
 */
export const STANDARD_AARTIS: Record<string, { name: string; time: string; desc: string }[]> = {
  Shaiva: [
    { name: "Mangala Aarti", time: "05:30", desc: "First morning awakening & abhisheka ritual" },
    { name: "Bhog Aarti", time: "12:00", desc: "Midday consecrated food offering" },
    { name: "Sandhya Aarti", time: "18:30", desc: "Twilight lamp ritual with sacred incantations" },
    { name: "Shayan Aarti", time: "21:00", desc: "Night resting ceremony for the sanctum sanctorum" },
  ],
  Vaishnava: [
    { name: "Suprabhatam / Mangala", time: "05:00", desc: "Dawn awakening hymnal recitation" },
    { name: "Rajabhoga Aradhana", time: "11:30", desc: "Royal noon offering and alankara darshan" },
    { name: "Sayarakshai / Sandhya Deepam", time: "18:45", desc: "Evening lamp offering" },
    { name: "Ekanta Seva / Shayanotsava", time: "21:30", desc: "Night lullaby and sanctum retirement" },
  ],
  Shakta: [
    { name: "Prabhat Aarti", time: "06:00", desc: "Morning divine mother alankara" },
    { name: "Madhyanha Puja", time: "12:30", desc: "Midday divine offering and kumkuma archana" },
    { name: "Sandhya Mahapuja", time: "19:00", desc: "Evening deeparadhana with Vedic chanting" },
    { name: "Ratrikalin Aarti", time: "21:15", desc: "Night closing ritual" },
  ],
  Default: [
    { name: "Mangala Aarti", time: "06:00", desc: "Morning invocation prayer" },
    { name: "Madhyahna Aarti", time: "12:00", desc: "Midday offering" },
    { name: "Sandhya Aarti", time: "18:30", desc: "Evening lamp ceremony" },
    { name: "Shayan Aarti", time: "21:00", desc: "Night closing ceremony" },
  ],
};

/**
 * Checks whether a Himalayan / Seasonal temple is closed for winter/monsoon.
 */
export function getSeasonalNotice(temple: Temple, nowIst: Date): string | null {
  const month = nowIst.getUTCMonth(); // 0 = Jan, 11 = Dec
  const nameLower = temple.name.toLowerCase();
  const slugLower = temple.slug.toLowerCase();

  // Char Dham winter closure (Nov to April/May)
  if (
    slugLower.includes("kedarnath") ||
    slugLower.includes("badrinath") ||
    slugLower.includes("gangotri") ||
    slugLower.includes("yamunotri") ||
    nameLower.includes("kedarnath") ||
    nameLower.includes("badrinath")
  ) {
    if (month >= 10 || month <= 3) {
      // Nov, Dec, Jan, Feb, Mar, Apr
      return "Winter Portal Closure: The sanctum is closed for winter. The deity resides at Ukhimath / Joshimath for winter darshan.";
    }
  }

  // Amarnath Yatra (Only July - August)
  if (slugLower.includes("amarnath") || nameLower.includes("amarnath")) {
    if (month < 6 || month > 7) {
      return "Seasonal Shrine: Accessible only during the annual Shravan Amarnath Yatra (July–August).";
    }
  }

  // Sabarimala (Mandala-Makaravilakku season Nov-Jan, plus first 5 days of Malayalam months)
  if (slugLower.includes("sabarimala") || nameLower.includes("sabarimala")) {
    if (month >= 10 || month === 0) {
      return "Mandala-Makaravilakku Pilgrimage Season active. Strict Virtual-Q booking mandatory.";
    }
  }

  return null;
}

/**
 * Computes live temple timing intelligence from recorded timing slots and IST clock.
 */
export function getLiveTempleTiming(temple: Temple, targetDate: Date = new Date()): LiveTimingInfo {
  const ist = toIndia(targetDate);
  const nowMin = ist.h * 60 + ist.m;
  const currentTimeIst = `${String(ist.h).padStart(2, "0")}:${String(ist.m).padStart(2, "0")} IST`;

  const seasonalNotice = getSeasonalNotice(temple, ist.date);
  if (seasonalNotice) {
    return {
      state: "SEASONAL",
      label: "Seasonal Closure",
      detail: seasonalNotice,
      badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      pulse: false,
      currentSlot: null,
      nextSlot: null,
      minutesUntilClosing: null,
      minutesUntilOpening: null,
      aartis: [],
      darshanSlots: [],
      isIstConfirmed: true,
      currentTimeIst,
      seasonalNotice,
    };
  }

  const timingSchedule = temple.timings;
  if (!timingSchedule || !timingSchedule.slots || timingSchedule.slots.length === 0) {
    // Default daytime estimation for source-backed historical shrines without explicit schedules
    return {
      state: "UNKNOWN",
      label: "Timings Not Indexed",
      detail: "Timings not verified directly with temple administration. Check official notice board.",
      badgeClass: "bg-zinc-500/15 text-zinc-400 border-zinc-600/30",
      pulse: false,
      currentSlot: null,
      nextSlot: null,
      minutesUntilClosing: null,
      minutesUntilOpening: null,
      aartis: [],
      darshanSlots: [],
      isIstConfirmed: true,
      currentTimeIst,
    };
  }

  // Parse all slots
  const parsedSlots: Array<{
    slot: TimingSlot;
    start: number;
    end: number;
    isAarti: boolean;
  }> = [];

  for (const s of timingSchedule.slots) {
    const start = toMinutes(s.opening);
    const end = toMinutes(s.closing);
    if (start !== null && end !== null) {
      const isAarti =
        s.label.toLowerCase().includes("aarti") ||
        s.label.toLowerCase().includes("arati") ||
        s.label.toLowerCase().includes("pooja") ||
        s.label.toLowerCase().includes("puja") ||
        s.label.toLowerCase().includes("abhisheka") ||
        s.label.toLowerCase().includes("deeparadhana");

      parsedSlots.push({ slot: s, start, end, isAarti });
    }
  }

  // Sort chronologically by start time
  parsedSlots.sort((a, b) => a.start - b.start);

  // Extract Aarti and Darshan schedules
  const traditionKey = temple.tradition[0] || "Default";
  const aartiList = STANDARD_AARTIS[traditionKey] || STANDARD_AARTIS.Default;

  const aartis: AartiSlot[] = aartiList.map((a) => {
    const aMin = toMinutes(a.time) || 0;
    // Aarti is current if within 30 min window
    const isCurrent = nowMin >= aMin && nowMin < aMin + 30;
    return {
      name: a.name,
      time: formatTimeFromMinutes(aMin),
      description: a.desc,
      isCurrent,
    };
  });

  const darshanSlots = parsedSlots
    .filter((p) => !p.isAarti)
    .map((p) => ({
      label: p.slot.label,
      opening: formatTimeFromMinutes(p.start),
      closing: formatTimeFromMinutes(p.end),
    }));

  // Check if currently inside an active Aarti
  const activeAarti = parsedSlots.find(
    (p) => p.isAarti && nowMin >= p.start && nowMin < p.end
  );
  if (activeAarti) {
    const minLeft = activeAarti.end - nowMin;
    return {
      state: "AARTI_IN_PROGRESS",
      label: "Aarti in Progress",
      detail: `${activeAarti.slot.label} underway (${minLeft} mins remaining)`,
      badgeClass: "bg-purple-500/15 text-purple-400 border-purple-500/30",
      pulse: true,
      currentSlot: activeAarti.slot,
      nextSlot: null,
      minutesUntilClosing: minLeft,
      minutesUntilOpening: null,
      aartis,
      darshanSlots,
      isIstConfirmed: true,
      currentTimeIst,
    };
  }

  // Check active Darshan slots
  const activeDarshan = parsedSlots.find(
    (p) => !p.isAarti && nowMin >= p.start && nowMin < p.end
  );

  if (activeDarshan) {
    const minLeft = activeDarshan.end - nowMin;
    if (minLeft <= 45) {
      return {
        state: "CLOSING_SOON",
        label: "Closing Soon",
        detail: `Sanctum closes in ${minLeft} minutes (${formatTimeFromMinutes(activeDarshan.end)})`,
        badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        pulse: true,
        currentSlot: activeDarshan.slot,
        nextSlot: null,
        minutesUntilClosing: minLeft,
        minutesUntilOpening: null,
        aartis,
        darshanSlots,
        isIstConfirmed: true,
        currentTimeIst,
      };
    }

    return {
      state: "OPEN_NOW",
      label: "Open Now",
      detail: `Open for Darshan until ${formatTimeFromMinutes(activeDarshan.end)}`,
      badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      pulse: true,
      currentSlot: activeDarshan.slot,
      nextSlot: null,
      minutesUntilClosing: minLeft,
      minutesUntilOpening: null,
      aartis,
      darshanSlots,
      isIstConfirmed: true,
      currentTimeIst,
    };
  }

  // Not in an open slot: check if in afternoon break between slots
  const upcomingToday = parsedSlots.filter((p) => !p.isAarti && p.start > nowMin);
  if (upcomingToday.length > 0) {
    const next = upcomingToday[0];
    const minToOpen = next.start - nowMin;
    const isMidday = nowMin >= 720 && nowMin <= 960; // 12:00 PM to 4:00 PM

    if (isMidday) {
      return {
        state: "AFTERNOON_BREAK",
        label: "Afternoon Break",
        detail: `Temple closed for afternoon rest. Reopens at ${formatTimeFromMinutes(next.start)} (${minToOpen} mins)`,
        badgeClass: "bg-sky-500/15 text-sky-400 border-sky-500/30",
        pulse: false,
        currentSlot: null,
        nextSlot: { label: next.slot.label, time: formatTimeFromMinutes(next.start) },
        minutesUntilClosing: null,
        minutesUntilOpening: minToOpen,
        aartis,
        darshanSlots,
        isIstConfirmed: true,
        currentTimeIst,
      };
    }

    return {
      state: "CLOSED",
      label: "Closed Now",
      detail: `Closed now · Reopens today at ${formatTimeFromMinutes(next.start)}`,
      badgeClass: "bg-terracotta/15 text-[#e08568] border-terracotta/30",
      pulse: false,
      currentSlot: null,
      nextSlot: { label: next.slot.label, time: formatTimeFromMinutes(next.start) },
      minutesUntilClosing: null,
      minutesUntilOpening: minToOpen,
      aartis,
      darshanSlots,
      isIstConfirmed: true,
      currentTimeIst,
    };
  }

  // All slots today have ended: Closed until tomorrow morning
  const firstTomorrow = parsedSlots.find((p) => !p.isAarti) || parsedSlots[0];
  const minUntilTomorrowOpen = (1440 - nowMin) + (firstTomorrow ? firstTomorrow.start : 360);

  return {
    state: "CLOSED",
    label: "Closed for the Day",
    detail: firstTomorrow
      ? `Closed for the night · Opens tomorrow at ${formatTimeFromMinutes(firstTomorrow.start)}`
      : "Closed for the night",
    badgeClass: "bg-zinc-500/15 text-zinc-400 border-zinc-600/30",
    pulse: false,
    currentSlot: null,
    nextSlot: firstTomorrow ? { label: firstTomorrow.slot.label, time: formatTimeFromMinutes(firstTomorrow.start) } : null,
    minutesUntilClosing: null,
    minutesUntilOpening: minUntilTomorrowOpen,
    aartis,
    darshanSlots,
    isIstConfirmed: true,
    currentTimeIst,
  };
}
