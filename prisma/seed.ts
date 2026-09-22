import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { STATES } from "../src/lib/data/states";
import { TEMPLES, slugify } from "../src/lib/data/temples";
import { districtMnemonic, templeIdentifier } from "../src/lib/importer/identifier";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
if (!connectionString || connectionString.includes("placeholder")) {
  console.error("DATABASE_URL is not configured (set the Supabase connection string in .env.local)");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const iso = (d: string | undefined) => {
  if (!d) return undefined;
  const parsed = new Date(d);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

async function main() {
  const job = await prisma.importJob.create({ data: { kind: "temple:seed", source: "seed-registry", status: "running", startedAt: new Date() } });

  await prisma.country.upsert({
    where: { code: "IN" },
    update: {},
    create: { code: "IN", iso3: "IND", slug: "india", name: "India" },
  });
  const country = await prisma.country.findUniqueOrThrow({ where: { code: "IN" } });

  let statesAdded = 0;
  let districtsAdded = 0;
  let adminUnitsAdded = 0;
  let localitiesAdded = 0;
  let templesAdded = 0;

  const stateIdByCode = new Map<string, string>();
  const districtIdByKey = new Map<string, string>();
  const adminIdByKey = new Map<string, string>();
  const localityIdByKey = new Map<string, string>();

  for (const s of STATES) {
    const state = await prisma.state.upsert({
      where: { code: s.code },
      update: { name: s.name, nameLocal: s.nameLocal, type: s.type, adminUnitTerm: s.subUnitTerm, capital: s.capital, tagline: s.tagline, source: "seed-registry", lastVerifiedAt: new Date() },
      create: { countryId: country.id, code: s.code, slug: s.slug, name: s.name, nameLocal: s.nameLocal, type: s.type, adminUnitTerm: s.subUnitTerm, capital: s.capital, tagline: s.tagline, source: "seed-registry", lastVerifiedAt: new Date() },
    });
    statesAdded += 1;
    stateIdByCode.set(s.code, state.id);

    const seen = new Set<string>();
    for (const name of s.districts) {
      const slug = slugify(name);
      if (seen.has(slug)) continue;
      seen.add(slug);
      const d = await prisma.district.upsert({
        where: { stateId_slug: { stateId: state.id, slug } },
        update: { name, source: "seed-registry" },
        create: { stateId: state.id, slug, name, source: "seed-registry", lastVerifiedAt: new Date() },
      });
      districtsAdded += 1;
      districtIdByKey.set(`${s.code}::${slug}`, d.id);
    }
  }

  for (const t of TEMPLES) {
    const state = await prisma.state.findUniqueOrThrow({ where: { code: t.stateCode } });
    const dSlug = t.districtSlug || slugify(t.district);
    let districtId = districtIdByKey.get(`${t.stateCode}::${dSlug}`);
    if (!districtId) {
      const d = await prisma.district.upsert({
        where: { stateId_slug: { stateId: state.id, slug: dSlug } },
        update: { name: t.district },
        create: { stateId: state.id, slug: dSlug, name: t.district, source: "seed-registry", lastVerifiedAt: new Date() },
      });
      districtId = d.id;
      districtIdByKey.set(`${t.stateCode}::${dSlug}`, d.id);
      districtsAdded += 1;
    }

    let adminUnitId: string | undefined;
    if (t.subUnitSlug && t.subUnit) {
      const key = `${districtId}::${t.subUnitSlug}`;
      adminUnitId = adminIdByKey.get(key);
      if (!adminUnitId) {
        const au = await prisma.adminUnit.upsert({
          where: { districtId_slug: { districtId, slug: t.subUnitSlug } },
          update: { name: t.subUnit, type: state.adminUnitTerm },
          create: { stateId: state.id, districtId, slug: t.subUnitSlug, name: t.subUnit, officialName: `${t.subUnit} ${state.adminUnitTerm}`, type: state.adminUnitTerm, source: "seed-registry", lastVerifiedAt: new Date() },
        });
        adminUnitId = au.id;
        adminIdByKey.set(key, au.id);
        adminUnitsAdded += 1;
      }
    }

    let localityId: string | undefined;
    if (t.locationSlug && t.location) {
      const key = `${districtId}::${adminUnitId ?? "none"}::${t.locationSlug}`;
      localityId = localityIdByKey.get(key);
      if (!localityId) {
        const existing = await prisma.locality.findFirst({ where: { districtId, adminUnitId: adminUnitId ?? null, slug: t.locationSlug } });
        const loc = existing
          ? await prisma.locality.update({ where: { id: existing.id }, data: { name: t.location, kind: t.locationKind } })
          : await prisma.locality.create({ data: { stateId: state.id, districtId, adminUnitId, slug: t.locationSlug, name: t.location, kind: t.locationKind, source: "seed-registry", lastVerifiedAt: new Date() } });
        localityId = loc.id;
        localityIdByKey.set(key, loc.id);
        localitiesAdded += 1;
      }
    }

    const seq = (districtSequences.get(districtId) ?? 0) + 1;
    districtSequences.set(districtId, seq);
    const identifier = templeIdentifier(t.stateCode, districtMnemonic(t.district), seq);

    await prisma.temple.upsert({
      where: { id: t.id },
      update: {
        name: t.name,
        nameLocal: t.nameLocal,
        alternativeNames: t.aliases ?? [],
        description: t.description,
        mainDeity: t.mainDeity,
        deities: t.deities ?? [],
        templeType: t.type,
        tradition: t.tradition ?? [],
        architecture: t.architecture,
        historicalPeriod: t.historicalPeriod,
        establishedYear: t.establishedYear,
        badges: t.badges ?? [],
        images: t.images ?? [],
        latitude: t.latitude,
        longitude: t.longitude,
        stateCode: t.stateCode,
        districtId,
        adminUnitId,
        localityId,
        verificationStatus: t.source?.status ?? "UNVERIFIED",
        source: t.source?.org,
        sourceType: t.source?.type,
        sourceUrl: t.source?.url,
        lastVerifiedAt: iso(t.source?.lastVerified),
      },
      create: {
        id: t.id,
        identifier,
        slug: t.slug,
        name: t.name,
        nameLocal: t.nameLocal,
        alternativeNames: t.aliases ?? [],
        description: t.description,
        mainDeity: t.mainDeity,
        deities: t.deities ?? [],
        templeType: t.type,
        tradition: t.tradition ?? [],
        architecture: t.architecture,
        historicalPeriod: t.historicalPeriod,
        establishedYear: t.establishedYear,
        badges: t.badges ?? [],
        images: t.images ?? [],
        latitude: t.latitude,
        longitude: t.longitude,
        stateCode: t.stateCode,
        districtId,
        adminUnitId,
        localityId,
        verificationStatus: t.source?.status ?? "UNVERIFIED",
        source: t.source?.org,
        sourceType: t.source?.type,
        sourceUrl: t.source?.url,
        lastVerifiedAt: iso(t.source?.lastVerified),
        publishedAt: new Date(),
      },
    });
    templesAdded += 1;

    await prisma.templeTiming.deleteMany({ where: { templeId: t.id } });
    if (t.timings?.slots?.length) {
      await prisma.templeTiming.createMany({
        data: t.timings.slots.map((slot) => ({
          templeId: t.id,
          day: "daily",
          label: slot.label,
          openTime: slot.opening,
          closeTime: slot.closing,
          note: slot.note,
          source: t.timings?.verification?.source?.org ?? t.source?.org,
          verificationStatus: t.timings?.verification?.status ?? t.source?.status ?? "UNVERIFIED",
          lastVerifiedAt: iso(t.timings?.verification?.source?.lastVerified),
        })),
      });
    }

    await prisma.darshanOption.deleteMany({ where: { templeId: t.id } });
    const darshans = [];
    if (t.entryFee?.generalDarshan && t.entryFee.generalDarshan !== "unavailable") {
      darshans.push({ templeId: t.id, name: "General darshan", type: "general", price: t.entryFee.generalDarshan === "free" ? "Free" : undefined, source: t.entryFee.verification?.source?.org ?? t.source?.org, verificationStatus: t.entryFee.verification?.status ?? "UNVERIFIED" });
    }
    if (t.entryFee?.specialDarshan) {
      darshans.push({ templeId: t.id, name: "Special darshan", type: "special", price: t.entryFee.specialDarshan, bookingRequired: Boolean(t.entryFee.bookingUrl), bookingUrl: t.entryFee.bookingUrl, source: t.entryFee.verification?.source?.org ?? t.source?.org, verificationStatus: t.entryFee.verification?.status ?? "UNVERIFIED" });
    }
    if (darshans.length) await prisma.darshanOption.createMany({ data: darshans });

    await prisma.templeBooking.deleteMany({ where: { templeId: t.id } });
    if (t.entryFee) {
      await prisma.templeBooking.create({
        data: {
          templeId: t.id,
          bookingType: "darshan",
          onlineAvailable: t.entryFee.bookingMode === "online" || Boolean(t.entryFee.bookingUrl),
          offlineAvailable: t.entryFee.bookingMode === "offline" || t.entryFee.bookingMode === "free",
          price: t.entryFee.specialDarshan,
          bookingUrl: t.entryFee.bookingUrl,
          counterLocation: t.entryFee.bookingOrg,
          source: t.entryFee.verification?.source?.org ?? t.source?.org,
          verificationStatus: t.entryFee.verification?.status ?? "UNVERIFIED",
          lastVerifiedAt: iso(t.entryFee.verification?.source?.lastVerified),
        },
      });
    }

    await prisma.festival.deleteMany({ where: { templeId: t.id } });
    if (t.festivals?.length) {
      await prisma.festival.createMany({
        data: t.festivals.map((f) => ({
          templeId: t.id,
          name: f.name,
          description: f.description,
          dateLabel: f.dateLabel,
          month: f.month,
          day: f.day,
          specialTiming: f.specialDarshan ? "Special darshan available" : undefined,
          source: f.source?.org ?? t.source?.org,
          verificationStatus: f.source?.status ?? t.source?.status ?? "UNVERIFIED",
          lastVerifiedAt: iso(f.source?.lastVerified),
        })),
      });
    }

    await prisma.timelineItem.deleteMany({ where: { templeId: t.id } });
    if (t.history?.length) {
      await prisma.timelineItem.createMany({ data: t.history.map((h) => ({ templeId: t.id, year: h.year, title: h.title, body: h.body })) });
    }

    await prisma.whyFamous.deleteMany({ where: { templeId: t.id } });
    if (t.whyFamous?.length) {
      await prisma.whyFamous.createMany({ data: t.whyFamous.map((w) => ({ templeId: t.id, icon: w.icon, title: w.title, body: w.body })) });
    }
  }

  await prisma.importJob.update({
    where: { id: job.id },
    data: {
      status: "completed",
      completedAt: new Date(),
      recordsFound: STATES.length + TEMPLES.length,
      recordsAdded: statesAdded + districtsAdded + adminUnitsAdded + localitiesAdded + templesAdded,
      summary: { statesAdded, districtsAdded, adminUnitsAdded, localitiesAdded, templesAdded },
    },
  });

  const counts = {
    countries: await prisma.country.count(),
    states: await prisma.state.count(),
    districts: await prisma.district.count(),
    adminUnits: await prisma.adminUnit.count(),
    localities: await prisma.locality.count(),
    temples: await prisma.temple.count(),
  };
  console.log("Seed complete:", counts);
}

const districtSequences = new Map<string, number>();

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });