import { NextResponse } from "next/server";
import { getLivePlatformMetrics } from "@/lib/telemetry/metrics";

export const runtime = "nodejs";
export const revalidate = 60; // cache for 60s at edge

export async function GET() {
  const metrics = await getLivePlatformMetrics();
  return NextResponse.json(metrics, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
