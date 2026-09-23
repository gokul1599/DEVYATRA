import { NextRequest, NextResponse } from "next/server";
import { buildMasterDestinationIntelligence } from "@/lib/intelligence/context-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/destinations/[id]/intelligence
 * 
 * Returns canonical Master Destination Intelligence for any temple / destination.
 * Unites access points, structured address, visit logistics, three-state accessibility,
 * weather, calendar, booking, emergency safety, source ledger, and temporal changes.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing destination identifier" }, { status: 400 });
    }

    const intelligence = await buildMasterDestinationIntelligence(id);

    if (!intelligence) {
      return NextResponse.json(
        { error: "No indexed destination found matching this identifier" },
        { status: 404 }
      );
    }

    return NextResponse.json(intelligence, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[DestinationIntelligenceAPI] Error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching destination intelligence" },
      { status: 500 }
    );
  }
}
