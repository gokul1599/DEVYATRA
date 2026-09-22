import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db/client";
import { haversineDistance } from "@/lib/importer/deduplicate";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: "Database service unavailable" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");

    if (!latStr || !lngStr) {
      return NextResponse.json(
        { error: "Query parameters 'lat' and 'lng' are required" },
        { status: 400 }
      );
    }

    const targetLat = parseFloat(latStr);
    const targetLng = parseFloat(lngStr);

    if (isNaN(targetLat) || isNaN(targetLng)) {
      return NextResponse.json(
        { error: "Invalid coordinates provided" },
        { status: 400 }
      );
    }

    const radiusKm = Math.min(100, Math.max(1, parseFloat(searchParams.get("radiusKm") || "25")));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    // Rough bounding box filtering to minimize in-memory computations
    // 1 deg latitude ≈ 111 km
    const latDelta = radiusKm / 111.0;
    const lngDelta = radiusKm / (111.0 * Math.cos((targetLat * Math.PI) / 180));

    const candidates = await prisma.temple.findMany({
      where: {
        isCentroidFallback: false, // EXCLUDE centroid fallbacks from spatial search
        latitude: {
          gte: targetLat - latDelta,
          lte: targetLat + latDelta
        },
        longitude: {
          gte: targetLng - lngDelta,
          lte: targetLng + lngDelta
        }
      },
      include: {
        state: { select: { name: true, code: true } },
        district: { select: { name: true, slug: true } }
      }
    });

    const results = candidates
      .map((t) => {
        const distanceM = haversineDistance(
          targetLat,
          targetLng,
          t.latitude,
          t.longitude
        );
        const distanceKm = Math.round((distanceM / 1000) * 10) / 10;
        return {
          id: t.id,
          identifier: t.identifier,
          slug: t.slug,
          name: t.name,
          nameLocal: t.nameLocal,
          mainDeity: t.mainDeity,
          tradition: t.tradition,
          coordinates: {
            latitude: t.latitude,
            longitude: t.longitude
          },
          distanceKm,
          distanceMeters: Math.round(distanceM),
          state: t.state?.name || t.stateCode,
          district: t.district?.name,
          verificationStatus: t.verificationStatus,
          dataConfidence: t.dataConfidence
        };
      })
      .filter((r) => r.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      origin: {
        latitude: targetLat,
        longitude: targetLng
      },
      radiusKm,
      count: results.length,
      data: results
    });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in nearby temples API:", error);
    return NextResponse.json(
      { error: "Internal server error", details },
      { status: 500 }
    );
  }
}
