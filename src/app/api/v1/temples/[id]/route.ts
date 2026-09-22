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
        locality: true,
        timings: true,
        bookings: true,
        darshans: true,
        sevas: true,
        festivals: true,
        timeline: true,
        whyFamous: true,
        nearby: true,
        translations: true,
        sources: true,
        auditResults: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!temple) {
      return NextResponse.json(
        { error: "Temple not found", requestedIdentifier: id },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: temple.id,
        identifier: temple.identifier,
        slug: temple.slug,
        name: temple.name,
        nameLocal: temple.nameLocal,
        alternativeNames: temple.alternativeNames,
        description: temple.description,
        mainDeity: temple.mainDeity,
        deities: temple.deities,
        templeType: temple.templeType,
        tradition: temple.tradition,
        architecture: temple.architecture,
        historicalPeriod: temple.historicalPeriod,
        establishedYear: temple.establishedYear,
        coordinates: {
          latitude: temple.latitude,
          longitude: temple.longitude,
          isCentroidFallback: temple.isCentroidFallback
        },
        address: temple.address,
        administrative: {
          country: "India",
          state: temple.state?.name || temple.stateCode,
          stateCode: temple.stateCode,
          district: temple.district?.name,
          districtSlug: temple.district?.slug,
          adminUnit: temple.adminUnit
            ? { name: temple.adminUnit.name, type: temple.adminUnit.type }
            : null,
          locality: temple.locality?.name
        },
        contact: {
          officialWebsite: temple.officialWebsite,
          officialPhone: temple.officialPhone,
          officialEmail: temple.officialEmail,
          googleMapsUrl: temple.googleMapsUrl
        },
        verification: {
          status: temple.verificationStatus,
          confidenceScore: temple.dataConfidence,
          googlePlaceId: temple.googlePlaceId,
          googlePlaceVerificationStatus: temple.googlePlaceVerificationStatus,
          asiMonumentId: temple.asiMonumentId,
          lastVerifiedAt: temple.lastVerifiedAt
        },
        timings: temple.timings,
        bookings: temple.bookings,
        festivals: temple.festivals,
        darshans: temple.darshans,
        sevas: temple.sevas,
        timeline: temple.timeline,
        whyFamous: temple.whyFamous,
        nearby: temple.nearby,
        translations: temple.translations,
        sources: temple.sources,
        auditHistory: temple.auditResults
      }
    });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching temple details:", error);
    return NextResponse.json(
      { error: "Internal server error", details },
      { status: 500 }
    );
  }
}
