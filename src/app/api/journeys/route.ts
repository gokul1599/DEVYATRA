import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByToken, SESSION_COOKIE } from "@/lib/auth";
import { getSavedJourneys, saveJourney, deleteSavedJourney } from "@/lib/journeys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const store = await cookies();
  const user = getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
  }

  const journeys = getSavedJourneys(user.id);
  return NextResponse.json({ success: true, journeys });
}

export async function POST(req: NextRequest) {
  const store = await cookies();
  const user = getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Sign in to save journeys." }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.title || !body.templeSlugs || !Array.isArray(body.templeSlugs)) {
      return NextResponse.json(
        { error: "Invalid journey payload. Title and templeSlugs are required." },
        { status: 400 }
      );
    }

    const saved = saveJourney(user.id, {
      title: body.title,
      circuitId: body.circuitId,
      templeSlugs: body.templeSlugs,
      templeNames: body.templeNames || [],
      startDate: body.startDate || new Date().toISOString().split("T")[0],
      totalDays: Number(body.totalDays) || 1,
      travelMode: body.travelMode || "car",
      budget: body.budget || "mid",
      itineraryBrief: body.itineraryBrief,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, journey: saved });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save journey";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const store = await cookies();
  const user = getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const journeyId = searchParams.get("id");
  if (!journeyId) {
    return NextResponse.json({ error: "Missing journey ID." }, { status: 400 });
  }

  const deleted = deleteSavedJourney(user.id, journeyId);
  if (!deleted) {
    return NextResponse.json({ error: "Journey not found or unauthorized." }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Journey deleted successfully." });
}
