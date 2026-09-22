import { z } from "zod";
import { Temple } from "@/lib/types";
import { getTemple, nearbyFor } from "@/lib/registry";
import { statusFor, minutesToHHMM, toIndia } from "@/lib/format";
import { translate, type LabelKey } from "@/lib/i18n";

/** ------------------------------------------------------------------ **
 *  LOCATION + TEMPLE CONTEXT ENGINE
 *  The AI never receives the whole database. It receives a precisely
 *  scoped context bundle built from indexed, verified records, plus the
 *  local near-real-time inquirer state (date/time). Outputs are
 *  structured and validated with Zod before rendering.
 * ------------------------------------------------------------------- */

export const ItineraryItemSchema = z.object({
  time: z.string(),
  place: z.string(),
  type: z.string(),
  durationMinutes: z.number().int().min(5).max(600),
  distanceKm: z.number().min(0),
  reason: z.string(),
  source: z.string(),
});

export const ItinerarySchema = z.object({
  summary: z.string(),
  duration: z.string(),
  estimatedCost: z.string(),
  items: z.array(ItineraryItemSchema),
  warnings: z.array(z.string()),
});

export type PlanResult = z.infer<typeof ItinerarySchema>;

export interface PlanRequest {
  templeId: string;
  date: string;
  arrival: string;
  departure: string;
  people: number;
  budget: "any" | "budget" | "mid" | "premium";
  travel: "walking" | "bike" | "car" | "bus" | "train";
  companions: ("solo" | "couple" | "family" | "children" | "elderly" | "accessibility")[];
  interests: string[];
  lang: string;
}

interface Stop {
  place: string;
  type: string;
  durationMinutes: number;
  distanceKm: number;
  reason: string;
  source: string;
  kind: string;
}

const SPEED: Record<PlanRequest["travel"], number> = {
  walking: 4,
  bike: 18,
  car: 30,
  bus: 28,
  train: 40,
};

const travelMin = (d: number, travel: PlanRequest["travel"]) =>
  d <= 0.4 ? 10 : Math.round((d / SPEED[travel]) * 60);

function min(str: string) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + (m || 0);
}

const safeAdd = (base: number, extra: number) => Math.min(base + extra, Math.max(base, 24 * 60 - 30));

export function buildPlan(req: PlanRequest, templeOverride?: Temple): PlanResult {
  const temple = templeOverride ?? getTemple(req.templeId);
  if (!temple)
    return {
      summary: translate(req.lang, "ai_not_verified"),
      duration: "–",
      estimatedCost: "–",
      items: [],
      warnings: [translate(req.lang, "ai_not_verified")],
    };

  const start = Math.max(min(req.arrival), 4 * 60); // earliest 04:00
  const end = Math.max(min(req.departure), start + 90); // at least 90 min
  const window = end - start;
  const status = statusFor(temple);
  const isOpen = status.state === "open" || status.state === "unknown";

  const stops: Stop[] = [];
  let cursor = start;
  let travelPortion = Math.round(window * 0.12); // time budget for travel between stops

  const addTempleVisit = () => {
    const dur = Math.min(75, Math.max(45, Math.round(window * 0.22)));
    stops.push({
      place: temple.name,
      type: "temple",
      durationMinutes: dur,
      distanceKm: 0,
      reason: isOpen
        ? "Main darshan of the day — gives you the core of the visit before you explore the surroundings."
        : "The temple is the anchor of this plan; verify its schedule before setting out.",
      source: temple.source.org,
      kind: "temple",
    });
    cursor = safeAdd(cursor, dur);
  };

  const meals: string[] = [];
  const foodPref = req.interests.includes("food");
  const veg = !req.interests.some((i) => i.includes("non-veg"));
  if (foodPref) {
    if (start <= 10 * 60 && start < 11 * 60) meals.push("breakfast");
    if (start <= 13 * 60 && end >= 12 * 60) meals.push("lunch");
    if (end >= 18 * 60 && start <= 19 * 60) meals.push("dinner");
  }

  const attractions = nearbyFor(temple.id).filter((n) =>
    n.kind === "attraction" || n.kind === "nature" || n.kind === "temple"
  );
  const restaurants = nearbyFor(temple.id).filter((n) => n.kind === "restaurant");
  const hotel = nearbyFor(temple.id).find((n) => n.kind === "hotel");

  const feedByInterest = () => {
    if (req.interests.includes("history") && attractions.length) return attractions;
    if (req.interests.includes("nature") && attractions.some((a) => a.kind === "nature"))
      return attractions.filter((a) => a.kind === "nature");
    if (req.interests.includes("food") && meals.length) return [...restaurants, ...nearbyFor(temple.id).filter((n) => n.kind === "shopping")];
    return attractions;
  };

  const candidates = feedByInterest().slice(0, 4);
  const used = new Set<string>();

  addTempleVisit();

  const mealSlots: { at: number; label: string; kind: "breakfast" | "lunch" | "dinner" }[] = [
    { at: 9 * 60, label: "breakfast", kind: "breakfast" },
    { at: 12 * 60 + 30, label: "lunch", kind: "lunch" },
    { at: 19 * 60, label: "dinner", kind: "dinner" },
  ];

  let passedCount = 0;
  for (const ms of mealSlots) {
    if (!meals.includes(ms.kind)) continue;
    if (ms.at < start || ms.at > end) continue;
    const rest = restaurants.find(
      (r) => !used.has(r.id) && (!r.cuisine || veg || !r.cuisine.some((c) => c.toLowerCase().includes("veg")))
    ) ?? restaurants.find((r) => !used.has(r.id));
    if (!rest) continue;
    const item: Stop = {
      place: rest.name,
      type: `restaurant · ${rest.priceHint ?? "local"}`,
      durationMinutes: 45,
      distanceKm: rest.distanceKm,
      reason: rest.recommendation ?? "Close to the temple and a good food stop for this part of the day.",
      source: "Curated nearby data",
      kind: "restaurant",
    };
    const arrivalOffset = Math.max(0, ms.at - cursor) + Math.min(travelPortion, travelMin(rest.distanceKm, req.travel));
    cursor = safeAdd(cursor, arrivalOffset);
    if (cursor > ms.at + 60) continue; // too late to fit the meal comfortably
    stops.push(item);
    used.add(rest.id);
    cursor = safeAdd(cursor, item.durationMinutes);
    passedCount++;
    if (passedCount > 3) break;
  }

  for (const c of candidates) {
    if (used.has(c.id)) continue;
    if (cursor >= end - 45) break;
    used.add(c.id);
    const tt = travelMin(c.distanceKm, req.travel);
    stops.push({
      place: c.name,
      type:
        c.kind === "nature" ? "nature / outdoors"
        : c.kind === "temple" ? "nearby temple"
        : "attraction",
      durationMinutes: Math.min(75, Math.max(45, Math.round((window - cursor) * 0.25))),
      distanceKm: c.distanceKm,
      reason: c.recommendation ?? "Well-placed stop that fits the remaining time.",
      source: "Curated nearby data",
      kind: c.kind,
    });
    if (tt < travelPortion) travelPortion -= tt;
    cursor = safeAdd(cursor, 60);
  }

  if (hotel && end - cursor >= 30) {
    stops.push({
      place: hotel.name,
      type: "stay",
      durationMinutes: 30,
      distanceKm: hotel.distanceKm,
      reason: "Base for the night close to your departure checkpoint.",
      source: "Curated nearby data",
      kind: "hotel",
    });
  }

  // Rebuild times sequentially from the cursor walk
  let t = start;
  const detailed = stops.map((s) => {
    const at = t;
    t = safeAdd(t, s.durationMinutes + (s.distanceKm > 0.4 ? Math.min(15, travelMin(s.distanceKm, req.travel)) : 0));
    return {
      time: minutesToHHMM(at),
      place: s.place,
      type: s.type,
      durationMinutes: s.durationMinutes,
      distanceKm: s.distanceKm,
      reason: s.reason,
      source: s.source,
    };
  });

  const travelFriendly = req.companions.includes("elderly") || req.companions.includes("accessibility") || req.companions.includes("children");
  const warnings: string[] = [];
  if (travelFriendly)
    warnings.push("Pace kept moderate and foot-distance limited for your party — confirm step-free routes at each stop.");
  if (status.state === "unknown")
    warnings.push("Timing for this temple is not yet officially verified — confirm its schedule on the day before travel.");
  if (req.companions.includes("accessibility"))
    warnings.push("Accessibility assistance varies by temple; most historical monuments have limited step-free access.");
  if (!req.interests.some((i) => i.includes("food")) && detailed.length > 2)
    warnings.push("Add 'Food' to your interests to weave meals into this plan.");

  const hCount = Math.max(1, Math.round((end - start) / 60));
  const budgetHint =
    req.budget === "budget" ? "Budget-friendly" : req.budget === "premium" ? "Premium" : "Moderate";
  const rng = req.budget === "premium" ? [1200, 2500] : [300, 900];
  const lo = rng[0] * req.people;
  const hi = rng[1] * req.people;

  const result: PlanResult = {
    summary: `A ${hCount}-hour pilgrimage day at ${temple.name} in ${temple.location}, ${temple.district}, balancing darshan, nearby sights, food and rest.`,
    duration: `${hCount} hour${hCount > 1 ? "s" : ""}`,
    estimatedCost: `${budgetHint} · ₹${lo.toLocaleString("en-IN")}–₹${hi.toLocaleString("en-IN")} total (${req.people} people)`,
    items: detailed,
    warnings,
  };

  const parsed = ItinerarySchema.safeParse(result);
  if (!parsed.success) {
    return {
      summary: translate(req.lang, "ai_not_verified"),
      duration: "–",
      estimatedCost: "–",
      items: [],
      warnings: ["The itinerary builder could not produce a valid plan for this combination."],
    };
  }
  return result;
}

/** Companions. */
export interface CompanionAnswer {
  text: string;
  facts: { label: string; value: string; source?: string }[];
}

const qHas = (q: string, ...words: string[]) => words.some((w) => q.toLowerCase().includes(w.toLowerCase()));

export function askCompanion(temple: Temple, question: string, lang = "en"): CompanionAnswer {
  const q = question;
  const t = (k: LabelKey) => translate(lang, k);

  if (qHas(q, "famous", "why", "known", "fame", "special", "famous for", "celebrated")) {
    const cards = temple.whyFamous
      .slice(0, 3)
      .map((w) => `${w.icon} ${w.title} — ${w.body}${w.type === "belief" ? " (traditional belief)." : "."}`)
      .join("\n\n");
    return {
      text: `${temple.name} is known for the following:\n\n${cards}`,
      facts: [{ label: "Why famous", value: temple.whyFamous[0]?.title ?? "", source: temple.source.org }],
    };
  }

  if (qHas(q, "time", "timing", "open", "timings", "schedule", "darshan", "when", "hours", "aarti")) {
    if (!temple.timings) return { text: t("ai_not_verified"), facts: [] };
    const lines = temple.timings.slots
      .map((s) => `${s.label}${s.opening ? " — " + s.opening : ""}${s.closing ? " – " + s.closing : ""}`)
      .join("\n");
    const note = temple.timings.verification.status === "UNVERIFIED" ? `\n\nNote: ${t("not_verified")}` : "";
    return {
      text: `Scheduled timings for ${temple.name}:\n\n${lines}${note}`,
      facts: [
        { label: "Status", value: temple.timings.verification.status, source: temple.timings.verification.source?.org },
      ],
    };
  }

  if (qHas(q, "book", "ticket", "entry", "price", "cost", "fee", "darshan ticket", "online booking", "vip")) {
    const b = temple.booking;
    const mode = b.bookingMode === "online" ? "online booking (official channel)" : b.bookingMode === "offline" ? "offline counter" : b.generalDarshan;
    const url = b.bookingUrl ? `\nOfficial booking: ${b.bookingUrl}` : "";
    const warn = b.verification.status === "UNVERIFIED" ? `\n\nNote: Booking details are unverified with the devasthanam trust.` : "";
    return {
      text: `Entry: ${b.generalDarshan === "free" ? "No ticket required for general darshan (free entry)" : b.generalDarshan}. ${b.specialDarshan ?? ""} Mode: ${mode}.${url}${warn}`,
      facts: [{ label: "Booking", value: b.bookingOrg ?? mode, source: b.verification.source?.org }],
    };
  }

  if (qHas(q, "festival", "festivals", "utsav", "celebration", "brahmotsavam", "poornima")) {
    if (!temple.festivals.length) return { text: t("ai_not_verified"), facts: [] };
    const lines = temple.festivals
      .slice(0, 3)
      .map((f) => `${f.name} (${f.dateLabel}) — ${f.description}`)
      .join("\n");
    return { text: `Known festivals at ${temple.name}:\n\n${lines}`, facts: [] };
  }

  if (qHas(q, "nearby", "around", "around this temple", "near", "restaurant", "food", "eat", "hotel", "stay", "attraction", "what else", "after darshan", "surrounding")) {
    const near = nearbyFor(temple.id);
    if (!near.length) return { text: t("ai_not_verified"), facts: [] };
    const lines = near
      .slice(0, 5)
      .map((n) => `${n.name} — ${n.distanceKm} km · ${n.kind}${n.recommendation ? ` · ${n.recommendation}` : ""}`)
      .join("\n");
    return {
      text: `Around ${temple.name}:\n\n${lines}`,
      facts: [{ label: "Nearby", value: `${near.length} curated places`, source: "Curated nearby data" }],
    };
  }

  if (qHas(q, "history", "origin", "built", "age", "background", "story", "legend", "history of")) {
    const phases = temple.history
      .slice(0, 3)
      .map((h) => `${h.title}${h.year ? ` (${h.year})` : ""} — ${h.body}`)
      .join("\n\n");
    return { text: `A brief documented history of ${temple.name}:\n\n${phases}`, facts: [{ label: "Period", value: temple.historicalPeriod ?? "–" }] };
  }

  if (qHas(q, "deity", "god", "goddess", "who is", "main deity", "presiding")) {
    return {
      text: `${temple.name} is dedicated to ${temple.mainDeity} (${temple.deities.join(", ")}). Tradition: ${temple.tradition.join(", ")}.`,
      facts: [{ label: "Main deity", value: temple.mainDeity }],
    };
  }

  if (qHas(q, "best time", "when should", "when to", "visit month", "season", "best month")) {
    const lines = temple.festivals
      .slice(0, 2)
      .map((f) => `${f.name} — ${f.dateLabel}`)
      .join(", ");
    return {
      text: `The busiest and most festive periods are ${temple.festivals.length ? lines : "festival periods"}. For daily darshan, early morning or after the noon closure are typically calmer — but confirm with the temple's current schedule.`,
      facts: [],
    };
  }

  if (qHas(q, "plan", "itinerary", "day plan", "schedule my day")) {
    return {
      text: "Use the Plan My Visit tool on this page — it builds a timed day around the temple, your hours and your interests.",
      facts: [],
    };
  }

  return { text: t("ai_not_verified"), facts: [] };
}

export const weatherNote = (temple?: Temple, date?: string): string | null => (void temple, void date, null);

export { toIndia, statusFor };