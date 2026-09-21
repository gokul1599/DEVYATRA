import { NextRequest, NextResponse } from "next/server";
import { placeDetails } from "@/lib/google/client";
import { toGooglePlace } from "@/lib/google/normalize";
import { getCached, setCached } from "@/lib/google/cache";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { DETAILS_CACHE_TTL_MS } from "@/lib/google/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ placeId: z.string().trim().min(1).max(200) });

export async function GET(req: NextRequest) {
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const check = rateLimit(`places-details:${clientIp}`, 20);
  if (!check.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(check.retryAfterSeconds) } });
  }

  const parsed = schema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "placeId required" }, { status: 400 });
  const placeId = parsed.data.placeId;

  const cached = getCached<{ place: unknown | null }>(`details:${placeId}`, DETAILS_CACHE_TTL_MS);
  if (cached) return NextResponse.json(cached.payload, { headers: { "Cache-Control": "public, max-age=86400" } });

  try {
    const res = await placeDetails(placeId);
    const place = res.place ? toGooglePlace(res.place) : null;
    const payload = { place };
    setCached(`details:${placeId}`, payload, DETAILS_CACHE_TTL_MS);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ place: null }, { status: 503 });
  }
}