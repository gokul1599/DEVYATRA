import { NextResponse } from "next/server";
import { getPlatformStats } from "@/lib/stats";

export const runtime = "nodejs";
export const revalidate = 60; // Cache for 60s at edge

export async function GET() {
  const stats = await getPlatformStats();
  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
