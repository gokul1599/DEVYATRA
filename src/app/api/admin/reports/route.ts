import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeFileSync } from "fs";
import path from "path";
import { getUserByToken, SESSION_COOKIE } from "@/lib/auth";
import { readReports, type ReportRecord } from "@/lib/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID = ["open", "confirmed", "resolved", "rejected"];

export async function PATCH(req: NextRequest) {
  const store = await cookies();
  const user = await getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { id?: string; status?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.id || !body.status || !VALID.includes(body.status))
    return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const all = readReports();
  const idx = all.findIndex((r) => r.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  all[idx] = { ...all[idx], status: body.status as ReportRecord["status"] };
  writeFileSync(path.join(process.cwd(), ".data", "reports.json"), JSON.stringify(all, null, 2));
  return NextResponse.json({ ok: true });
}