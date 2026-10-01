import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function run() {
  const found = await prisma.temple.findMany({
    where: {
      slug: { contains: "kukke" }
    },
    select: { id: true, name: true, slug: true }
  });
  console.log("Temples with 'kukke' in slug:", found);
  await prisma.$disconnect();
}

run().catch(console.error);
