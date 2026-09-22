import { existsSync, readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

async function main() {
  const count = await prisma.temple.count();
  console.log("Total temples in Neon:", count);

  const rawData = JSON.parse(readFileSync("data/sanitized_master_seed.json", "utf-8"));
  console.log("Total temples in JSON:", rawData.temples.length);

  const dbTemples = await prisma.temple.findMany({ select: { id: true } });
  const dbIdSet = new Set(dbTemples.map((t) => t.id));

  const missingFromDb = rawData.temples.filter((t: any) => !dbIdSet.has(t.id));
  console.log("Temples in JSON but missing from DB:", missingFromDb.length);
  if (missingFromDb.length > 0) {
    console.log("Missing temple sample:", missingFromDb.slice(0, 5).map((t: any) => ({ id: t.id, name: t.name, state: t.stateCode, district: t.districtName })));
  }

  const badTranslations = rawData.translations.filter((tr: any) => !dbIdSet.has(tr.templeId));
  console.log("Translations pointing to missing temples:", badTranslations.length);
  if (badTranslations.length > 0) {
    console.log("Bad translations sample:", badTranslations.slice(0, 5));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
