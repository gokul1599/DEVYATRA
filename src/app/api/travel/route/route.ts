import { NextRequest, NextResponse } from "next/server";
import { getRoute, TravelMode } from "@/lib/providers/routing";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const origLat = parseFloat(searchParams.get("origLat") || "0");
  const origLng = parseFloat(searchParams.get("origLng") || "0");
  const destLat = parseFloat(searchParams.get("destLat") || "0");
  const destLng = parseFloat(searchParams.get("destLng") || "0");
  const mode = (searchParams.get("mode") || "car") as TravelMode;

  if (!origLat || !origLng || !destLat || !destLng) {
    return NextResponse.json({ error: "Missing origin or destination coordinates" }, { status: 400 });
  }

  const route = await getRoute({
    origin: { latitude: origLat, longitude: origLng },
    destination: { latitude: destLat, longitude: destLng },
    travelMode: mode,
  });

  return NextResponse.json(route, {
    headers: {
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
