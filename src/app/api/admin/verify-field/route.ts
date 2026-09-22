import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByToken, SESSION_COOKIE } from "@/lib/auth";
import { getPrisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const store = await cookies();
  const user = getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "Database service unavailable" }, { status: 503 });
  }

  let body: {
    templeId: string;
    field: string;
    value?: string | number | boolean | { lat: number; lng: number };
    verified: boolean;
    sourceName?: string;
    sourceUrl?: string;
    notes?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { templeId, field, value, verified, sourceName, sourceUrl, notes } = body;
  if (!templeId || !field) {
    return NextResponse.json({ error: "templeId and field are required" }, { status: 400 });
  }

  const temple = await prisma.temple.findUnique({
    where: { id: templeId },
    select: { id: true, identifier: true, name: true, verificationStatus: true, dataConfidence: true },
  });

  if (!temple) {
    return NextResponse.json({ error: "Temple not found" }, { status: 404 });
  }

  // Map field verification to temple updates if applicable
  const updateData: Record<string, string | number | boolean | Date> = { lastVerifiedAt: new Date() };
  if (field === "status" && typeof value === "string") {
    updateData.verificationStatus = value;
  } else if (field === "coordinates" && typeof value === "object" && value && "lat" in value && "lng" in value) {
    updateData.latitude = value.lat;
    updateData.longitude = value.lng;
    updateData.isCentroidFallback = false;
  } else if (field === "officialWebsite" && typeof value === "string") {
    updateData.officialWebsite = value;
  } else if (field === "mainDeity" && typeof value === "string") {
    updateData.mainDeity = value;
  } else if (field === "nameLocal" && typeof value === "string") {
    updateData.nameLocal = value;
  }

  if (verified) {
    updateData.dataConfidence = Math.min(100, (temple.dataConfidence || 50) + 5);
  }

  await prisma.temple.update({
    where: { id: templeId },
    data: updateData,
  });

  // Create audit log record
  const audit = await prisma.auditResult.create({
    data: {
      templeId,
      templeIdentifier: temple.identifier,
      templeName: temple.name,
      fieldChecked: field,
      existingValue: typeof value === "object" ? JSON.stringify(value) : String(value ?? ""),
      sourceFound: sourceName || `Verified by Admin (${user.email})`,
      sourceUrl: sourceUrl || null,
      verified,
      recommendedAction: notes || "Field verified via Admin Workbench",
      severity: "LOW",
      status: "RESOLVED",
    },
  });

  return NextResponse.json({
    success: true,
    templeId,
    auditId: audit.id,
    updatedConfidence: updateData.dataConfidence,
  });
}
