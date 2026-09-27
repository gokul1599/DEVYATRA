import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function findDistricts() {
  const lookups = [
    { stateCode: "TN", districtSlug: "kanchipuram" },
    { stateCode: "MH", districtSlug: "ratnagiri" },
    { stateCode: "TS", districtSlug: "hanamkonda" },
    { stateCode: "TG", districtSlug: "hanamkonda" },
    { stateCode: "TS", districtSlug: "warangal" },
    { stateCode: "UP", districtSlug: "mathura" },
    { stateCode: "UP", districtSlug: "varanasi" },
    { stateCode: "GA", districtSlug: "south-goa" },
    { stateCode: "GA", districtSlug: "north-goa" }
  ];

  const states = await prisma.state.findMany({
    select: { id: true, code: true, name: true }
  });
  console.log("States found:", states.map(s => `${s.code}: ${s.name} (${s.id})`));

  for (const l of lookups) {
    const districts = await prisma.district.findMany({
      where: {
        OR: [
          { slug: { contains: l.districtSlug, mode: "insensitive" } },
          { name: { contains: l.districtSlug, mode: "insensitive" } }
        ]
      },
      include: { state: true }
    });
    console.log(`Lookup ${l.stateCode} / ${l.districtSlug}: found ${districts.length}`);
    for (const d of districts) {
      console.log(`  - District [${d.id}] "${d.name}" (slug: ${d.slug}) in State: ${d.state.code} (${d.state.name})`);
    }
  }

  await prisma.$disconnect();
}

findDistricts().catch(console.error);
