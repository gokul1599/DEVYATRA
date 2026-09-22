import { z } from "zod";
import { Temple } from "@/lib/types";
import { getTemple, nearbyFor } from "@/lib/registry";
import { statusFor, minutesToHHMM, toIndia } from "@/lib/format";
import { translate, type LabelKey } from "@/lib/i18n";
import { haversineDistance } from "@/lib/importer/deduplicate";

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
  day: z.number().int().min(1).max(7).optional(),
});

export const ItinerarySchema = z.object({
  summary: z.string(),
  duration: z.string(),
  estimatedCost: z.string(),
  days: z.number().int().min(1).max(7).optional(),
  items: z.array(ItineraryItemSchema),
  warnings: z.array(z.string()),
});

export type PlanResult = z.infer<typeof ItinerarySchema>;

export interface PlanRequest {
  templeId: string;
  additionalTempleIds?: string[];
  date: string;
  days?: number;
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
  day?: number;
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

export function buildPlan(req: PlanRequest, templeOverride?: Temple | Temple[]): PlanResult {
  const temples: Temple[] = Array.isArray(templeOverride)
    ? templeOverride
    : templeOverride
      ? [templeOverride]
      : req.templeId
        ? [getTemple(req.templeId)].filter(Boolean) as Temple[]
        : [];

  if (temples.length === 0) {
    return {
      summary: translate(req.lang, "ai_not_verified"),
      duration: "–",
      estimatedCost: "–",
      items: [],
      warnings: [translate(req.lang, "ai_not_verified")],
    };
  }

  const primaryTemple = temples[0];
  const start = Math.max(min(req.arrival), 4 * 60); // earliest 04:00
  const end = Math.max(min(req.departure), start + 90); // at least 90 min
  const window = end - start;
  const stops: Stop[] = [];
  let cursor = start;
  const warnings: string[] = [];

  // Demographic considerations
  const hasChildren = req.companions.includes("children");
  const hasElderly = req.companions.includes("elderly");
  const needsAccessibility = req.companions.includes("accessibility");

  if (hasChildren) {
    warnings.push("Traveling with children: 20-minute rest buffers allocated after main darshan; carry hydration and avoid midday stone courtyard heat.");
  }
  if (hasElderly) {
    warnings.push("Senior citizens in party: Pacing reduced; ancient temple prakarams feature high monolithic stone sills. Seek devasthanam battery buggies or special darshan counters.");
  }
  if (needsAccessibility) {
    warnings.push("Accessibility note: Most ancient ASI-protected monuments and historic sanctums have stepped thresholds; enquire with temple sevaks for designated accessible entrances.");
  }

  // Iterate over all requested temples
  for (let idx = 0; idx < temples.length; idx++) {
    const t = temples[idx];
    const status = statusFor(t);
    const isOpen = status.state === "open" || status.state === "unknown";

    // If unverified timings, warn with epistemic honesty
    if (status.state === "unknown" || t.timings?.verification.status === "UNVERIFIED") {
      warnings.push(`Darshan schedule for ${t.name} is awaiting official devasthanam confirmation. Confirm daily pooja timings at the counter before entry.`);
    }

    // Transit leg if subsequent temple
    if (idx > 0) {
      const prev = temples[idx - 1];
      const distM = haversineDistance(
        prev.latitude,
        prev.longitude,
        t.latitude,
        t.longitude
      );
      const distKm = Math.round((distM / 1000) * 10) / 10;
      const transitTime = Math.max(15, travelMin(distKm, req.travel));

      stops.push({
        place: `Transit: ${prev.name} → ${t.name}`,
        type: `transit · ${req.travel}`,
        durationMinutes: transitTime,
        distanceKm: distKm,
        reason: `Pilgrimage transit connecting shrines along the sacred circuit (${distKm} km via ${req.travel}).`,
        source: "Geospatial Haversine calculation",
        kind: "transit",
      });
      cursor = safeAdd(cursor, transitTime);
    }

    // Calculate darshan duration based on number of temples and window
    const baseDuration = temples.length > 1
      ? Math.min(60, Math.max(40, Math.round((window * 0.4) / temples.length)))
      : Math.min(75, Math.max(45, Math.round(window * 0.25)));

    // Grounded history vs traditional belief reasoning
    let visitReason = isOpen
      ? `Main darshan and parikrama of ${t.name}.`
      : `Anchor visit to ${t.name}; verify current pooja schedule.`;

    const historyText = t.history?.length ? t.history.map((h) => `${h.title}: ${h.body}`).join(". ") : null;
    const beliefText = t.whyFamous?.find((w) => w.type === "belief")?.body ?? null;

    if (historyText) {
      visitReason += ` Documented history: ${historyText.slice(0, 110)}...`;
    } else if (beliefText) {
      visitReason += ` Sthala purana: ${beliefText.slice(0, 110)}...`;
    }

    stops.push({
      place: t.name,
      type: "temple darshan",
      durationMinutes: baseDuration,
      distanceKm: 0,
      reason: visitReason,
      source: t.source?.org || "Devyatra Verified Directory",
      kind: "temple",
    });
    cursor = safeAdd(cursor, baseDuration);

    // Optional child/elderly pause after darshan
    if ((hasChildren || hasElderly) && idx < temples.length - 1) {
      stops.push({
        place: `${t.name} Courtyard Rest`,
        type: "rest & hydration",
        durationMinutes: 20,
        distanceKm: 0,
        reason: "Gentle pause for senior citizens and children before proceeding to next shrine.",
        source: "Devyatra Pacing Engine",
        kind: "rest",
      });
      cursor = safeAdd(cursor, 20);
    }
  }

  // Meal planning around the temples
  const meals: string[] = [];
  const foodPref = req.interests.includes("food");
  const veg = !req.interests.some((i) => i.includes("non-veg"));
  if (foodPref) {
    if (start <= 10 * 60 && start < 11 * 60) meals.push("breakfast");
    if (start <= 13 * 60 && end >= 12 * 60) meals.push("lunch");
    if (end >= 18 * 60 && start <= 19 * 60) meals.push("dinner");
  }

  const restaurants = nearbyFor(primaryTemple.id).filter((n) => n.kind === "restaurant");
  const mealSlots: { at: number; label: string; kind: "breakfast" | "lunch" | "dinner" }[] = [
    { at: 9 * 60, label: "breakfast", kind: "breakfast" },
    { at: 12 * 60 + 30, label: "lunch", kind: "lunch" },
    { at: 19 * 60, label: "dinner", kind: "dinner" },
  ];

  for (const ms of mealSlots) {
    if (!meals.includes(ms.kind)) continue;
    if (cursor > end - 45) break;

    const rest = restaurants.find(
      (r) => (!r.cuisine || veg || !r.cuisine.some((c) => c.toLowerCase().includes("veg")))
    );
    if (!rest) continue;

    stops.push({
      place: rest.name,
      type: `restaurant · ${rest.priceHint ?? "vegetarian"}`,
      durationMinutes: 45,
      distanceKm: rest.distanceKm,
      reason: rest.recommendation ?? "Recommended satvik / vegetarian dining spot for pilgrims.",
      source: "Curated nearby directory",
      kind: "restaurant",
    });
    cursor = safeAdd(cursor, 45);
    break; // One primary meal per itinerary to avoid congestion
  }

  // Include nearby cultural / nature / auxiliary shrines when planning a single temple
  if (temples.length === 1) {
    const nearbyAttractions = nearbyFor(primaryTemple.id).filter(
      (n) => n.kind === "attraction" || n.kind === "nature" || n.kind === "temple" || n.kind === "shopping"
    );
    for (const c of nearbyAttractions.slice(0, 3)) {
      if (cursor >= end - 45) break;
      stops.push({
        place: c.name,
        type:
          c.kind === "nature"
            ? "nature / outdoors"
            : c.kind === "temple"
            ? "nearby temple"
            : c.kind === "shopping"
            ? "pilgrim bazaar"
            : "heritage attraction",
        durationMinutes: 45,
        distanceKm: c.distanceKm,
        reason: c.recommendation ?? "Well-placed nearby stop to enrich your pilgrimage day.",
        source: "Curated nearby data",
        kind: c.kind,
      });
      cursor = safeAdd(cursor, 45);
    }
  }

  // Rebuild sequential timestamps with day partitioning
  const requestedDays = Math.max(1, Math.min(3, req.days || 1));
  let currentDay = 1;
  let t = start;
  const itemsPerDay = Math.ceil(stops.length / requestedDays);

  const detailed = stops.map((s, idx) => {
    if (requestedDays > 1) {
      const calculatedDay = Math.min(requestedDays, Math.floor(idx / itemsPerDay) + 1);
      if (calculatedDay !== currentDay) {
        currentDay = calculatedDay;
        t = start; // Reset cursor to day start
      }
    }
    const at = t;
    t = safeAdd(t, s.durationMinutes);
    return {
      day: currentDay,
      time: minutesToHHMM(at),
      place: s.place,
      type: s.type,
      durationMinutes: s.durationMinutes,
      distanceKm: s.distanceKm,
      reason: s.reason,
      source: s.source,
    };
  });

  const hCount = Math.max(1, Math.round((end - start) / 60));
  const budgetHint =
    req.budget === "budget" ? "Budget" : req.budget === "premium" ? "Comfort" : "Standard";
  const rng = req.budget === "premium" ? [1000, 2000] : [250, 600];
  const lo = rng[0] * req.people * requestedDays;
  const hi = rng[1] * req.people * requestedDays;

  const templeNames = temples.map((x) => x.name).join(temples.length === 2 ? " & " : ", ");
  const summary = requestedDays > 1
    ? `A ${requestedDays}-day sacred pilgrimage circuit (${requestedDays * hCount} total hours) visiting ${templeNames} in ${primaryTemple.location}, ${primaryTemple.district}. Balanced with verified transit legs, sacred darshans, and satvik refreshment stops across ${requestedDays} days.`
    : temples.length > 1
      ? `A ${hCount}-hour multi-temple pilgrimage circuit visiting ${templeNames} in ${primaryTemple.location}, ${primaryTemple.district}. Balanced with verified transit legs, sacred darshans, and satvik refreshment stops.`
      : `A ${hCount}-hour pilgrimage day at ${primaryTemple.name} in ${primaryTemple.location}, ${primaryTemple.district}. Optimized for sacred darshan, parikrama, and heritage appreciation.`;

  const result: PlanResult = {
    summary,
    days: requestedDays,
    duration: requestedDays > 1 ? `${requestedDays} Days (${requestedDays * hCount} hours)` : `${hCount} hour${hCount > 1 ? "s" : ""}`,
    estimatedCost: `${budgetHint} · ₹${lo.toLocaleString("en-IN")}–₹${hi.toLocaleString("en-IN")} total for ${req.people} ${req.people === 1 ? "person" : "people"} over ${requestedDays} ${requestedDays === 1 ? "day" : "days"} (Free general entry; covers satvik meals & local transit)`,
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