import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db/client";
import { TEMPLES, getState } from "@/lib/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q")?.trim().toLowerCase();
  const state = searchParams.get("state")?.trim().toUpperCase();

  const prisma = getPrisma();
  if (prisma) {
    try {
      const temples = await prisma.temple.findMany({
        where: {
          AND: [
            state ? { stateCode: state } : {},
            search
              ? {
                  OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { nameLocal: { contains: search, mode: "insensitive" } },
                    { mainDeity: { contains: search, mode: "insensitive" } },
                    { district: { name: { contains: search, mode: "insensitive" } } },
                  ],
                }
              : {},
          ],
        },
        select: {
          id: true,
          slug: true,
          name: true,
          nameLocal: true,
          stateCode: true,
          mainDeity: true,
          latitude: true,
          longitude: true,
          district: { select: { name: true } },
          locality: { select: { name: true } },
          state: { select: { name: true, slug: true } },
        },
        orderBy: [{ stateCode: "asc" }, { name: "asc" }],
      });

      if (temples.length > 0) {
        return NextResponse.json(
          temples.map((t) => ({
            id: t.slug, // Use slug for stable URL routing and resolution
            templeId: t.id,
            slug: t.slug,
            name: t.name,
            nameLocal: t.nameLocal || undefined,
            stateCode: t.stateCode,
            stateName: t.state?.name || t.stateCode,
            district: t.district?.name || "",
            location: t.locality?.name || t.district?.name || t.state?.name || "",
            deity: t.mainDeity || "Sacred Deity",
            latitude: t.latitude,
            longitude: t.longitude,
            href: `/temples/${t.state?.slug || t.stateCode.toLowerCase()}/${t.slug}`,
          }))
        );
      }
    } catch (e) {
      console.error("[temples-lite] Failed querying PostgreSQL temples, falling back to static registry", e);
    }
  }

  // Fallback to static registry
  return NextResponse.json(
    TEMPLES.map((t) => ({
      id: t.slug,
      templeId: t.id,
      slug: t.slug,
      name: t.name,
      stateCode: t.stateCode,
      stateName: getState(t.stateCode)?.name || t.stateCode,
      district: t.district,
      location: t.location,
      deity: t.mainDeity,
      latitude: t.latitude,
      longitude: t.longitude,
      href: `/temples/${getState(t.stateCode)?.slug ?? ""}/${t.slug}`,
    }))
  );
}