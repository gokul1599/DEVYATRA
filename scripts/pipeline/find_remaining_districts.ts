import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function run() {
  const queries = [
    { stateCode: "AP", name: "NTR" },
    { stateCode: "JK", name: "Anantnag" },
    { stateCode: "GA", name: "North Goa" },
    { stateCode: "TS", name: "Hanamkonda" },
    { stateCode: "TS", name: "Hanumakonda" },
    { stateCode: "TS", name: "Gadwal" },
    { stateCode: "MH", name: "Dharashiv" },
    { stateCode: "MH", name: "Osmanabad" },
    { stateCode: "MP", name: "Satna" },
    { stateCode: "MP", name: "Maihar" },
    { stateCode: "GJ", name: "Dwarka" }
  ];

  for (const q of queries) {
    const list = await prisma.district.findMany({
      where: {
        state: { code: q.stateCode },
        name: { contains: q.name, mode: "insensitive" }
      },
      select: { id: true, name: true, slug: true, state: { select: { code: true } } }
    });
    console.log(`Query ${q.stateCode} "${q.name}":`, list);
  }

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
