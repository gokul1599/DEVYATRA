import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db/client";
import { Prisma } from "@/generated/prisma/client";
import { evaluateDuplicate } from "@/lib/importer/deduplicate";

export const dynamic = "force-dynamic";

// India bounding box
const INDIA_BOUNDS = {
  minLat: 6.0,
  maxLat: 37.5,
  minLng: 68.0,
  maxLng: 97.5
};

interface DuplicateNotice {
  existingTempleId: string;
  existingName: string;
  classification: string;
  confidenceScore: number;
  distanceMeters: number | null;
}

export async function POST(req: NextRequest) {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: "Database service unavailable" },
        { status: 503 }
      );
    }

    const body = await req.json();
    const {
      templeName,
      templeNameLocal,
      stateName,
      districtName,
      adminUnitName,
      localityName,
      latitude,
      longitude,
      mainDeity,
      description,
      sourceProof,
      contributorEmail,
      contributorName
    } = body;

    // 1. Validation
    if (!templeName || typeof templeName !== "string" || templeName.trim().length < 3) {
      return NextResponse.json(
        { error: "Validation failed", message: "Temple name must be at least 3 characters long" },
        { status: 400 }
      );
    }

    if (!stateName || typeof stateName !== "string") {
      return NextResponse.json(
        { error: "Validation failed", message: "State name is required" },
        { status: 400 }
      );
    }

    if (!districtName || typeof districtName !== "string") {
      return NextResponse.json(
        { error: "Validation failed", message: "District name is required" },
        { status: 400 }
      );
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "Validation failed", message: "Valid numeric latitude and longitude are required" },
        { status: 400 }
      );
    }

    if (
      lat < INDIA_BOUNDS.minLat ||
      lat > INDIA_BOUNDS.maxLat ||
      lng < INDIA_BOUNDS.minLng ||
      lng > INDIA_BOUNDS.maxLng
    ) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: `Coordinates (${lat}, ${lng}) lie outside the geographical bounds of India (${INDIA_BOUNDS.minLat}°N-${INDIA_BOUNDS.maxLat}°N, ${INDIA_BOUNDS.minLng}°E-${INDIA_BOUNDS.maxLng}°E)`
        },
        { status: 400 }
      );
    }

    // 2. Duplicate Detection against existing database
    const nearbyTemples = await prisma.temple.findMany({
      where: {
        latitude: { gte: lat - 0.05, lte: lat + 0.05 },
        longitude: { gte: lng - 0.05, lte: lng + 0.05 }
      },
      select: {
        id: true,
        name: true,
        alternativeNames: true,
        mainDeity: true,
        latitude: true,
        longitude: true,
        stateCode: true
      },
      take: 10
    });

    let probableDuplicate: DuplicateNotice | null = null;
    for (const existing of nearbyTemples) {
      const match = evaluateDuplicate(
        {
          name: templeName,
          mainDeity,
          latitude: lat,
          longitude: lng
        },
        {
          id: existing.id,
          name: existing.name,
          alternativeNames: existing.alternativeNames,
          mainDeity: existing.mainDeity,
          latitude: existing.latitude,
          longitude: existing.longitude,
          stateCode: existing.stateCode
        }
      );

      if (match.classification === "EXACT_DUPLICATE" || match.classification === "PROBABLE_DUPLICATE") {
        probableDuplicate = {
          existingTempleId: existing.id,
          existingName: existing.name,
          classification: match.classification,
          confidenceScore: match.confidenceScore,
          distanceMeters: match.distanceMeters
        };
        break;
      }
    }

    // 3. Save Submission
    const submission = await prisma.userSubmission.create({
      data: {
        templeName: templeName.trim(),
        templeNameLocal: templeNameLocal?.trim() || null,
        stateName: stateName.trim(),
        districtName: districtName.trim(),
        adminUnitName: adminUnitName?.trim() || null,
        localityName: localityName?.trim() || null,
        latitude: lat,
        longitude: lng,
        mainDeity: mainDeity?.trim() || null,
        description: description?.trim() || null,
        sourceProof: sourceProof?.trim() || null,
        contributorEmail: contributorEmail?.trim() || null,
        contributorName: contributorName?.trim() || null,
        status: "SUBMITTED"
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Temple submission received for editorial verification",
        submissionId: submission.id,
        duplicateWarning: probableDuplicate
          ? {
              warning: "A similar temple already exists near these coordinates. The editorial team will cross-reference this record.",
              duplicateDetails: probableDuplicate
            }
          : null
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating user submission:", error);
    return NextResponse.json(
      { error: "Internal server error", details },
      { status: 500 }
    );
  }
}

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
    const status = searchParams.get("status") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.UserSubmissionWhereInput = status ? { status } : {};

    const [total, submissions] = await Promise.all([
      prisma.userSubmission.count({ where }),
      prisma.userSubmission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: "desc" }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching user submissions:", error);
    return NextResponse.json(
      { error: "Internal server error", details },
      { status: 500 }
    );
  }
}
