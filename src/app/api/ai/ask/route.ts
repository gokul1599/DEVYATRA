import { NextRequest, NextResponse } from "next/server";
import { askCompanion } from "@/lib/ai/engine";
import { getTemple } from "@/lib/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { templeId?: string; question?: string; lang?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { templeId, question, lang } = body;
  if (!templeId || !question?.trim()) {
    return NextResponse.json({ error: "templeId and question are required" }, { status: 400 });
  }
  const temple = getTemple(templeId);
  if (!temple) {
    return NextResponse.json({ error: "Unknown temple" }, { status: 404 });
  }
  const answer = askCompanion(temple, question, lang ?? "en");
  return NextResponse.json({ answer: answer.text });
}