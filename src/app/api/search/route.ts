import { NextRequest, NextResponse } from "next/server";
import { search } from "@/lib/search";
import { getState } from "@/lib/registry";
import { getPrisma } from "@/lib/db/client";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const limit = Math.max(1, Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 8), 16));

  if (!q) {
    return NextResponse.json({ temples: [], locations: [], deities: [], festivals: [] });
  }

  // 1. Initial fast local search
  const localRes = search(q, limit);
  const matchedSlugs = new Set<string>();

  const outputTemples = localRes.temples.map((t) => {
    matchedSlugs.add(t.slug);
    const st = getState(t.stateCode);
    return {
      slug: t.slug,
      name: t.name,
      nameLocal: t.nameLocal ?? null,
      stateSlug: st?.slug ?? t.stateCode.toLowerCase(),
      location: t.location,
      district: t.district,
      href: `/temples/${st?.slug ?? t.stateCode.toLowerCase()}/${t.slug}`,
    };
  });

  // 2. Query Neon PostgreSQL for broad catalog & native script matches
  const prisma = getPrisma();
  const outputPlaces: Array<{
    id: string;
    name: string;
    category: string;
    city: string | null;
    district: string | null;
    state: string | null;
    sourceType: string | null;
  }> = [];

  if (prisma) {
    try {
      // Check for composite "near <place>" pattern
      const nearMatch = q.match(/(?:temples?\s+(?:near|around)\s+|places?\s+(?:near|around)\s+|near\s+|around\s+)(.+)/i);
      const targetQuery = nearMatch ? nearMatch[1].trim() : q;

      // 2a. Query Famous Places
      const dbPlaces = await prisma.famousPlace.findMany({
        where: {
          OR: [
            { name: { contains: targetQuery, mode: "insensitive" } },
            { nativeName: { contains: targetQuery, mode: "insensitive" } },
            { category: { contains: targetQuery, mode: "insensitive" } },
            { subcategory: { contains: targetQuery, mode: "insensitive" } },
            { city: { contains: targetQuery, mode: "insensitive" } },
            { district: { contains: targetQuery, mode: "insensitive" } },
          ],
        },
        take: 6,
        include: {
          templeLinks: {
            include: {
              temple: {
                select: {
                  slug: true,
                  name: true,
                  nameLocal: true,
                  stateCode: true,
                  address: true,
                  district: { select: { name: true, slug: true } },
                  state: { select: { name: true, slug: true } },
                },
              },
            },
            take: 4,
          },
        },
      });

      for (const p of dbPlaces) {
        outputPlaces.push({
          id: p.id,
          name: p.name,
          category: p.category,
          city: p.city,
          district: p.district,
          state: p.state,
          sourceType: p.sourceType,
        });

        // Boost temples linked to this famous place
        for (const link of p.templeLinks) {
          const d = link.temple;
          if (!matchedSlugs.has(d.slug)) {
            matchedSlugs.add(d.slug);
            const stateSlug = d.state?.slug || getState(d.stateCode)?.slug || d.stateCode.toLowerCase();
            outputTemples.push({
              slug: d.slug,
              name: d.name,
              nameLocal: d.nameLocal,
              stateSlug,
              location: `${d.address || d.district?.name || ""} (Near ${p.name})`,
              district: d.district?.name || "",
              href: `/temples/${stateSlug}/${d.slug}`,
            });
          }
        }
      }

      // 2b. Standard temple search
      if (outputTemples.length < limit) {
        const dbMatches = await prisma.temple.findMany({
          where: {
            OR: [
              { name: { contains: targetQuery, mode: "insensitive" } },
              { nameLocal: { contains: targetQuery, mode: "insensitive" } },
              { mainDeity: { contains: targetQuery, mode: "insensitive" } },
              {
                translations: {
                  some: {
                    translatedName: { contains: targetQuery, mode: "insensitive" },
                  },
                },
              },
            ],
          },
          take: limit,
          select: {
            slug: true,
            name: true,
            nameLocal: true,
            stateCode: true,
            address: true,
            district: { select: { name: true, slug: true } },
            state: { select: { name: true, slug: true } },
          },
        });

        for (const d of dbMatches) {
          if (!matchedSlugs.has(d.slug)) {
            matchedSlugs.add(d.slug);
            const stateSlug = d.state?.slug || getState(d.stateCode)?.slug || d.stateCode.toLowerCase();
            outputTemples.push({
              slug: d.slug,
              name: d.name,
              nameLocal: d.nameLocal,
              stateSlug,
              location: d.address || d.district?.name || "",
              district: d.district?.name || "",
              href: `/temples/${stateSlug}/${d.slug}`,
            });
          }
          if (outputTemples.length >= limit) break;
        }
      }
    } catch {
      // Graceful fallback to local results
    }
  }

  return NextResponse.json({
    temples: outputTemples.slice(0, limit),
    locations: localRes.locations,
    deities: localRes.deities,
    festivals: localRes.festivals,
    places: outputPlaces,
  });
}