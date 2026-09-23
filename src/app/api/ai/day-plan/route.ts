import { NextRequest, NextResponse } from "next/server";
import { generateDayAroundTemple, DayAroundTempleRequest } from "@/lib/ai/planner2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DayAroundTempleRequest;
    if (!body.templeSlug) {
      return NextResponse.json(
        { error: "Missing required parameter: templeSlug" },
        { status: 400 }
      );
    }

    const payload: DayAroundTempleRequest = {
      templeSlug: body.templeSlug,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      interests: Array.isArray(body.interests) ? body.interests : ["heritage", "pilgrimage"],
      pace: body.pace || "standard",
      companions: Array.isArray(body.companions) ? body.companions : ["family"],
    };

    const plan = await generateDayAroundTemple(payload);

    return NextResponse.json({
      success: true,
      data: plan,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate day around temple itinerary", details: message },
      { status: 500 }
    );
  }
}
