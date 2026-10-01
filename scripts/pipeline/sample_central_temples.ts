import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function run() {
  const samples = await prisma.temple.findMany({
    where: {
      district: {
        name: { contains: "Central" }
      }
    },
    take: 20,
    select: {
      id: true,
      name: true,
      address: true,
      latitude: true,
      longitude: true,
      stateCode: true,
      district: { select: { name: true } }
    }
  });

  console.log("20 sample temples in synthetic Central districts:");
  for (const s of samples) {
    console.log(`- ${s.name} (${s.id})`);
    console.log(`    State: ${s.stateCode} | District: ${s.district?.name}`);
    console.log(`    Address: "${s.address}"`);
    console.log(`    Coords: (${s.latitude}, ${s.longitude})\n`);
  }

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
