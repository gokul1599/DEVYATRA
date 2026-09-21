import { NextRequest, NextResponse } from "next/server";
import { getTemple } from "@/lib/registry";
import { addReport } from "@/lib/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOPICS = ["Timings", "Darshan fee", "Facilities", "Booking link", "Festival dates", "Location", "Other"];

export async function POST(req: NextRequest) {
  let body: { templeId?: string; topic?: string; detail?: string; contact?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.templeId || !getTemple(body.templeId))
    return NextResponse.json({ error: "Unknown temple" }, { status: 404 });
  if (!body.topic || !TOPICS.includes(body.topic))
    return NextResponse.json({ error: "Pick a topic" }, { status: 400 });
  if (!body.detail?.trim() || body.detail.trim().length < 10)
    return NextResponse.json({ error: "Describe the correction (at least 10 characters)" }, { status: 400 });

  const report = addReport({
    templeId: body.templeId,
    topic: body.topic,
    detail: body.detail.trim(),
    contact: body.contact?.trim() || undefined,
  });
  return NextResponse.json({ ok: true, id: report.id }, { status: 201 });
}