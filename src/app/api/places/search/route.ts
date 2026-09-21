import { NextRequest, NextResponse } from "next/server";
import { textSearch, nearbySearch } from "@/lib/google/client";
import { toGooglePlace, toDiscoveredPlace } from "@/lib/google/normalize";
import { getCached, setCached } from "@/lib/google/cache";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import type { DiscoveredPlace } from "@/lib/google/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SEARCH_TTL_MS = 6 * 60 * 60 * 1000;

const schema = z.object({
  q: z.string().trim().min(2).max(120).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(0.5).max(50).optional(),
  includedTypes: z.string().optional(),
  max: z.coerce.number().int().min(1).max(20).optional(),
});

export async function GET(req: NextRequest) {
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const check = rateLimit(`places-search:${clientIp}`, 30);
  if (!check.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(check.retryAfterSeconds) } });
  }

  const parsed = schema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { q, lat, lng, radius, includedTypes, max } = parsed.data;

  if (!q && (lat === undefined || lng === undefined)) {
    return NextResponse.json({ error: "Provide q (text query) or lat & lng (nearby)." }, { status: 400 });
  }

  const cacheKey = JSON.stringify({ q, lat: lat?.toFixed(3), lng: lng?.toFixed(3), r: radius, t: includedTypes, m: max });
  const cached = getCached<{ items: unknown[] }>(`places:${cacheKey}`, SEARCH_TTL_MS);
  if (cached) return NextResponse.json(cached.payload);

  try {
    let items: DiscoveredPlace[] = [];
    if (q) {
      const res = await textSearch({
        query: q,
        locationBias: lat !== undefined && lng !== undefined ? { latitude: lat, longitude: lng, radiusKm: radius ?? 10 } : undefined,
        maxResults: max ?? 10,
      });
      items = (res.places ?? [])
        .map((p) => toGooglePlace(p))
        .filter((p): p is NonNullable<typeof p> => p !== null)
        .map((p) => toDiscoveredPlace(p, { source: "google" }));
    } else {
      const res = await nearbySearch({
        latitude: lat!,
        longitude: lng!,
        radiusKm: radius ?? 10,
        includedTypes: includedTypes?.split(",").filter(Boolean),
        maxResults: max ?? 10,
      });
      items = (res.places ?? [])
        .map((p) => toGooglePlace(p))
        .filter((p): p is NonNullable<typeof p> => p !== null)
        .map((p) => toDiscoveredPlace(p, { source: "google" }));
    }
    const payload = { items };
    setCached(cacheKey, payload, SEARCH_TTL_MS);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ items: [] }, { status: 503 });
  }
}