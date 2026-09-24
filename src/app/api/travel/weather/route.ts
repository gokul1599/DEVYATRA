import { NextRequest, NextResponse } from "next/server";
import { getLiveWeather } from "@/lib/providers/weather";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");
  const name = searchParams.get("name") || "Sanctuary";

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
  }

  const weather = await getLiveWeather(lat, lng, name);
  return NextResponse.json(weather, {
    headers: {
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
    },
  });
}
