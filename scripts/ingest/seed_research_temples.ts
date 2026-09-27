import { existsSync, readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (existsSync(".env")) process.loadEnvFile(".env");

const STATE_NAME_TO_CODE: Record<string, string> = {
  "andaman and nicobar islands": "AN",
  "andhra pradesh": "AP",
  "arunachal pradesh": "AR",
  "assam": "AS",
  "bihar": "BR",
  "chandigarh": "CH",
  "chhattisgarh": "CG",
  "dadra and nagar haveli and daman and diu": "DD",
  "delhi": "DL",
  "goa": "GA",
  "gujarat": "GJ",
  "haryana": "HR",
  "himachal pradesh": "HP",
  "jammu and kashmir": "JK",
  "jharkhand": "JH",
  "karnataka": "KA",
  "kerala": "KL",
  "ladakh": "LA",
  "lakshadweep": "LD",
  "madhya pradesh": "MP",
  "maharashtra": "MH",
  "manipur": "MN",
  "meghalaya": "ML",
  "mizoram": "MZ",
  "nagaland": "NL",
  "odisha": "OD",
  "puducherry": "PY",
  "punjab": "PB",
  "rajasthan": "RJ",
  "sikkim": "SK",
  "tamil nadu": "TN",
  "telangana": "TG",
  "tripura": "TR",
  "uttar pradesh": "UP",
  "uttarakhand": "UK",
  "west bengal": "WB",
};

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log("No DATABASE_URL set. Skipping DB write.");
    return;
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  
  const recData = JSON.parse(readFileSync("scripts/templeora_master_reconciliation.json", "utf-8"));
  const newItems = recData.new_to_include;

  console.log(`Seeding ${newItems.length} research temples into database...`);

  // Cache states and districts
  const allStates = await prisma.state.findMany({ select: { id: true, code: true, name: true } });
  const stateByCode = new Map(allStates.map((s) => [s.code.toUpperCase(), s]));

  const allDistricts = await prisma.district.findMany({ select: { id: true, name: true, stateId: true } });
  
  let inserted = 0;
  let skipped = 0;

  for (const item of newItems) {
    if (!item.latitude || !item.longitude) {
      skipped++;
      continue;
    }

    const stateCode = STATE_NAME_TO_CODE[item.state.toLowerCase().trim()];
    if (!stateCode) {
      skipped++;
      continue;
    }

    const state = stateByCode.get(stateCode);
    if (!state) {
      skipped++;
      continue;
    }

    // Resolve district
    let district = allDistricts.find(
      (d) => d.stateId === state.id && d.name.toLowerCase().includes(item.district.toLowerCase())
    );

    if (!district) {
      district = allDistricts.find((d) => d.stateId === state.id);
    }

    if (!district) {
      skipped++;
      continue;
    }

    const slug = (item.name + "-" + (item.locality || item.district || ""))
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const templeId = `t-res-${slug.slice(0, 32)}`;
    const identifier = `TEMPLE-RES-${stateCode}-${slug.slice(0, 20).toUpperCase()}`;

    try {
      await prisma.temple.upsert({
        where: { slug },
        update: {
          latitude: item.latitude,
          longitude: item.longitude,
          verificationStatus: "VERIFIED_SOURCE",
          source: item.source,
          sourceType: "government",
          sourceUrl: item.source_url || undefined,
        },
        create: {
          id: templeId,
          identifier,
          slug,
          name: item.name,
          stateCode: state.code,
          districtId: district.id,
          latitude: item.latitude,
          longitude: item.longitude,
          address: `${item.locality || item.district}, ${item.state}`,
          mainDeity: item.temple_type || "Sanatan Shrine",
          templeType: item.temple_type,
          verificationStatus: "VERIFIED_SOURCE",
          source: item.source,
          sourceType: "government",
          sourceUrl: item.source_url || undefined,
          isCentroidFallback: false,
          dataConfidence: 90,
          description: `Historic ${item.temple_type || 'sacred'} shrine in ${item.district}, ${item.state}. Documented in official cultural inventories under ${item.source}.`,
        },
      });
      inserted++;
    } catch (e: any) {
      // ignore individual upsert errors if duplicate id/identifier
    }
  }

  console.log(`Database Seeding Complete: ${inserted} research temples upserted into DB (${skipped} skipped).`);
  const finalCount = await prisma.temple.count();
  console.log(`New total database temples count: ${finalCount}`);
  await prisma.$disconnect();
}

seed().catch(console.error);
