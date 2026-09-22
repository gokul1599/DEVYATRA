import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: "Database service unavailable" },
        { status: 503 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Temple identifier required" }, { status: 400 });
    }

    const temple = await prisma.temple.findFirst({
      where: {
        OR: [
          { id },
          { identifier: id },
          { slug: id }
        ]
      },
      include: {
        state: true,
        district: true,
        adminUnit: true,
        timings: true,
        bookings: true,
        festivals: true,
        translations: true,
        sources: true
      }
    });

    if (!temple) {
      return NextResponse.json(
        { error: "Temple not found", requestedIdentifier: id },
        { status: 404 }
      );
    }

    const unverifiedWarnings: string[] = [];

    // Check timings verification
    const verifiedTimings = temple.timings.filter(
      (t) => t.verificationStatus === "VERIFIED" && t.openTime && t.closeTime
    );
    if (verifiedTimings.length === 0) {
      unverifiedWarnings.push(
        "Darshan and temple opening timings are UNVERIFIED. Do not state specific morning/evening opening or closing hours as confirmed facts. Advise the pilgrim to contact the temple or local administration directly."
      );
    }

    // Check booking verification
    const verifiedBookings = temple.bookings.filter(
      (b) => b.onlineAvailable && b.bookingUrl
    );
    if (verifiedBookings.length === 0) {
      unverifiedWarnings.push(
        "No official online booking or ticket portal is verified for this temple. Do not invent ticket URLs or claim online VIP darshan is available."
      );
    }

    // Check coordinates centroid fallback
    if (temple.isCentroidFallback) {
      unverifiedWarnings.push(
        "Coordinates are an administrative centroid fallback and do not pinpoint the actual physical temple entrance. Do not provide turn-by-turn or hyper-local navigation instructions based on these coordinates."
      );
    }

    // Check festivals boilerplate
    const verifiedFestivals = temple.festivals.filter(
      (f) => f.verificationStatus !== "NEEDS_VERIFICATION"
    );
    if (verifiedFestivals.length === 0 && temple.festivals.length > 0) {
      unverifiedWarnings.push(
        "Festivals listed for this temple are based on general regional calendar templates and need verification with the local temple trust."
      );
    }

    return NextResponse.json({
      success: true,
      groundingInstructions: {
        principle: "Ground strictly on verified facts. Never extrapolate or hallucinate unverified details.",
        rules: [
          "1. Distinguish documented archaeological/epigraphical history from scriptural belief (Sthala Purana).",
          "2. If timings are not verified, explicitly inform the pilgrim that exact hours could not be verified from an official devasthanam source.",
          "3. Never provide synthetic or unverified ticketing links.",
          "4. Do not present centroid fallback coordinates as exact temple premises."
        ]
      },
      verifiedFacts: {
        id: temple.id,
        identifier: temple.identifier,
        name: temple.name,
        nameLocal: temple.nameLocal,
        mainDeity: temple.mainDeity,
        deities: temple.deities,
        tradition: temple.tradition,
        state: temple.state?.name || temple.stateCode,
        district: temple.district?.name,
        adminUnit: temple.adminUnit?.name,
        address: temple.address,
        architecture: temple.architecture,
        historicalPeriod: temple.historicalPeriod,
        establishedYear: temple.establishedYear,
        asiMonumentId: temple.asiMonumentId,
        verifiedTimings: verifiedTimings.map((t) => ({
          day: t.day,
          label: t.label,
          openTime: t.openTime,
          closeTime: t.closeTime
        })),
        verifiedBookings: verifiedBookings.map((b) => ({
          bookingType: b.bookingType,
          bookingUrl: b.bookingUrl,
          price: b.price
        })),
        verifiedFestivals: verifiedFestivals.map((f) => ({
          name: f.name,
          dateLabel: f.dateLabel,
          description: f.description
        })),
        translations: temple.translations.map((tr) => ({
          language: tr.languageCode,
          name: tr.translatedName
        }))
      },
      unverifiedWarnings,
      sources: temple.sources.map((s) => ({
        type: s.sourceType,
        name: s.sourceName,
        url: s.sourceUrl,
        verificationStatus: s.verificationStatus
      })),
      confidenceScore: temple.dataConfidence
    });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating AI temple context:", error);
    return NextResponse.json(
      { error: "Internal server error", details },
      { status: 500 }
    );
  }
}
