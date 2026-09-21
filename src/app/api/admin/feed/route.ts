import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { getUserByToken, SESSION_COOKIE } from "@/lib/auth";
import { readFeed, writeFeed, type FeedPlace } from "@/lib/feeds";
import { getTemple } from "@/lib/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KINDS = [
  "temple", "restaurant", "hotel", "attraction", "nature", "shopping",
  "parking", "hospital", "pharmacy", "police", "restroom", "atm", "fuel", "transport",
];

interface IncomingPlace {
  templeId?: string;
  kind?: string;
  name?: string;
  distanceKm?: number;
  recommendation?: string;
  priceHint?: string;
  cuisine?: string[];
}

export async function GET() {
  const store = await cookies();
  const user = getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const feed = readFeed();
  return NextResponse.json({
    source: feed.source,
    updatedAt: feed.updatedAt,
    count: feed.nearby.length,
    byTemple: feed.nearby.reduce<Record<string, number>>((acc, p) => {
      acc[p.templeId] = (acc[p.templeId] ?? 0) + 1;
      return acc;
    }, {}),
  });
}

export async function POST(req: NextRequest) {
  const store = await cookies();
  const user = getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { source?: string; places?: IncomingPlace[] };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.places || !Array.isArray(body.places) || body.places.length === 0)
    return NextResponse.json({ error: "Send a non-empty places array" }, { status: 400 });
  if (body.places.length > 1000)
    return NextResponse.json({ error: "Batch too large (max 1000)" }, { status: 400 });

  const out: FeedPlace[] = [];
  const errors: string[] = [];
  for (const [i, p] of body.places.entries()) {
    const label = `place #${i + 1}`;
    if (!p.templeId || !getTemple(p.templeId)) {
      errors.push(`${label}: unknown templeId`);
      continue;
    }
    if (!p.kind || !KINDS.includes(p.kind)) {
      errors.push(`${label}: invalid kind "${p.kind}"`);
      continue;
    }
    if (!p.name?.trim()) {
      errors.push(`${label}: name required`);
      continue;
    }
    const d = p.distanceKm ?? 0;
    if (typeof d !== "number" || !isFinite(d) || d < 0) {
      errors.push(`${label}: invalid distanceKm`);
      continue;
    }
    out.push({
      id: randomUUID(),
      templeId: p.templeId,
      kind: p.kind,
      name: p.name.trim(),
      distanceKm: Math.round(d * 100) / 100,
      recommendation: p.recommendation?.trim() || undefined,
      priceHint: p.priceHint?.trim() || undefined,
      cuisine: Array.isArray(p.cuisine) ? p.cuisine.slice(0, 4) : undefined,
    });
  }

  if (out.length === 0) {
    return NextResponse.json(
      { error: "No valid places in batch", errors: errors.slice(0, 5) },
      { status: 400 }
    );
  }

  const existing = readFeed();
  const incoming = body.places;
  const merged = existing.nearby.filter(
    (prev) => !incoming.some((p) => p.templeId === prev.templeId && (p.name ?? "").trim() === prev.name)
  );
  const state = writeFeed(body.source || "manual import", [...merged, ...out]);

  return NextResponse.json(
    { ok: true, count: state.nearby.length, added: out.length, errors: errors.slice(0, 5), updatedAt: state.updatedAt },
    { status: 201 }
  );
}