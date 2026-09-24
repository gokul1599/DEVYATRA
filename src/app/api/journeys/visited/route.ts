import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByToken, SESSION_COOKIE } from "@/lib/auth";
import { markTempleVisited, getVisitedTemples } from "@/lib/journeys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const store = await cookies();
  const user = await getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
  }

  const visited = await getVisitedTemples(user.id);
  return NextResponse.json({ success: true, visited });
}

export async function POST(req: NextRequest) {
  const store = await cookies();
  const user = await getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Sign in to track visited temples." }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.templeId || !body.templeSlug || !body.templeName) {
      return NextResponse.json(
        { error: "Missing required fields: templeId, templeSlug, and templeName." },
        { status: 400 }
      );
    }

    const saved = await markTempleVisited(user.id, {
      templeId: body.templeId,
      templeSlug: body.templeSlug,
      templeName: body.templeName,
      darshanType: body.darshanType,
      notes: body.notes,
      rating: body.rating ? Number(body.rating) : undefined,
      sevaPerformed: body.sevaPerformed,
      prasadamTaken: Boolean(body.prasadamTaken),
    });

    return NextResponse.json({ success: true, visited: saved });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to record visited temple";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
