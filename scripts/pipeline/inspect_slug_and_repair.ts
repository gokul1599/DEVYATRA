import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function check() {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Connection attempt ${attempt}...`);
      const existing = await prisma.temple.findMany({
        where: {
          OR: [
            { slug: { contains: "kukke" } },
            { name: { contains: "Kukke", mode: "insensitive" } }
          ]
        },
        select: { id: true, name: true, slug: true, district: { select: { name: true } } }
      });
      console.log("Kukke records in DB:", existing);
      break;
    } catch (e: any) {
      console.warn(`Attempt ${attempt} failed:`, e.message);
      if (attempt === 3) throw e;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  await prisma.$disconnect();
}

check().catch(console.error);
