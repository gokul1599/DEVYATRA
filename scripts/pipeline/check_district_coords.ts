import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function run() {
  const total = await prisma.district.count();
  const withCoords = await prisma.district.count({
    where: { latitude: { not: null }, longitude: { not: null } }
  });
  console.log(`Districts: total=${total}, withCoords=${withCoords}`);

  // Check some districts with null coords
  if (withCoords < total) {
    const withoutCoords = await prisma.district.findMany({
      where: { latitude: null },
      take: 10,
      select: { id: true, name: true, slug: true, state: { select: { code: true } } }
    });
    console.log("Sample districts without coords:", withoutCoords);
  }

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
