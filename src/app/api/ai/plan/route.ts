import { NextRequest, NextResponse } from "next/server";
import { buildPlan, type PlanRequest } from "@/lib/ai/engine";
import { getTemple } from "@/lib/registry";
import { resolveTemple } from "@/lib/db/directory";
import type { Temple } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface UiPayload {
  templeId?: string;
  templeIds?: string[];
  date?: string;
  days?: number;
  people?: number;
  budget?: "budget" | "moderate" | "premium";
  pace?: "leisurely" | "standard" | "fast";
  interests?: string[];
  type?: "morning" | "full" | "evening";
  companions?: ("solo" | "couple" | "family" | "children" | "elderly" | "accessibility")[];
  lang?: string;
}

const WINDOWS: Record<string, [string, string]> = {
  morning: ["07:00", "13:00"],
  full: ["08:00", "18:00"],
  evening: ["14:00", "21:00"],
};

export async function POST(req: NextRequest) {
  let body: UiPayload;
  try {
    body = (await req.json()) as UiPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Resolve requested temples
  const rawIds = body.templeIds && body.templeIds.length > 0
    ? body.templeIds
    : body.templeId
      ? [body.templeId]
      : [];

  if (rawIds.length === 0) {
    return NextResponse.json({ error: "No temple specified" }, { status: 400 });
  }

  const resolvedTemples: Temple[] = [];
  for (const id of rawIds) {
    const t = (await resolveTemple(id)) ?? getTemple(id);
    if (t) {
      resolvedTemples.push(t);
    }
  }

  if (resolvedTemples.length === 0) {
    return NextResponse.json({ error: "Could not find requested temples in directory" }, { status: 404 });
  }

  const primaryTemple = resolvedTemples[0];
  const window = WINDOWS[body.type ?? "full"] ?? WINDOWS.full;
  const budget = (body.budget ?? "moderate") === "moderate" ? "mid" : body.budget;
  const travel =
    body.pace === "fast" ? "car" : body.pace === "leisurely" ? "walking" : "walking";
  const interests = (body.interests ?? ["Darshan"]).map((i) =>
    i.toLowerCase() === "food & prasad"
      ? "food"
      : i.toLowerCase() === "history"
        ? "history"
        : i.toLowerCase() === "devotional music"
          ? "music"
          : i.toLowerCase()
  );

  const companions = body.companions || ((body.people ?? 1) > 1 ? ["family"] : ["solo"]);

  const reqPlan: PlanRequest = {
    templeId: primaryTemple.id,
    additionalTempleIds: resolvedTemples.slice(1).map((t) => t.id),
    date: body.date ?? new Date().toISOString().slice(0, 10),
    days: body.days ? Math.min(3, Math.max(1, body.days)) : 1,
    arrival: window[0],
    departure: window[1],
    people: Math.max(1, Math.min(10, body.people ?? 1)),
    budget: (budget ?? "mid") as PlanRequest["budget"],
    travel: travel as PlanRequest["travel"],
    companions,
    interests,
    lang: body.lang ?? "en",
  };

  const plan = buildPlan(reqPlan, resolvedTemples);
  return NextResponse.json({
    success: true,
    plan,
    ...plan, // Backward-compatible top-level properties
  });
}