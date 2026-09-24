import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByToken, SESSION_COOKIE } from "@/lib/auth";
import { shareJourney, getSharedJourney } from "@/lib/journeys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing share code." }, { status: 400 });
  }

  const result = await getSharedJourney(code);
  if (!result) {
    return NextResponse.json({ error: "Shared journey not found or private." }, { status: 404 });
  }

  return NextResponse.json({ success: true, sharedJourney: result });
}

export async function POST(req: NextRequest) {
  const store = await cookies();
  const user = await getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Sign in to share journeys." }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.journeyId) {
      return NextResponse.json({ error: "Missing journeyId." }, { status: 400 });
    }

    const res = await shareJourney(user.id, body.journeyId, body.authorName || user.name || "A Pilgrim");
    if (!res) {
      return NextResponse.json({ error: "Failed to generate share link or journey not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, ...res });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error sharing journey";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
