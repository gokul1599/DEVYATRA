import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const TEST_NAMES = [
  "Sringeri", "Halebidu", "Somanathapura", "Karni Mata", "Salasar",
  "Swamimalai", "Sankat Mochan", "Tungnath", "Jageshwar", "Mansa Devi",
  "Tarakeswar", "Mayapur", "Bhimashankar"
];

async function run() {
  for (const n of TEST_NAMES) {
    const records = await prisma.temple.findMany({
      where: {
        OR: [
          { name: { contains: n, mode: "insensitive" } },
          { slug: { contains: n.toLowerCase() } }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        stateCode: true,
        district: { select: { id: true, name: true } }
      }
    });
    console.log(`\nMatches for "${n}" (${records.length}):`);
    for (const r of records) {
      console.log(`  - [${r.id}] "${r.name}" (${r.stateCode}, ${r.district?.name}) | slug: ${r.slug}`);
    }
  }
  await prisma.$disconnect();
}

run().catch(console.error);
