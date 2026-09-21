import { NextRequest, NextResponse } from "next/server";
import { autocompleteSuggest } from "@/lib/google/client";
import { getCached, setCached } from "@/lib/google/cache";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AC_TTL_MS = 60 * 60 * 1000;

const schema = z.object({
  q: z.string().trim().min(2).max(80),
});

export async function GET(req: NextRequest) {
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const check = rateLimit(`autocomplete:${clientIp}`, 60);
  if (!check.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(check.retryAfterSeconds) } });
  }

  const parsed = schema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ suggestions: [] });
  }
  const q = parsed.data.q;
  const key = `ac:${q.toLowerCase()}`;
  const cached = getCached<{ suggestions: unknown[] }>(key, AC_TTL_MS);
  if (cached) return NextResponse.json(cached.payload);

  try {
    const res = await autocompleteSuggest({ input: q, region: "IN" });
    const suggestions = (res.suggestions ?? [])
      .map((s) => {
        const place = s.placePrediction;
        if (place?.placeId) {
          return { type: "place" as const, placeId: place.placeId, text: place.text?.text ?? "" };
        }
        if (s.queryPrediction?.text?.text) {
          return { type: "query" as const, text: s.queryPrediction.text.text };
        }
        return null;
      })
      .filter((s): s is NonNullable<typeof s> => s !== null)
      .slice(0, 8);
    const payload = { suggestions };
    setCached(key, payload, AC_TTL_MS);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}