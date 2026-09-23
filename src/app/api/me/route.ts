import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByToken, SESSION_COOKIE, publicUser, updateUserPreferences, toggleFollowTemple } from "@/lib/auth";
import { getFollowedTempleAlerts } from "@/lib/intelligence/alerts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const store = await cookies();
  const user = await getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user) {
    return NextResponse.json({ user: null, alerts: [] });
  }

  const pub = publicUser(user);
  const alerts = getFollowedTempleAlerts(pub.followedTemples);

  return NextResponse.json({
    user: pub,
    alerts,
  });
}

export async function PATCH(req: NextRequest) {
  const store = await cookies();
  const user = await getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (body.preferences) {
      await updateUserPreferences(user.id, body.preferences);
    }

    if (body.toggleFollow && typeof body.toggleFollow === "string") {
      await toggleFollowTemple(user.id, body.toggleFollow);
    }

    const updatedUser = await getUserByToken(store.get(SESSION_COOKIE)?.value);
    const pub = updatedUser ? publicUser(updatedUser) : null;
    const alerts = pub ? getFollowedTempleAlerts(pub.followedTemples) : [];

    return NextResponse.json({
      success: true,
      user: pub,
      alerts,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update profile";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}