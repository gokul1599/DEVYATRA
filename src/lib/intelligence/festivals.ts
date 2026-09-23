/**
 * Phase 15: Live Festival & Hindu Panchang Calendar Engine
 * 
 * Provides live astronomical Hindu Panchang computations (Tithi, Paksha, Masa, Nakshatra),
 * upcoming major festival countdowns, dynamic crowd level prediction (Low, Moderate, High, Extreme),
 * estimated queue wait times, and special festival ritual schedules.
 */

import { Temple } from "@/lib/types";
import { festivalDate, toIndia } from "@/lib/format";

export type CrowdLevel = "LOW" | "MODERATE" | "HIGH" | "EXTREME";

export interface PanchangToday {
  tithi: string;
  paksha: "Shukla" | "Krishna";
  masa: string;
  nakshatra: string;
  samvat: number; // Vikram Samvat
  auspiciousRitualNote: string;
  isEkadashi: boolean;
  isPradosham: boolean;
  isPurnima: boolean;
  isAmavasya: boolean;
}

export interface FestivalIntelligence {
  id: string;
  name: string;
  templeId: string;
  dateLabel: string;
  nextDate: Date;
  countdownDays: number;
  countdownText: string;
  isToday: boolean;
  isUpcomingSoon: boolean; // within 14 days
  crowdLevel: CrowdLevel;
  crowdBadgeCls: string;
  expectedWaitTime: string;
  ritualHighlights: string[];
  description: string;
}

const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shasthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shasthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya",
];

const MASAS = [
  "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha",
  "Shravana", "Bhadrapada", "Ashvina", "Kartika",
  "Margashirsha", "Pushya", "Magha", "Phalguna",
];

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Svati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
  "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

/**
 * Computes today's Hindu Panchang based on IST solar-lunar synchronization.
 */
export function getTodayPanchang(targetDate: Date = new Date()): PanchangToday {
  const ist = toIndia(targetDate);
  const epoch = new Date(Date.UTC(2024, 0, 11, 11, 57)); // Known Amavasya base (Jan 11 2024)
  const diffDays = (ist.date.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24);
  const synodicMonth = 29.53058867; // Lunar month in days
  const lunarCyclePos = ((diffDays % synodicMonth) + synodicMonth) % synodicMonth;

  // Approximate Tithi index 0 to 29
  const tithiIndex = Math.min(29, Math.floor((lunarCyclePos / synodicMonth) * 30));
  const tithi = TITHI_NAMES[tithiIndex];
  const paksha: "Shukla" | "Krishna" = tithiIndex < 15 ? "Shukla" : "Krishna";

  // Approximate Masa (solar-lunar year calculation)
  const monthOfYear = ist.date.getUTCMonth();
  const masaIndex = (monthOfYear + 10) % 12; // Aligns Chaitra around March-April
  const masa = MASAS[masaIndex];

  // Approximate Nakshatra (Moon traverses 27 nakshatras in ~27.32 days)
  const siderealMonth = 27.321661;
  const siderealPos = ((diffDays % siderealMonth) + siderealMonth) % siderealMonth;
  const nakshatraIndex = Math.min(26, Math.floor((siderealPos / siderealMonth) * 27));
  const nakshatra = NAKSHATRAS[nakshatraIndex];

  // Vikram Samvat calculation
  const currentYear = ist.date.getUTCFullYear();
  const samvat = currentYear + 57;

  const isEkadashi = tithi === "Ekadashi";
  const isPradosham = tithi === "Trayodashi";
  const isPurnima = tithi === "Purnima";
  const isAmavasya = tithi === "Amavasya";

  let auspiciousRitualNote = "General daily worship & darshan.";
  if (isEkadashi) auspiciousRitualNote = "Hari Vasara (Ekadashi): Supreme day for Lord Vishnu worship & fasting.";
  else if (isPradosham) auspiciousRitualNote = "Pradosha Vratam: Highly auspicious twilight abhishekam for Lord Shiva.";
  else if (isPurnima) auspiciousRitualNote = "Pournami (Full Moon): Sacred Giri Pradakshina and Satyanarayan Puja day.";
  else if (isAmavasya) auspiciousRitualNote = "Amavasya (New Moon): Ancestral tarpanam and Hanuman / Kali worship.";

  return {
    tithi: `${paksha} Paksha ${tithi}`,
    paksha,
    masa,
    nakshatra,
    samvat,
    auspiciousRitualNote,
    isEkadashi,
    isPradosham,
    isPurnima,
    isAmavasya,
  };
}

/**
 * Predicts crowd density and queue waiting times for a given festival or auspicious day.
 */
export function estimateCrowdLevel(
  festivalName: string,
  temple: Temple,
  panchang: PanchangToday,
  isFestivalToday: boolean
): { crowdLevel: CrowdLevel; expectedWaitTime: string; badgeCls: string } {
  const fLower = festivalName.toLowerCase();
  const tTradition = (temple.tradition[0] || "").toLowerCase();
  const deity = (temple.mainDeity || "").toLowerCase();

  // EXTREME Crowd Level (Major annual landmark festival)
  const isMajorAnnual =
    fLower.includes("mahashivratri") ||
    fLower.includes("shivaratri") ||
    fLower.includes("brahmotsavam") ||
    fLower.includes("janmashtami") ||
    fLower.includes("vaikuntha ekadashi") ||
    fLower.includes("rath yatra") ||
    fLower.includes("navratri") ||
    fLower.includes("durga puja") ||
    fLower.includes("kumbh") ||
    fLower.includes("karthigai deepam");

  if (isFestivalToday && isMajorAnnual) {
    return {
      crowdLevel: "EXTREME",
      expectedWaitTime: "5 – 8+ Hours (Heavy Peak Footfall)",
      badgeCls: "bg-red-500/20 text-red-400 border-red-500/40",
    };
  }

  // HIGH Crowd Level (Auspicious tithi matching temple deity or festival week)
  const isDeityAuspiciousToday =
    (deity.includes("shiva") && (panchang.isPradosham || panchang.isPurnima)) ||
    (deity.includes("vishnu") && panchang.isEkadashi) ||
    (deity.includes("venkateswara") && panchang.isEkadashi) ||
    (deity.includes("hanuman") && panchang.isAmavasya) ||
    (tTradition.includes("shakta") && panchang.isPurnima);

  if (isFestivalToday || isDeityAuspiciousToday) {
    return {
      crowdLevel: "HIGH",
      expectedWaitTime: "2 – 3.5 Hours",
      badgeCls: "bg-orange-500/20 text-orange-400 border-orange-500/40",
    };
  }

  // MODERATE Crowd Level (Weekend or prominent temple)
  const dayOfWeek = new Date().getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 || dayOfWeek === 5; // Fri, Sat, Sun
  if (isWeekend) {
    return {
      crowdLevel: "MODERATE",
      expectedWaitTime: "45 – 90 Minutes",
      badgeCls: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    };
  }

  // LOW Crowd Level (Normal weekday non-peak)
  return {
    crowdLevel: "LOW",
    expectedWaitTime: "15 – 30 Minutes (Direct Darshan)",
    badgeCls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  };
}

/**
 * Returns complete live festival intelligence for a temple.
 */
export function getTempleFestivalsIntelligence(
  temple: Temple,
  targetDate: Date = new Date()
): FestivalIntelligence[] {
  const panchang = getTodayPanchang(targetDate);
  const now = toIndia(targetDate).date;
  const currentYear = now.getFullYear();

  return temple.festivals.map((f) => {
    let nextDate = festivalDate(f.month, f.day, currentYear);
    // If the nominal date has passed this year, point to next year
    if (nextDate < now && nextDate.toDateString() !== now.toDateString()) {
      nextDate = festivalDate(f.month, f.day, currentYear + 1);
    }

    const diffMs = nextDate.getTime() - now.getTime();
    const countdownDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const isToday = countdownDays === 0 || nextDate.toDateString() === now.toDateString();
    const isUpcomingSoon = countdownDays <= 14;

    let countdownText = `In ${countdownDays} days`;
    if (isToday) countdownText = "TODAY · Rituals Active";
    else if (countdownDays === 1) countdownText = "Tomorrow";

    const crowd = estimateCrowdLevel(f.name, temple, panchang, isToday);

    const ritualHighlights: string[] = [];
    if (f.specialDarshan) ritualHighlights.push("Special extended darshan line open");
    if (f.name.toLowerCase().includes("brahmotsavam")) ritualHighlights.push("Garuda Vahana & Ratha Procession");
    if (f.name.toLowerCase().includes("shivaratri")) ritualHighlights.push("All-night 4-kala Maha Abhishekam");
    if (f.name.toLowerCase().includes("janmashtami")) ritualHighlights.push("Midnight Krishna Janmotsav Aarti");
    if (f.name.toLowerCase().includes("rath")) ritualHighlights.push("Grand Chariot Pulling along Bada Danda");
    if (ritualHighlights.length === 0) ritualHighlights.push("Special temple flower alankaram & mahaprasadam distribution");

    return {
      id: f.id,
      name: f.name,
      templeId: f.templeId,
      dateLabel: f.dateLabel,
      nextDate,
      countdownDays,
      countdownText,
      isToday,
      isUpcomingSoon,
      crowdLevel: crowd.crowdLevel,
      crowdBadgeCls: crowd.badgeCls,
      expectedWaitTime: crowd.expectedWaitTime,
      ritualHighlights,
      description: f.description,
    };
  });
}
