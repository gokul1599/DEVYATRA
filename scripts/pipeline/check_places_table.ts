import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function run() {
  const names = [
    "Red Fort", "Jama Masjid", "Humayun", "Pinjore Gardens", "Mughal Gardens",
    "Silent Valley", "Dudhwa", "Raigad Fort", "Se Cathedral"
  ];

  console.log("Checking places in prisma.place:");
  for (const n of names) {
    const places = await prisma.place.findMany({
      where: { name: { contains: n, mode: "insensitive" } },
      select: { id: true, name: true, slug: true, category: true, district: true, state: true }
    });
    console.log(`- Query "${n}": ${places.length} found:`, places);
  }

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
