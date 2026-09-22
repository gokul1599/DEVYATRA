import "server-only";
import { getPrisma } from "./client";
import { LocationRow } from "@/lib/importer/types";
import { buildImportPlan } from "@/lib/importer/location-import";
import { normalizeName, slugify } from "@/lib/importer/normalize";

export interface LocationImportResult {
  jobId: string;
  status: string;
  stats: ReturnType<typeof buildImportPlan>["stats"];
}

/**
 * Persist a location plan (spec §7). Existing rows are matched by official code
 * first, then slug. Nothing is fabricated: states without an ISO code that are
 * not already known are logged and skipped rather than invented.
 */
export async function runLocationImport(
  rows: LocationRow[],
  opts: { source: string; knownTerms?: Record<string, string> } = { source: "unknown" },
): Promise<LocationImportResult> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("DATABASE_URL is not configured");

  const plan = buildImportPlan(rows, { knownTerms: opts.knownTerms });
  const job = await prisma.importJob.create({ data: { kind: "location:lgd", source: opts.source, status: "running", startedAt: new Date() } });

  const warnings: string[] = [...plan.stats.warnings];
  const log = async (level: string, message: string, entity?: string) => {
    warnings.push(message);
    await prisma.importLog.create({ data: { jobId: job.id, level, message, entity } });
  };

  try {
    await prisma.country.upsert({
      where: { code: "IN" },
      update: {},
      create: { code: "IN", iso3: "IND", slug: "india", name: "India" },
    });

    const stateIdByKey = new Map<string, string>();
    for (const s of plan.states) {
      const existing = await prisma.state.findFirst({
        where: { OR: [{ officialCode: s.officialCode ?? "__none__" }, { name: { equals: s.name, mode: "insensitive" } }, { slug: slugify(s.name) }] },
      });
      if (!existing) {
        await log("warn", `State "${s.name}" is not in the directory and has no ISO code; skipped (seed the curated states first)`, "state");
        continue;
      }
      await prisma.state.update({
        where: { id: existing.id },
        data: {
          officialCode: existing.officialCode ?? s.officialCode,
          adminUnitTerm: s.adminUnitTerm || existing.adminUnitTerm,
          nameLocal: existing.nameLocal ?? s.nameLocal,
          source: opts.source,
          lastVerifiedAt: new Date(),
        },
      });
      stateIdByKey.set(s.officialCode ?? `name:${normalizeName(s.name)}`, existing.id);
      stateIdByKey.set(normalizeName(s.name), existing.id);
    }

    for (const d of plan.districts) {
      const stateId = stateIdByKey.get(d.stateCode) ?? stateIdByKey.get(normalizeName(d.stateCode.replace(/^name:/, "")));
      if (!stateId) {
        await log("error", `District "${d.name}" skipped: parent state "${d.stateCode}" was not resolved`, "district");
        continue;
      }
      const slug = slugify(d.name);
      const existing = await prisma.district.findFirst({ where: { stateId, OR: [{ slug }, { officialCode: d.officialCode ?? "__none__" }] } });
      await prisma.district.upsert({
        where: { id: existing?.id ?? "__new__" },
        update: { officialCode: existing?.officialCode ?? d.officialCode, nameLocal: existing?.nameLocal ?? d.nameLocal, latitude: d.latitude ?? existing?.latitude, longitude: d.longitude ?? existing?.longitude, source: opts.source, lastVerifiedAt: new Date() },
        create: { stateId, slug, name: d.name, nameLocal: d.nameLocal, officialCode: d.officialCode, latitude: d.latitude, longitude: d.longitude, source: opts.source, lastVerifiedAt: new Date() },
      });
    }

    const districtRows = await prisma.district.findMany({ select: { id: true, name: true, stateId: true } });
    const districtKey = (stateId: string, name: string) => `${stateId}::${normalizeName(name)}`;
    const districtIdByKey = new Map(districtRows.map((d) => [districtKey(d.stateId, d.name), d.id]));

    const adminIdByKey = new Map<string, string>();
    for (const a of plan.adminUnits) {
      const stateId = stateIdByKey.get(a.stateCode) ?? stateIdByKey.get(normalizeName(a.stateCode.replace(/^name:/, "")));
      const districtId = stateId ? districtIdByKey.get(districtKey(stateId, a.districtName)) : undefined;
      if (!districtId) {
        await log("error", `Admin unit "${a.name}" skipped: district "${a.districtName}" was not resolved`, "admin_unit");
        continue;
      }
      const slug = slugify(a.name);
      const existing = await prisma.adminUnit.findFirst({ where: { districtId, OR: [{ slug }, { officialCode: a.officialCode ?? "__none__" }] } });
      const saved = await prisma.adminUnit.upsert({
        where: { id: existing?.id ?? "__new__" },
        update: { officialCode: existing?.officialCode ?? a.officialCode, type: a.type || existing?.type, nameLocal: existing?.nameLocal ?? a.nameLocal, latitude: a.latitude ?? existing?.latitude, longitude: a.longitude ?? existing?.longitude, source: opts.source, lastVerifiedAt: new Date() },
        create: { districtId, stateId: stateId as string, slug, name: a.name, officialName: `${a.name} ${a.type}`, nameLocal: a.nameLocal, type: a.type, officialCode: a.officialCode, latitude: a.latitude, longitude: a.longitude, source: opts.source, lastVerifiedAt: new Date() },
      });
      adminIdByKey.set(`${districtId}::${normalizeName(a.name)}`, saved.id);
    }

    for (const l of plan.localities) {
      const stateId = stateIdByKey.get(l.stateCode) ?? stateIdByKey.get(normalizeName(l.stateCode.replace(/^name:/, "")));
      const districtId = stateId ? districtIdByKey.get(districtKey(stateId, l.districtName)) : undefined;
      if (!districtId) {
        await log("error", `Locality "${l.name}" skipped: district "${l.districtName}" was not resolved`, "locality");
        continue;
      }
      const adminUnitId = l.adminUnitName ? adminIdByKey.get(`${districtId}::${normalizeName(l.adminUnitName)}`) : undefined;
      const slug = slugify(l.name);
      const existing = await prisma.locality.findFirst({ where: { districtId, adminUnitId: adminUnitId ?? null, OR: [{ slug }, { officialCode: l.officialCode ?? "__none__" }] } });
      await prisma.locality.upsert({
        where: { id: existing?.id ?? "__new__" },
        update: { officialCode: existing?.officialCode ?? l.officialCode, kind: l.kind || existing?.kind, nameLocal: existing?.nameLocal ?? l.nameLocal, latitude: l.latitude ?? existing?.latitude, longitude: l.longitude ?? existing?.longitude, source: opts.source, lastVerifiedAt: new Date() },
        create: { districtId, stateId: stateId as string, adminUnitId, slug, name: l.name, nameLocal: l.nameLocal, kind: l.kind || "town", officialCode: l.officialCode, latitude: l.latitude, longitude: l.longitude, source: opts.source, lastVerifiedAt: new Date() },
      });
    }

    const status = plan.stats.errors > 0 ? "partial" : "completed";
    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status,
        completedAt: new Date(),
        recordsFound: rows.length,
        recordsAdded: plan.stats.statesAdded + plan.stats.districtsAdded + plan.stats.adminUnitsAdded + plan.stats.localitiesAdded,
        recordsUpdated: plan.stats.statesUpdated + plan.stats.districtsUpdated + plan.stats.adminUnitsUpdated + plan.stats.localitiesUpdated,
        duplicates: plan.stats.duplicates,
        errors: plan.stats.errors,
        summary: plan.stats as unknown as object,
      },
    });

    return { jobId: job.id, status, stats: plan.stats };
  } catch (error) {
    await prisma.importJob.update({ where: { id: job.id }, data: { status: "failed", completedAt: new Date(), errors: plan.stats.errors + 1, summary: { message: String(error) } } });
    throw error;
  }
}