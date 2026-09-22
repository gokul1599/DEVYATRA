import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db/client";
import { Prisma } from "@/generated/prisma/client";

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
    const state = searchParams.get("state");
    const district = searchParams.get("district");
    const administrativeUnit = searchParams.get("administrativeUnit") || searchParams.get("adminUnit");
    const locality = searchParams.get("locality");
    const deity = searchParams.get("deity");
    const tradition = searchParams.get("tradition");
    const verificationStatus = searchParams.get("verificationStatus");
    const verifiedOnly = searchParams.get("verifiedOnly") === "true";
    const onlineBooking = searchParams.get("onlineBooking") === "true" || searchParams.get("hasBooking") === "true";
    const excludeCentroid = searchParams.get("excludeCentroid") === "true";
    const search = searchParams.get("search")?.trim() || searchParams.get("q")?.trim();

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "24", 10)));
    const skip = (page - 1) * limit;

    const andConditions: Prisma.TempleWhereInput[] = [];

    // By default, include all 1,655 indexed records. Only exclude if excludeCentroid=true
    if (excludeCentroid) {
      andConditions.push({ isCentroidFallback: false });
    }

    if (state) {
      const s = state.trim();
      if (s.length === 2) {
        andConditions.push({ stateCode: { equals: s.toUpperCase() } });
      } else {
        andConditions.push({
          OR: [
            { stateCode: { equals: s.toUpperCase() } },
            { state: { slug: { equals: s.toLowerCase() } } },
            { state: { name: { equals: s, mode: "insensitive" } } },
            { state: { name: { startsWith: s, mode: "insensitive" } } }
          ]
        });
      }
    }

    if (district) {
      andConditions.push({
        district: {
          OR: [
            { slug: { equals: district.toLowerCase() } },
            { name: { contains: district, mode: "insensitive" } }
          ]
        }
      });
    }

    if (administrativeUnit) {
      andConditions.push({
        adminUnit: {
          OR: [
            { slug: { equals: administrativeUnit.toLowerCase() } },
            { name: { contains: administrativeUnit, mode: "insensitive" } }
          ]
        }
      });
    }

    if (locality) {
      andConditions.push({
        locality: {
          OR: [
            { slug: { equals: locality.toLowerCase() } },
            { name: { contains: locality, mode: "insensitive" } }
          ]
        }
      });
    }

    if (deity) {
      andConditions.push({
        OR: [
          { mainDeity: { contains: deity, mode: "insensitive" } },
          { deities: { has: deity } }
        ]
      });
    }

    if (tradition) {
      andConditions.push({ tradition: { has: tradition } });
    }

    if (verificationStatus) {
      andConditions.push({ verificationStatus: { equals: verificationStatus } });
    } else if (verifiedOnly) {
      andConditions.push({
        verificationStatus: {
          in: ["VERIFIED_OFFICIAL", "VERIFIED_TRUST", "VERIFIED_GOVERNMENT", "VERIFIED_SOURCE"]
        }
      });
    }

    if (onlineBooking) {
      andConditions.push({
        bookings: {
          some: {
            onlineAvailable: true
          }
        }
      });
    }

    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { nameLocal: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { mainDeity: { contains: search, mode: "insensitive" } },
          { identifier: { contains: search, mode: "insensitive" } }
        ]
      });
    }

    const where: Prisma.TempleWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const [total, temples] = await Promise.all([
      prisma.temple.count({ where }),
      prisma.temple.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { dataConfidence: "desc" },
          { name: "asc" }
        ],
        include: {
          state: { select: { code: true, name: true, slug: true } },
          district: { select: { name: true, slug: true } },
          adminUnit: { select: { name: true, type: true } },
          locality: { select: { name: true } },
          translations: {
            select: {
              languageCode: true,
              scriptCode: true,
              translatedName: true,
              isCanonicalNative: true
            }
          },
          sources: {
            select: {
              sourceType: true,
              sourceName: true,
              sourceUrl: true,
              verificationStatus: true
            }
          },
          timings: {
            select: {
              day: true,
              label: true,
              openTime: true,
              closeTime: true,
              verificationStatus: true
            }
          },
          bookings: {
            select: {
              bookingType: true,
              onlineAvailable: true,
              price: true,
              bookingUrl: true,
              verificationStatus: true
            }
          }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: temples.map((t) => ({
        id: t.id,
        identifier: t.identifier,
        slug: t.slug,
        name: t.name,
        nameLocal: t.nameLocal,
        alternativeNames: t.alternativeNames,
        description: t.description,
        mainDeity: t.mainDeity,
        deities: t.deities,
        templeType: t.templeType,
        tradition: t.tradition,
        architecture: t.architecture,
        historicalPeriod: t.historicalPeriod,
        establishedYear: t.establishedYear,
        coordinates: {
          latitude: t.latitude,
          longitude: t.longitude,
          isCentroidFallback: t.isCentroidFallback
        },
        address: t.address,
        administrative: {
          state: t.state?.name || t.stateCode,
          stateCode: t.stateCode,
          district: t.district?.name,
          adminUnit: t.adminUnit ? `${t.adminUnit.name} (${t.adminUnit.type})` : null,
          locality: t.locality?.name
        },
        contact: {
          officialWebsite: t.officialWebsite,
          officialPhone: t.officialPhone,
          officialEmail: t.officialEmail,
          googleMapsUrl: t.googleMapsUrl
        },
        verification: {
          status: t.verificationStatus,
          confidenceScore: t.dataConfidence,
          googlePlaceVerificationStatus: t.googlePlaceVerificationStatus,
          asiMonumentId: t.asiMonumentId,
          lastVerifiedAt: t.lastVerifiedAt
        },
        translations: t.translations,
        sources: t.sources,
        timings: t.timings,
        bookings: t.bookings
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1
      }
    });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching temples:", error);
    return NextResponse.json(
      { error: "Internal server error", details },
      { status: 500 }
    );
  }
}
