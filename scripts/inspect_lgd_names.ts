import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function checkNames() {
  const codes = ["WB", "BR", "HP", "AS", "TR", "MN", "ML", "AR", "PB", "HR"];
  for (const c of codes) {
    const st = await prisma.state.findUnique({
      where: { code: c },
      include: {
        districts: {
          orderBy: { name: "asc" },
          select: { name: true, officialCode: true, slug: true, _count: { select: { temples: true } } },
        },
      },
    });
    if (!st) continue;
    console.log(`\nState: ${st.name} (${st.code}) - Total Districts in DB: ${st.districts.length}`);
    const empty = st.districts.filter(d => d._count.temples === 0);
    console.log(`Empty Districts (${empty.length}): ${empty.map(d => `${d.name} [${d.slug}]`).join(", ")}`);
  }
  await prisma.$disconnect();
}

checkNames().catch(console.error);
