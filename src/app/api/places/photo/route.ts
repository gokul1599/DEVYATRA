import { NextRequest, NextResponse } from "next/server";
import { photoFetch } from "@/lib/google/client";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(1).max(300),
  h: z.coerce.number().int().min(100).max(1500).optional(),
});

/** Server-side photo proxy: keeps GOOGLE_MAPS_API_KEY out of the browser. */
export async function GET(req: NextRequest) {
  const parsed = schema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return new NextResponse("photo name required", { status: 400 });
  }
  const { name, h } = parsed.data;

  try {
    const upstream = await photoFetch({ name, maxHeightPx: h ?? 900 });
    if (!upstream.ok) {
      return new NextResponse("photo unavailable", { status: 502 });
    }
    const buffer = await upstream.arrayBuffer();
    const type = upstream.headers.get("content-type") ?? "image/jpeg";
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
        "X-Google-Photo-Source": "places",
      },
    });
  } catch {
    return new NextResponse("photo unavailable", { status: 503 });
  }
}