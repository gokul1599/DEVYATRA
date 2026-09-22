import { existsSync, writeFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("No DATABASE_URL");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const states = ["CG", "JH", "JK", "LA", "GA", "TS"];
  const out: Record<string, string[]> = {};
  for (const code of states) {
    const districts = await prisma.district.findMany({
      where: { state: { code } },
      select: { name: true },
      orderBy: { name: "asc" },
    });
    out[code] = districts.map((d) => d.name);
  }
  writeFileSync("scripts/db_phase13_districts.json", JSON.stringify(out, null, 2));
  console.log("Written districts to scripts/db_phase13_districts.json");
  await prisma.$disconnect();
}

main().catch(console.error);
