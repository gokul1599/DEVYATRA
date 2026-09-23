import { NextRequest, NextResponse } from "next/server";
import { buildMasterDestinationIntelligence } from "@/lib/intelligence/context-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/destinations/[id]/safety
 * 
 * Returns instant Safety & Emergency Mode context:
 * - National & Local Helplines (112, 108, 100, Temple Administration)
 * - Nearest Verified Hospital (with driving distance & directions)
 * - Nearest Pharmacy & Police Outpost
 * - Temple First Aid Post
 * - Safety advisory
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

    const intel = await buildMasterDestinationIntelligence(id);

    if (!intel) {
      return NextResponse.json(
        { error: "No indexed destination found for safety context" },
        { status: 404 }
      );
    }

    return NextResponse.json(intel.emergencySafety, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1200",
      },
    });
  } catch (error) {
    console.error("[SafetyIntelligenceAPI] Error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching safety intelligence" },
      { status: 500 }
    );
  }
}
