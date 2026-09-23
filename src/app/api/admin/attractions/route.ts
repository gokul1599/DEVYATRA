import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  try {
    const [
      totalPlaces,
      totalLinks,
      categoryCounts,
      verificationCounts,
      famousPlaces,
      unlinkedTemples,
    ] = await Promise.all([
      prisma.famousPlace.count(),
      prisma.templeNearbyPlace.count(),
      prisma.famousPlace.groupBy({
        by: ["category"],
        _count: { id: true },
      }),
      prisma.famousPlace.groupBy({
        by: ["verificationStatus"],
        _count: { id: true },
      }),
      prisma.famousPlace.findMany({
        take: 30,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { templeLinks: true },
          },
        },
      }),
      prisma.temple.findMany({
        where: {
          famousPlaces: {
            none: {},
          },
        },
        take: 25,
        select: {
          id: true,
          slug: true,
          name: true,
          district: { select: { name: true } },
          state: { select: { name: true, code: true } },
          latitude: true,
          longitude: true,
        },
      }),
    ]);

    const categoriesFormatted = categoryCounts.reduce<Record<string, number>>((acc, curr) => {
      acc[curr.category] = curr._count.id;
      return acc;
    }, {});

    const verificationFormatted = verificationCounts.reduce<Record<string, number>>((acc, curr) => {
      acc[curr.verificationStatus] = curr._count.id;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      stats: {
        totalPlaces,
        totalLinks,
        categories: categoriesFormatted,
        verification: verificationFormatted,
      },
      places: famousPlaces.map((p) => ({
        id: p.id,
        name: p.name,
        nativeName: p.nativeName,
        slug: p.slug,
        category: p.category,
        district: p.district,
        state: p.state,
        sourceType: p.sourceType,
        verificationStatus: p.verificationStatus,
        linkedTemplesCount: p._count.templeLinks,
      })),
      unlinkedTemplesQueue: unlinkedTemples.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        district: t.district?.name || "Unknown",
        state: t.state?.name || "Unknown",
        stateCode: t.state?.code || "IN",
        latitude: t.latitude,
        longitude: t.longitude,
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to retrieve attraction admin telemetry", details: message },
      { status: 500 }
    );
  }
}
