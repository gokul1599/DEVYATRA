import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByToken, SESSION_COOKIE } from "@/lib/auth";
import { addJournalEntry, getJournalEntries } from "@/lib/journeys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const store = await cookies();
  const user = await getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const templeId = searchParams.get("templeId") || undefined;

  const entries = await getJournalEntries(user.id, templeId);
  return NextResponse.json({ success: true, entries });
}

export async function POST(req: NextRequest) {
  const store = await cookies();
  const user = await getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Sign in to create journal entries." }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: "Missing required fields: title and content." },
        { status: 400 }
      );
    }

    const saved = await addJournalEntry(user.id, {
      title: body.title,
      content: body.content,
      journeyId: body.journeyId,
      templeId: body.templeId,
      mood: body.mood,
      photoUrls: body.photoUrls,
    });

    return NextResponse.json({ success: true, entry: saved });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save journal entry";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
