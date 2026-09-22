import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function check() {
  const targetCodes = ["WB", "BR", "HP", "AS", "TR", "MN", "ML", "MZ", "NL", "AR", "SK", "PB", "HR"];
  const states = await prisma.state.findMany({
    where: { code: { in: targetCodes } },
    orderBy: { name: "asc" },
    include: {
      districts: {
        orderBy: { name: "asc" },
        include: {
          _count: { select: { temples: true } },
        },
      },
    },
  });

  console.log("==================================================");
  console.log("🇮🇳 PHASE 12 TARGET STATES DISTRICT AUDIT");
  console.log("==================================================");

  for (const s of states) {
    const totalDistricts = s.districts.length;
    const coveredDistricts = s.districts.filter((d) => d._count.temples > 0);
    const zeroDistricts = s.districts.filter((d) => d._count.temples === 0);
    console.log(`\n${s.name} (${s.code}): ${coveredDistricts.length}/${totalDistricts} covered (${zeroDistricts.length} empty)`);
    console.log(`  Covered: ${coveredDistricts.map((d) => `${d.name} (${d._count.temples})`).join(", ") || "None"}`);
    console.log(`  Uncovered Sample (up to 10): ${zeroDistricts.slice(0, 10).map((d) => d.name).join(", ")}`);
  }

  await prisma.$disconnect();
}

check().catch(console.error);
