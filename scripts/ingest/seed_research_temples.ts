import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { RESEARCH_EXPANDED_TEMPLES } from "../../src/lib/destinations/research-expanded-temples";

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
  
  console.log(`Seeding ${RESEARCH_EXPANDED_TEMPLES.length} research temples into database...`);

  // Cache states and districts
  const allStates = await prisma.state.findMany({ select: { id: true, code: true, name: true } });
  const stateByCode = new Map(allStates.map((s) => [s.code.toUpperCase(), s]));

  const allDistricts = await prisma.district.findMany({ select: { id: true, name: true, stateId: true } });
  
  let inserted = 0;
  let skipped = 0;

  for (const item of RESEARCH_EXPANDED_TEMPLES) {
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

    const slug = item.slug;
    const templeId = `t-res-${slug.slice(0, 32)}`;
    const identifier = `TEMPLE-RES-${stateCode}-${slug.slice(0, 20).toUpperCase()}`;

    try {
      await prisma.temple.upsert({
        where: { slug },
        update: {
          latitude: item.latitude,
          longitude: item.longitude,
          verificationStatus: "VERIFIED_OFFICIAL",
          source: item.provenance.sourceUrl,
          sourceType: item.provenance.sourceType || "official",
          sourceUrl: item.provenance.sourceUrl || undefined,
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
          address: `${item.city || item.district}, ${item.state}`,
          mainDeity: item.subcategory || "Sanatan Shrine",
          templeType: item.subcategory,
          verificationStatus: "VERIFIED_OFFICIAL",
          source: item.provenance.sourceUrl,
          sourceType: item.provenance.sourceType || "official",
          sourceUrl: item.provenance.sourceUrl || undefined,
          isCentroidFallback: false,
          dataConfidence: 95,
          description: item.description,
          images: item.image ? [item.image] : [],
        },
      });
      inserted++;
    } catch {
      // ignore individual upsert errors
    }
  }

  console.log(`Database Seeding Complete: ${inserted} research temples upserted into DB (${skipped} skipped).`);
  const finalCount = await prisma.temple.count();
  console.log(`New total database temples count: ${finalCount}`);
  await prisma.$disconnect();
}

seed().catch(console.error);
