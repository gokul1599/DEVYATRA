import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ state: string }> }
) {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: "Database service unavailable" },
        { status: 503 }
      );
    }

    const { state } = await params;
    if (!state) {
      return NextResponse.json({ error: "State parameter is required" }, { status: 400 });
    }

    const stateRecord = await prisma.state.findFirst({
      where: {
        OR: [
          { code: state.toUpperCase() },
          { slug: state.toLowerCase() },
          { name: { equals: state, mode: "insensitive" } }
        ]
      },
      include: {
        districts: {
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: {
                temples: true,
                adminUnits: true
              }
            }
          }
        }
      }
    });

    if (!stateRecord) {
      return NextResponse.json(
        { error: "State not found", requestedState: state },
        { status: 404 }
      );
    }

    const districtsWithStats = stateRecord.districts.map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      code: d.officialCode,
      censusCode: null,
      adminUnitCount: d._count.adminUnits,
      templeCount: d._count.temples
    }));

    return NextResponse.json({
      success: true,
      state: {
        id: stateRecord.id,
        code: stateRecord.code,
        name: stateRecord.name,
        slug: stateRecord.slug,
        type: stateRecord.type,
        capital: stateRecord.capital,
        adminUnitTerm: stateRecord.adminUnitTerm,
        primaryEndowmentsBoard: stateRecord.source
      },
      totalDistricts: districtsWithStats.length,
      districts: districtsWithStats
    });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching state districts hierarchy:", error);
    return NextResponse.json(
      { error: "Internal server error", details },
      { status: 500 }
    );
  }
}
