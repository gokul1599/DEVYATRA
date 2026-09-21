import { NextRequest, NextResponse } from "next/server";
import { search } from "@/lib/search";
import { getState } from "@/lib/registry";

export const runtime = "nodejs";

export function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const limit = Math.max(1, Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 6), 12));
  const res = search(q, limit);
  return NextResponse.json({
    temples: res.temples.map((t) => {
      const st = getState(t.stateCode);
      return {
        slug: t.slug,
        name: t.name,
        nameLocal: t.nameLocal ?? null,
        stateSlug: st?.slug ?? "",
        location: t.location,
        district: t.district,
        href: `/temples/${st?.slug}/${t.slug}`,
      };
    }),
    locations: res.locations,
    deities: res.deities,
    festivals: res.festivals,
  });
}