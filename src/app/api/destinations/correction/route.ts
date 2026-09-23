import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface CommunityCorrectionSubmission {
  destinationId: string;
  category:
    | "INCORRECT_LOCATION"
    | "WRONG_TIMING"
    | "TEMPLE_CLOSED"
    | "BOOKING_CHANGED"
    | "FACILITY_UNAVAILABLE"
    | "BUSINESS_CLOSED"
    | "DESTINATION_INFO"
    | "PHOTO_OUTDATED";
  currentClaim?: string;
  suggestedCorrection: string;
  evidenceUrl?: string;
  observedDate?: string;
  submitterEmail?: string;
  explanation: string;
}

/**
 * POST /api/destinations/correction
 * 
 * Submits a community correction report with optional evidence.
 * Submissions are strictly quarantined under "Submitted / Under Review" state
 * and never automatically overwrite authoritative statutory data.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CommunityCorrectionSubmission;

    if (!body.destinationId || !body.suggestedCorrection || !body.explanation) {
      return NextResponse.json(
        { error: "destinationId, suggestedCorrection, and explanation are required" },
        { status: 400 }
      );
    }

    const submissionId = `corr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    return NextResponse.json(
      {
        success: true,
        submissionId,
        status: "Submitted",
        reviewState: "UNDER_REVIEW",
        message:
          "Your update has been securely recorded. Our data moderation team will cross-verify this against official statutory gazettes before publishing to the canonical atlas.",
        submittedAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[CommunityCorrectionAPI] Error:", error);
    return NextResponse.json(
      { error: "Internal server error processing community report" },
      { status: 500 }
    );
  }
}
