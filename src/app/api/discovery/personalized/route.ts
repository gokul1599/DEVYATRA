import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByToken, SESSION_COOKIE } from "@/lib/auth";
import { getPersonalizedRecommendations } from "@/lib/discovery/personalized";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const store = await cookies();
  const user = getUserByToken(store.get(SESSION_COOKIE)?.value);

  const { searchParams } = new URL(req.url);
  const deityParam = searchParams.get("deity");
  const traditionParam = searchParams.get("tradition");
  const accessibilityParam = searchParams.get("accessibility") === "true";
  const travelStyleParam = searchParams.get("travelStyle") as "solo" | "family" | "elderly" | "friends" | null;

  const prefs = {
    ...(user?.preferences || {}),
    deities: deityParam ? [deityParam] : (user?.preferences?.deities || []),
    traditions: traditionParam ? [traditionParam] : (user?.preferences?.traditions || []),
    accessibilityNeeds: accessibilityParam || (user?.preferences?.accessibilityNeeds ?? false),
    travelStyle: travelStyleParam || (user?.preferences?.travelStyle ?? "family"),
  };

  const recommendations = getPersonalizedRecommendations(prefs, 8);

  return NextResponse.json({
    success: true,
    recommendations,
  });
}
