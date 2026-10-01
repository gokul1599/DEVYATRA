import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function run() {
  const temples = await prisma.temple.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      stateCode: true,
      districtId: true,
      address: true,
      district: {
        select: {
          id: true,
          name: true,
          officialCode: true,
          stateId: true,
          state: { select: { name: true, code: true } }
        }
      }
    }
  });

  console.log(`Total temples in DB: ${temples.length}`);

  let noDistrict = 0;
  let stateMismatch = 0;
  let syntheticCentral = 0;
  const mismatchedStateTemples: any[] = [];
  const syntheticCentralTemples: any[] = [];

  for (const t of temples) {
    if (!t.district) {
      noDistrict++;
      continue;
    }

    if (t.district.state && t.district.state.code !== t.stateCode) {
      stateMismatch++;
      mismatchedStateTemples.push({
        id: t.id,
        name: t.name,
        stateCode: t.stateCode,
        districtName: t.district.name,
        districtStateCode: t.district.state.code,
      });
    }

    if (t.district.name.includes("Central")) {
      syntheticCentral++;
      syntheticCentralTemples.push({
        id: t.id,
        name: t.name,
        stateCode: t.stateCode,
        districtName: t.district.name,
      });
    }
  }

  console.log(`Temples without district: ${noDistrict}`);
  console.log(`Temples where district belongs to a DIFFERENT state: ${stateMismatch}`);
  console.log(`Temples assigned to synthetic "Central" district: ${syntheticCentral}`);

  console.log("\nSample Cross-State District Assignments (first 10):");
  console.log(mismatchedStateTemples.slice(0, 10));

  console.log("\nSample Synthetic Central District Assignments (first 10):");
  console.log(syntheticCentralTemples.slice(0, 10));

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
