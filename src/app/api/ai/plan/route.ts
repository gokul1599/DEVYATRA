import { NextRequest, NextResponse } from "next/server";
import { buildPlan, type PlanRequest } from "@/lib/ai/engine";
import { getTemple } from "@/lib/registry";
import { resolveTemple } from "@/lib/db/directory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface UiPayload {
  templeId: string;
  date?: string;
  people?: number;
  budget?: "budget" | "moderate" | "premium";
  pace?: "leisurely" | "standard" | "fast";
  interests?: string[];
  type?: "morning" | "full" | "evening";
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

  const temple = (await resolveTemple(body.templeId)) ?? getTemple(body.templeId);
  if (!temple) {
    return NextResponse.json({ error: "Unknown temple" }, { status: 404 });
  }

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

  const reqPlan: PlanRequest = {
    templeId: body.templeId,
    date: body.date ?? new Date().toISOString().slice(0, 10),
    arrival: window[0],
    departure: window[1],
    people: Math.max(1, Math.min(10, body.people ?? 1)),
    budget: (budget ?? "mid") as PlanRequest["budget"],
    travel: travel as PlanRequest["travel"],
    companions: (body.people ?? 1) > 1 ? ["family"] : ["solo"],
    interests,
    lang: body.lang ?? "en",
  };

  const plan = buildPlan(reqPlan, temple);
  return NextResponse.json({ plan });
}