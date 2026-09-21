import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByToken, SESSION_COOKIE } from "@/lib/auth";
import { getSaved, setSaved } from "@/lib/saved";
import { getTemple } from "@/lib/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const store = await cookies();
  const user = getUserByToken(store.get(SESSION_COOKIE)?.value);
  const saved = user ? getSaved(user.id) : [];
  return NextResponse.json({ saved, synced: !!user });
}

export async function POST(req: NextRequest) {
  const store = await cookies();
  const user = getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user) return NextResponse.json({ error: "Sign in to sync saved temples" }, { status: 401 });

  let body: { slug?: string; add?: boolean };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.slug || !getTemple(body.slug))
    return NextResponse.json({ error: "Unknown temple" }, { status: 404 });

  const current = getSaved(user.id);
  const next = body.add
    ? current.includes(body.slug)
      ? current
      : [...current, body.slug]
    : current.filter((s) => s !== body.slug);

  return NextResponse.json({ saved: setSaved(user.id, next) });
}