import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByToken, SESSION_COOKIE } from "@/lib/auth";
import { discoverTemples } from "@/lib/discovery/engine";
import { cacheStats } from "@/lib/google/cache";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  q: z.string().trim().max(120).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(0.5).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(60).optional(),
});

export async function GET(req: NextRequest) {
  const store = await cookies();
  const user = await getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  const { q, lat, lng, radius, limit } = parsed.data;

  if (!q && (lat === undefined || lng === undefined)) {
    return NextResponse.json({ error: "Provide q or lat & lng." }, { status: 400 });
  }

  const result = await discoverTemples({
    query: q,
    center: lat !== undefined && lng !== undefined ? { latitude: lat, longitude: lng } : undefined,
    radiusKm: radius,
    limit,
    forceLive: true,
  });

  return NextResponse.json({
    result,
    stats: cacheStats(),
  });
}