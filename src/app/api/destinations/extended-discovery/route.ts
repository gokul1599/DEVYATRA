import { NextRequest, NextResponse } from "next/server";
import {
  getExtendedDiscoveryAround,
  type DistanceBandId,
  type TravelStyle,
  type VisitDuration,
  type SignificanceTier,
} from "@/lib/destinations/extended-discovery";
import { isValidCoordinate, isWithinIndiaBounds } from "@/lib/map/location-quality";

export const dynamic = "force-dynamic";

/**
 * GET /api/destinations/extended-discovery
 * 
 * Query the 300 km regional discovery graph around any sacred anchor or coordinates.
 * Returns graduated distance bands (0-10km, 10-50km, 50-150km, 150-300km)
 * with grounded straight-line vs. road distance, travel style filters, and significance tiers.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");

    if (!latParam || !lngParam) {
      return NextResponse.json(
        { error: "Missing required 'lat' and 'lng' query parameters" },
        { status: 400 }
      );
    }

    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);

    if (!isValidCoordinate(lat, lng)) {
      return NextResponse.json(
        { error: "Invalid coordinate values" },
        { status: 400 }
      );
    }

    if (!isWithinIndiaBounds(lat, lng)) {
      return NextResponse.json(
        { error: "Coordinates must lie within the sovereign territory of India" },
        { status: 400 }
      );
    }

    const radiusKm = searchParams.get("radiusKm")
      ? Math.min(300, Math.max(10, parseFloat(searchParams.get("radiusKm")!)))
      : 300;

    const distanceBand = searchParams.get("distanceBand") as DistanceBandId | undefined;
    const categoryParam = searchParams.get("category");
    const categories = categoryParam ? categoryParam.split(",").map((c) => c.trim()) : undefined;
    const travelStyle = searchParams.get("travelStyle") as TravelStyle | undefined;
    const duration = searchParams.get("duration") as VisitDuration | undefined;
    const significance = searchParams.get("significance") as SignificanceTier | undefined;
    const excludeId = searchParams.get("excludeId") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 60;

    const result = await getExtendedDiscoveryAround(lat, lng, {
      radiusKm,
      distanceBand,
      categories,
      travelStyle,
      duration,
      significance,
      excludeId,
      limit,
    });

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[ExtendedDiscoveryAPI] Error:", error);
    return NextResponse.json(
      { error: "Internal server error querying extended discovery graph" },
      { status: 500 }
    );
  }
}
