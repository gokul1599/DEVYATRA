import { Temple, TimingSlot, VerificationStatus } from "./types";

const toMin = (hhmm?: string): number | undefined => {
  if (!hhmm) return undefined;
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h)) return undefined;
  return h * 60 + (Number.isNaN(m) ? 0 : m);
};

export const minutesToHHMM = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export interface OpenStatus {
  state: "open" | "closed" | "unknown" | "seasonal";
  reason?: string;
}

/** Best-effort open/closed for "today" using the recorded timing slots. */
export function statusFor(temple: Temple, now: Date = new Date()): OpenStatus {
  const s = temple.timings;
  if (!s || s.slots.length === 0) return { state: "unknown" };
  if (s.verification.status === "UNVERIFIED" && !s.todayNote)
    return { state: "unknown", reason: "unverified" };

  const indiaNow = toIndia(now);
  const cur = indiaNow.h * 60 + indiaNow.m;
  const openSlots = s.slots
    .filter((sl: TimingSlot) => sl.opening && sl.closing)
    .map((sl) => ({ start: toMin(sl.opening)!, end: toMin(sl.closing)! }));

  // Cross-midnight slot handling: assume a slot is "day" relative to opening hour.
  for (const slot of openSlots) {
    if (slot.start <= slot.end) {
      if (cur >= slot.start && cur < slot.end) return { state: "open" };
    } else {
      if (cur >= slot.start || cur < slot.end) return { state: "open" };
    }
  }
  // If all recorded slots have opening only (no closing), treat temple as open
  if (openSlots.length === 0 && s.slots.some((sl) => sl.opening)) return { state: "open" };
  return { state: "closed" };
}

/** Current time in India (IST, UTC+5:30) regardless of server location. */
export function toIndia(now: Date = new Date()) {
  const ist = new Date(now.getTime() + 5.5 * 3600 * 1000);
  return { h: ist.getUTCHours(), m: ist.getUTCMinutes(), day: ist.getUTCDay(), date: ist };
}

export const festivalDate = (month: number, day: number, year: number) => {
  // Festival month/day are nominal (lunar-based in reality); we render a stable yearly date for the calendar UI.
  return new Date(year, month - 1, Math.min(day, 28));
};

export const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const ordinal = (n: number) =>
  n + (n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th");

export const VERIFY_LABEL: Record<VerificationStatus, string> = {
  VERIFIED_OFFICIAL: "Verified · Official source",
  VERIFIED_SOURCE: "Verified · Reliable source",
  GOVERNMENT_SOURCE: "Government source",
  TRUSTED_SOURCE: "Trusted source",
  COMMUNITY_REPORTED: "Community reported",
  GOOGLE_PLACES: "Google Places data",
  NEEDS_VERIFICATION: "Verification pending",
  UNVERIFIED: "Not verified",
};

export const VERIFY_COLOR: Record<VerificationStatus, string> = {
  VERIFIED_OFFICIAL: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  VERIFIED_SOURCE: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  GOVERNMENT_SOURCE: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  TRUSTED_SOURCE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  COMMUNITY_REPORTED: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  GOOGLE_PLACES: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  NEEDS_VERIFICATION: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  UNVERIFIED: "bg-zinc-500/15 text-zinc-400 border-zinc-600/30",
};