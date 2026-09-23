import { NextRequest, NextResponse } from "next/server";
import { createUser, SESSION_COOKIE, createSession, publicUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  if (!name || name.length < 2) return NextResponse.json({ error: "Enter your name" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email ?? "")) return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  let user;
  try {
    user = await createUser(name, email!, password);
  } catch (e) {
    if (e instanceof Error && e.message === "EMAIL_EXISTS")
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    throw e;
  }

  const sessionToken = await createSession(user.id);
  const res = NextResponse.json({ user: publicUser(user) }, { status: 201 });
  res.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}