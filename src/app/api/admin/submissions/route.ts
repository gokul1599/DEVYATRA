import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByToken, SESSION_COOKIE } from "@/lib/auth";
import { getPrisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const store = await cookies();
  const user = await getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "Database service unavailable" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "SUBMITTED";

  const submissions = await prisma.userSubmission.findMany({
    where: { status },
    orderBy: { submittedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ submissions });
}

export async function PATCH(req: NextRequest) {
  const store = await cookies();
  const user = await getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "Database service unavailable" }, { status: 503 });
  }

  let body: {
    id: string;
    action: "APPROVE" | "REJECT";
    rejectionReason?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { id, action, rejectionReason } = body;
  if (!id || !action) {
    return NextResponse.json({ error: "id and action are required" }, { status: 400 });
  }

  const newStatus = action === "APPROVE" ? "VERIFIED" : "REJECTED";

  const updated = await prisma.userSubmission.update({
    where: { id },
    data: {
      status: newStatus,
      rejectionReason: rejectionReason || null,
      reviewedAt: new Date(),
      reviewedBy: user.email,
    },
  });

  // Record audit trail
  await prisma.auditResult.create({
    data: {
      fieldChecked: "User_Submission",
      existingValue: `${updated.templeName} (${updated.districtName}, ${updated.stateName})`,
      sourceFound: `Admin Review by ${user.email}`,
      verified: action === "APPROVE",
      recommendedAction: `${action} submission ${id}`,
      severity: "LOW",
      status: "RESOLVED",
    },
  });

  return NextResponse.json({ success: true, submission: updated });
}
