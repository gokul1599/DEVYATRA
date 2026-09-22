import { readFileSync, existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not configured in .env.local");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function slugify(text: string): string {
  if (!text) return "unknown";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("Loading sanitized seed from data/sanitized_master_seed.json...");
  const rawData = JSON.parse(readFileSync("data/sanitized_master_seed.json", "utf-8"));

  console.log("Connecting to Neon PostgreSQL...");

  // 1. Country
  const country = await prisma.country.upsert({
    where: { code: "IN" },
    update: { name: "India", slug: "india" },
    create: { code: "IN", iso3: "IND", slug: "india", name: "India" }
  });
  console.log(`Country ready: ${country.name}`);

  // 2. States
  const stateIdByCode = new Map<string, string>();
  for (const s of rawData.states) {
    const code = s.State_Code || "IN";
    const name = s.State_Name;
    const slug = slugify(name);
    const state = await prisma.state.upsert({
      where: { code },
      update: {
        name,
        adminUnitTerm: s.Administrative_Unit_Type || "Tehsil",
        capital: s.Capital,
        source: s.Primary_Endowments_Board || "State Government",
        lastVerifiedAt: new Date()
      },
      create: {
        countryId: country.id,
        code,
        slug,
        name,
        type: code.length === 2 && ["DL", "CH", "PY", "JK", "LA", "AN", "DN", "LD"].includes(code) ? "union_territory" : "state",
        adminUnitTerm: s.Administrative_Unit_Type || "Tehsil",
        capital: s.Capital,
        source: s.Primary_Endowments_Board || "State Government",
        lastVerifiedAt: new Date()
      }
    });
    stateIdByCode.set(code, state.id);
    if (code === "TS") stateIdByCode.set("TG", state.id);
    if (code === "TG") stateIdByCode.set("TS", state.id);
  }
  console.log(`States populated: ${stateIdByCode.size}`);

  // 3. Districts (from districts sheet + any additional districts in temples)
  const districtIdByKey = new Map<string, string>();
  const districtStateIdMap = new Map<string, string>();

  // Upsert districts from rawData.districts in batches
  const districtChunks = chunkArray(rawData.districts, 25);
  for (const chunk of districtChunks) {
    await Promise.all(
      chunk.map(async (d: any) => {
        const stateCode = d.State_Code;
        const stateId = stateIdByCode.get(stateCode);
        if (!stateId) return;
        const name = d.District_Name;
        const slug = slugify(name);
        const district = await prisma.district.upsert({
          where: { stateId_slug: { stateId, slug } },
          update: { name, source: "Census / Gazetteer" },
          create: {
            stateId,
            slug,
            name,
            source: "Census / Gazetteer",
            lastVerifiedAt: new Date()
          }
        });
        districtIdByKey.set(`${stateCode}::${name.toLowerCase()}`, district.id);
        districtIdByKey.set(`${stateCode}::${slug}`, district.id);
        if (stateCode === "TS") {
          districtIdByKey.set(`TG::${name.toLowerCase()}`, district.id);
          districtIdByKey.set(`TG::${slug}`, district.id);
        }
        districtStateIdMap.set(district.id, stateId);
      })
    );
  }

  // Ensure any extra districts in temples are registered
  for (const t of rawData.temples) {
    const stateCode = (t.stateCode === "TG" ? "TS" : t.stateCode) || "IN";
    const stateId = stateIdByCode.get(stateCode);
    if (!stateId) continue;
    const dName = t.districtName || "Central";
    const dKey = `${stateCode}::${dName.toLowerCase()}`;
    if (!districtIdByKey.has(dKey)) {
      const dSlug = slugify(dName);
      const newD = await prisma.district.upsert({
        where: { stateId_slug: { stateId, slug: dSlug } },
        update: {},
        create: { stateId, slug: dSlug, name: dName, source: "Inferred" }
      });
      districtIdByKey.set(dKey, newD.id);
      districtIdByKey.set(`${stateCode}::${dSlug}`, newD.id);
      districtStateIdMap.set(newD.id, stateId);
    }
  }
  console.log(`Districts indexed: ${districtIdByKey.size / 2}`);

  // 4. Admin Units (pre-aggregated and deduplicated)
  const adminIdByKey = new Map<string, string>();
  const uniqueAdminUnits = new Map<string, { districtId: string; stateId: string; name: string; type: string }>();

  for (const au of rawData.admin_units) {
    const dName = au.District_Name;
    let foundDistrictId: string | undefined;
    for (const [key, dId] of districtIdByKey.entries()) {
      if (key.endsWith(`::${dName.toLowerCase()}`) || key.endsWith(`::${slugify(dName)}`)) {
        foundDistrictId = dId;
        break;
      }
    }
    if (!foundDistrictId) continue;
    const stateId = districtStateIdMap.get(foundDistrictId);
    if (!stateId) continue;
    const uSlug = slugify(au.Unit_Name);
    const key = `${foundDistrictId}::${uSlug}`;
    uniqueAdminUnits.set(key, {
      districtId: foundDistrictId,
      stateId,
      name: au.Unit_Name,
      type: au.Unit_Type || "Tehsil"
    });
  }

  for (const t of rawData.temples) {
    if (!t.adminUnitName) continue;
    const stateCode = (t.stateCode === "TG" ? "TS" : t.stateCode) || "IN";
    const dName = t.districtName || "Central";
    const districtId =
      districtIdByKey.get(`${stateCode}::${dName.toLowerCase()}`) ||
      districtIdByKey.get(`${stateCode}::${slugify(dName)}`);
    if (!districtId) continue;
    const stateId = districtStateIdMap.get(districtId);
    if (!stateId) continue;
    const uSlug = slugify(t.adminUnitName);
    const key = `${districtId}::${uSlug}`;
    if (!uniqueAdminUnits.has(key)) {
      uniqueAdminUnits.set(key, {
        districtId,
        stateId,
        name: t.adminUnitName,
        type: "Sub-District"
      });
    }
  }

  const auList = Array.from(uniqueAdminUnits.values());
  const auChunks = chunkArray(auList, 25);
  for (const chunk of auChunks) {
    await Promise.all(
      chunk.map(async (u) => {
        const uSlug = slugify(u.name);
        const adminUnit = await prisma.adminUnit.upsert({
          where: { districtId_slug: { districtId: u.districtId, slug: uSlug } },
          update: { name: u.name, type: u.type },
          create: {
            districtId: u.districtId,
            stateId: u.stateId,
            slug: uSlug,
            name: u.name,
            officialName: `${u.name} ${u.type}`,
            type: u.type,
            source: "Gazetteer",
            lastVerifiedAt: new Date()
          }
        });
        adminIdByKey.set(`${u.districtId}::${u.name.toLowerCase()}`, adminUnit.id);
        adminIdByKey.set(`${u.districtId}::${uSlug}`, adminUnit.id);
      })
    );
  }
  console.log(`Admin Units indexed: ${adminIdByKey.size / 2}`);

  // 5. Temples
  console.log("Resetting existing temples for clean audited ingestion...");
  await prisma.temple.deleteMany({});
  console.log("Upserting temples with P0 sanitization (concurrent batches)...");
  const templeChunks = chunkArray(rawData.temples, 25);
  let templeCount = 0;

  for (const chunk of templeChunks) {
    await Promise.all(
      chunk.map(async (t: any) => {
        const stateCode = (t.stateCode === "TG" ? "TS" : t.stateCode) || "IN";
        const stateId = stateIdByCode.get(stateCode);
        if (!stateId) return;

        const districtId =
          districtIdByKey.get(`${stateCode}::${(t.districtName || "").toLowerCase()}`) ||
          districtIdByKey.get(`${stateCode}::${slugify(t.districtName || "")}`) ||
          districtIdByKey.get(`${stateCode}::central`);

        if (!districtId) {
          console.warn(`District not found for temple: ${t.name}, district: ${t.districtName}`);
          return;
        }

        const adminUnitId = t.adminUnitName
          ? (adminIdByKey.get(`${districtId}::${t.adminUnitName.toLowerCase()}`) ||
             adminIdByKey.get(`${districtId}::${slugify(t.adminUnitName)}`))
          : undefined;

        await prisma.temple.upsert({
          where: { id: t.id },
          update: {
            identifier: t.identifier,
            slug: t.slug,
            name: t.name,
            nameLocal: t.nameLocal,
            alternativeNames: t.alternativeNames || [],
            description: t.description,
            mainDeity: t.mainDeity,
            deities: t.deities || [],
            templeType: t.templeType,
            tradition: t.tradition || [],
            architecture: t.architecture,
            historicalPeriod: t.historicalPeriod,
            establishedYear: t.establishedYear,
            latitude: t.latitude,
            longitude: t.longitude,
            address: t.address,
            stateCode,
            districtId,
            adminUnitId,
            officialWebsite: t.officialWebsite,
            officialPhone: t.officialPhone,
            officialEmail: t.officialEmail,
            googleMapsUrl: t.googleMapsUrl,
            verificationStatus: t.verificationStatus,
            dataConfidence: t.dataConfidence,
            googlePlaceId: t.googlePlaceId,
            googlePlaceVerificationStatus: t.googlePlaceVerificationStatus,
            isCentroidFallback: t.isCentroidFallback,
            asiMonumentId: t.asiMonumentId,
            source: t.source,
            sourceType: t.sourceType,
            sourceUrl: t.sourceUrl,
            lastVerifiedAt: t.lastVerifiedAt ? new Date(t.lastVerifiedAt) : null,
            updatedAt: new Date()
          },
          create: {
            id: t.id,
            identifier: t.identifier,
            slug: t.slug,
            name: t.name,
            nameLocal: t.nameLocal,
            alternativeNames: t.alternativeNames || [],
            description: t.description,
            mainDeity: t.mainDeity,
            deities: t.deities || [],
            templeType: t.templeType,
            tradition: t.tradition || [],
            architecture: t.architecture,
            historicalPeriod: t.historicalPeriod,
            establishedYear: t.establishedYear,
            latitude: t.latitude,
            longitude: t.longitude,
            address: t.address,
            stateCode,
            districtId,
            adminUnitId,
            officialWebsite: t.officialWebsite,
            officialPhone: t.officialPhone,
            officialEmail: t.officialEmail,
            googleMapsUrl: t.googleMapsUrl,
            verificationStatus: t.verificationStatus,
            dataConfidence: t.dataConfidence,
            googlePlaceId: t.googlePlaceId,
            googlePlaceVerificationStatus: t.googlePlaceVerificationStatus,
            isCentroidFallback: t.isCentroidFallback,
            asiMonumentId: t.asiMonumentId,
            source: t.source,
            sourceType: t.sourceType,
            sourceUrl: t.sourceUrl,
            lastVerifiedAt: t.lastVerifiedAt ? new Date(t.lastVerifiedAt) : null,
            publishedAt: new Date()
          }
        });
      })
    );
    templeCount += chunk.length;
    process.stdout.write(`\rTemples ingested: ${templeCount} / ${rawData.temples.length}`);
  }
  console.log("\nAll temples upserted successfully!");

  // 6. Temple Translations
  console.log("Seeding Temple Translations...");
  await prisma.templeTranslation.deleteMany({});
  const translationChunks = chunkArray(rawData.translations, 500);
  for (const chunk of translationChunks) {
    await prisma.templeTranslation.createMany({
      data: chunk as any[]
    });
  }
  console.log(`Translations inserted: ${rawData.translations.length}`);

  // 7. Temple Sources
  console.log("Seeding Multi-Source Provenance...");
  await prisma.templeSource.deleteMany({});
  const sourceChunks = chunkArray(rawData.sources, 500);
  for (const chunk of sourceChunks) {
    await prisma.templeSource.createMany({
      data: (chunk as any[]).map((s) => ({
        templeId: s.Temple_ID,
        sourceType: s.Source_Type,
        sourceName: s.Source_Name,
        sourceUrl: s.Source_URL,
        officialRecordId: s.Official_Record_ID,
        retrievedAt: s.Retrieved_Date ? new Date(s.Retrieved_Date) : null,
        lastVerifiedAt: s.Retrieved_Date ? new Date(s.Retrieved_Date) : null,
        verificationMethod: "INSTITUTIONAL_GAZETTEER",
        verificationStatus: s.Verification_Status || "VERIFIED"
      }))
    });
  }
  console.log(`Sources inserted: ${rawData.sources.length}`);

  // 8. Timings & Bookings
  console.log("Seeding Timings & Bookings...");
  await prisma.templeTiming.deleteMany({});
  await prisma.templeBooking.deleteMany({});

  const timingData: any[] = [];
  const bookingData: any[] = [];

  for (const t of rawData.temples) {
    const isTimingVerified = t.openingTime && t.openingTime !== "NOT_VERIFIED";
    timingData.push({
      templeId: t.id,
      day: "daily",
      label: "General Darshan",
      openTime: isTimingVerified ? t.openingTime : null,
      closeTime: isTimingVerified ? t.closingTime : null,
      verificationStatus: isTimingVerified ? "VERIFIED" : "NEEDS_VERIFICATION",
      source: isTimingVerified ? "Devasthanam Trust / Official Portal" : "Unverified Template",
      lastVerifiedAt: new Date()
    });

    const isBookingAvailable = t.onlineBookingUrl && t.onlineBookingUrl !== "NO_ONLINE_BOOKING_FOUND";
    bookingData.push({
      templeId: t.id,
      bookingType: "darshan",
      onlineAvailable: isBookingAvailable ? true : false,
      offlineAvailable: true,
      price: t.ticketPrice || "Free Entry",
      bookingUrl: isBookingAvailable ? t.onlineBookingUrl : null,
      verificationStatus: isBookingAvailable ? "VERIFIED" : "NO_ONLINE_BOOKING_FOUND",
      source: isBookingAvailable ? "Official Portal" : "Offline Entry Assumed",
      lastVerifiedAt: new Date()
    });
  }

  for (const chunk of chunkArray(timingData, 500)) {
    await prisma.templeTiming.createMany({ data: chunk });
  }
  for (const chunk of chunkArray(bookingData, 500)) {
    await prisma.templeBooking.createMany({ data: chunk });
  }
  console.log(`Timings and Bookings inserted: ${timingData.length}`);

  // 9. Festivals (P0 Boilerplate Tagging)
  console.log("Seeding Festivals with Boilerplate Tagging...");
  await prisma.festival.deleteMany({});
  const festivalData = rawData.festivals.map((f: any) => {
    const name = f.Festival_Name || "Annual Utsavam";
    const isBoilerplate = name.includes("Annual Brahmotsavam") || name.includes("World Heritage Day");
    return {
      templeId: f.Temple_ID,
      name,
      description: f.Description,
      dateLabel: f.Date,
      verificationStatus: isBoilerplate ? "NEEDS_VERIFICATION" : "VERIFIED",
      isRegional: !isBoilerplate,
      source: isBoilerplate ? "Boilerplate Fallback" : (f.Source || "Devasthanam Calendar"),
      lastVerifiedAt: new Date()
    };
  });

  for (const chunk of chunkArray(festivalData, 500)) {
    await prisma.festival.createMany({ data: chunk as any });
  }
  console.log(`Festivals inserted: ${festivalData.length}`);

  // 10. Nearby Places
  console.log("Seeding Nearby Places...");
  await prisma.nearbyPlace.deleteMany({});
  const nearbyData = rawData.nearby.map((n: any) => ({
    templeId: n.Temple_ID,
    name: n.Place_Name,
    kind: (n.Place_Type || "attraction").toLowerCase().includes("food") ? "restaurant" : "attraction",
    distanceKm: parseFloat(n.Distance_KM) || 2.0,
    recommendation: `Nearby pilgrim point of interest (${n.Place_Type})`
  }));

  for (const chunk of chunkArray(nearbyData, 500)) {
    await prisma.nearbyPlace.createMany({ data: chunk as any });
  }
  console.log(`Nearby places inserted: ${nearbyData.length}`);

  // 11. Audit Results
  console.log("Seeding Audit Results...");
  await prisma.auditResult.deleteMany({});
  const auditData = rawData.audit_results.map((a: any) => ({
    templeId: a.Temple_ID,
    templeIdentifier: a.Temple_ID.startsWith("IN-") ? a.Temple_ID : `IN-${a.Temple_ID}`,
    templeName: a.Temple_Name,
    fieldChecked: a.Field_Checked,
    existingValue: a.Existing_Value,
    sourceFound: a.Source_Found,
    sourceUrl: a.Source_URL,
    sourceType: a.Source_Type,
    verified: a.Verified === "Yes" || a.Verified === "1" || a.Verified === 1,
    problem: a.Problem,
    recommendedAction: a.Recommended_Action,
    severity: a.Problem && a.Problem.includes("centroid") ? "CRITICAL" : (a.Problem ? "HIGH" : "LOW"),
    status: a.Problem ? "OPEN" : "RESOLVED"
  }));

  for (const chunk of chunkArray(auditData, 500)) {
    await prisma.auditResult.createMany({ data: chunk as any });
  }
  console.log(`Audit Results inserted: ${auditData.length}`);

  console.log("\n==================================================");
  console.log("✅ INGESTION TO NEON POSTGRESQL COMPLETE!");
  console.log(`Total Temples in Neon:      ${await prisma.temple.count()}`);
  console.log(`Total States in Neon:       ${await prisma.state.count()}`);
  console.log(`Total Districts in Neon:    ${await prisma.district.count()}`);
  console.log(`Total Translations in Neon: ${await prisma.templeTranslation.count()}`);
  console.log(`Total Sources in Neon:      ${await prisma.templeSource.count()}`);
  console.log(`Total Audit Logs in Neon:   ${await prisma.auditResult.count()}`);
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("Error during ingestion:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
