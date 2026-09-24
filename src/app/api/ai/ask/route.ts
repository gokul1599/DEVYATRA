import { NextRequest, NextResponse } from "next/server";
import { askGroqTempleCompanion } from "@/lib/ai/groq";
import { sanitizeAiInput } from "@/lib/ai/guard";
import { getTemple } from "@/lib/registry";
import { resolveTemple } from "@/lib/db/directory";

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

  // Sanitize against prompt injection / override patterns
  const check = sanitizeAiInput(question);
  if (!check.isSafe) {
    return NextResponse.json(
      {
        answer: "I can only answer questions regarding verified temple timings, history, festivals, and booking logistics.",
        warning: check.reason,
      },
      { status: 200 }
    );
  }

  const temple = (await resolveTemple(templeId)) ?? getTemple(templeId);
  if (!temple) {
    return NextResponse.json({ error: "Unknown temple" }, { status: 404 });
  }

  const answer = await askGroqTempleCompanion(temple, check.sanitizedText, lang ?? "en");
  return NextResponse.json({
    answer: answer.text,
    facts: answer.facts,
    provider: answer.provider,
  });
}