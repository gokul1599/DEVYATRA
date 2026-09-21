import { NextRequest, NextResponse } from "next/server";
import { discoverTemples } from "@/lib/discovery/engine";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { MAX_DISCOVERED_ITEMS } from "@/lib/google/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  q: z.string().trim().max(120).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(0.5).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(MAX_DISCOVERED_ITEMS).optional(),
  forceLive: z
    .string()
    .transform((v) => v === "1" || v === "true")
    .optional(),
});

const DISCOVER_RATE_PER_MIN = 30;

export async function GET(req: NextRequest) {
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous";
  const check = rateLimit(`discover:${clientIp}`, DISCOVER_RATE_PER_MIN);
  if (!check.ok) {
    return NextResponse.json(
      { error: `Too many discovery requests. Try again in ${check.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(check.retryAfterSeconds) } }
    );
  }

  const parsed = schema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid discovery parameters", issues: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  }
  const { q, lat, lng, radius, limit, forceLive } = parsed.data;

  if (!q && (lat === undefined || lng === undefined)) {
    return NextResponse.json({ error: "Provide a query (q) or a location (lat & lng)." }, { status: 400 });
  }

  const result = await discoverTemples({
    query: q,
    center: lat !== undefined && lng !== undefined ? { latitude: lat, longitude: lng } : undefined,
    radiusKm: radius,
    limit,
    forceLive,
  });

  return NextResponse.json(result, {
    headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=600" },
  });
}