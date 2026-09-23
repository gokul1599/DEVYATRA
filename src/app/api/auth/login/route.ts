import { NextRequest, NextResponse } from "next/server";
import { login, SESSION_COOKIE, createSession, publicUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  let user;
  let sessionToken: string;
  try {
    user = await login(body.email ?? "", body.password ?? "");
    if (!user) return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
    sessionToken = await createSession(user.id);
  } catch (e) {
    if (e instanceof Error && e.message === "DATABASE_UNAVAILABLE") {
      return NextResponse.json(
        { error: "Authentication service temporarily unavailable. Please retry in a moment." },
        { status: 503 }
      );
    }
    throw e;
  }
  const res = NextResponse.json({ user: publicUser(user) });
  res.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}