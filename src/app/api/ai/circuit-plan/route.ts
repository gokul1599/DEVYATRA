import { NextRequest, NextResponse } from "next/server";
import { generateSacredJourney, MultiDayPlanRequest } from "@/lib/ai/planner2";
import { SACRED_CIRCUITS, getSacredCircuit } from "@/lib/ai/circuits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Returns all available circuit templates
  return NextResponse.json({
    success: true,
    circuits: SACRED_CIRCUITS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as MultiDayPlanRequest;
    if (!body.circuitId && (!body.templeSlugs || body.templeSlugs.length === 0)) {
      return NextResponse.json(
        { error: "Must provide either circuitId or templeSlugs" },
        { status: 400 }
      );
    }

    if (body.circuitId && !getSacredCircuit(body.circuitId)) {
      return NextResponse.json(
        { error: `Circuit with id '${body.circuitId}' not found` },
        { status: 404 }
      );
    }

    const brief = generateSacredJourney(body);

    return NextResponse.json({
      success: true,
      data: brief,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate sacred circuit itinerary", details: message },
      { status: 500 }
    );
  }
}
