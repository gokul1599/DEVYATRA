import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getUserByToken, SESSION_COOKIE } from "@/lib/auth";
import { getPrisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

const DUPLICATES_FILE = path.join(process.cwd(), "data", "audit", "detected_duplicates.json");

export async function GET() {
  const store = await cookies();
  const user = await getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!existsSync(DUPLICATES_FILE)) {
    return NextResponse.json({ candidatePairs: [] });
  }

  try {
    const raw = readFileSync(DUPLICATES_FILE, "utf-8");
    const pairs = JSON.parse(raw);
    return NextResponse.json({ candidatePairs: pairs });
  } catch {
    return NextResponse.json({ candidatePairs: [] });
  }
}

export async function POST(req: NextRequest) {
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
    temple1Id: string;
    temple2Id: string;
    action: "KEEP_SEPARATE" | "MARK_DUPLICATE" | "DISMISS";
    notes?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { temple1Id, temple2Id, action, notes } = body;
  if (!temple1Id || !temple2Id || !action) {
    return NextResponse.json({ error: "temple1Id, temple2Id, and action are required" }, { status: 400 });
  }

  // Record action into AuditResult
  const audit = await prisma.auditResult.create({
    data: {
      templeId: temple1Id,
      fieldChecked: "Duplicate_Detection",
      existingValue: `Comparison with ${temple2Id}`,
      sourceFound: `Admin Review (${user.email})`,
      verified: action === "MARK_DUPLICATE" || action === "KEEP_SEPARATE",
      recommendedAction: `${action}: ${notes || "No notes provided"}`,
      severity: action === "MARK_DUPLICATE" ? "HIGH" : "LOW",
      status: "RESOLVED",
    },
  });

  // If dismissed or resolved, remove or mark in local JSON
  if (existsSync(DUPLICATES_FILE)) {
    try {
      const raw = readFileSync(DUPLICATES_FILE, "utf-8");
      const pairs = JSON.parse(raw) as Array<{ temple1: { id: string }; temple2: { id: string } }>;
      const filtered = pairs.filter(
        (p) =>
          !(
            (p.temple1.id === temple1Id && p.temple2.id === temple2Id) ||
            (p.temple1.id === temple2Id && p.temple2.id === temple1Id)
          )
      );
      writeFileSync(DUPLICATES_FILE, JSON.stringify(filtered, null, 2), "utf-8");
    } catch {
      // Best-effort file update
    }
  }

  return NextResponse.json({
    success: true,
    action,
    auditId: audit.id,
  });
}
