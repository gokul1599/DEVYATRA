import { NextResponse } from "next/server";
import { TEMPLES, getState } from "@/lib/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    TEMPLES.map((t) => ({
      id: t.slug,
      slug: t.slug,
      name: t.name,
      stateCode: t.stateCode,
      district: t.district,
      location: t.location,
      deity: t.mainDeity,
      href: `/temples/${getState(t.stateCode)?.slug ?? ""}/${t.slug}`,
    }))
  );
}