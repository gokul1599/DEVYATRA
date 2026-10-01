import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function run() {
  const temples = await prisma.temple.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      stateCode: true,
      latitude: true,
      longitude: true,
      district: { select: { id: true, name: true, officialCode: true } },
      state: { select: { name: true, code: true } }
    }
  });

  console.log(`Auditing ${temples.length} temples in DB...`);

  // Count by ID prefix
  const prefixCount: Record<string, number> = {};
  for (const t of temples) {
    const p = t.id.startsWith("IN-") ? t.id.slice(0, 5) : t.id.split("-")[0];
    prefixCount[p] = (prefixCount[p] || 0) + 1;
  }
  console.log("ID prefix distribution:", prefixCount);

  // Non-temple checks in temple table
  const nonTempleKeywords = ["mosque", "masjid", "church", "cathedral", "fort", "palace", "tomb", "garden"];
  const nonTemples = temples.filter(t => {
    const n = t.name.toLowerCase();
    return nonTempleKeywords.some(k => n.includes(k) && !n.includes("temple") && !n.includes("mandir"));
  });
  console.log(`Potential non-temple records in prisma.temple: ${nonTemples.length}`);
  if (nonTemples.length > 0) {
    console.log("Sample non-temples:", nonTemples.slice(0, 10).map(x => ({ id: x.id, name: x.name, slug: x.slug })));
  }

  // Exact duplicate names in same state
  const nameStateMap = new Map<string, typeof temples>();
  for (const t of temples) {
    const key = `${t.name.toLowerCase().trim()}::${t.stateCode}`;
    const list = nameStateMap.get(key) || [];
    list.push(t);
    nameStateMap.set(key, list);
  }

  const duplicates = Array.from(nameStateMap.entries()).filter(([_, list]) => list.length > 1);
  console.log(`Exact name + state duplicates clusters: ${duplicates.length}`);
  for (const [k, list] of duplicates.slice(0, 10)) {
    console.log(`- Duplicate cluster "${k}": ${list.map(x => `${x.name} (${x.id}, ${x.district?.name}, slug: ${x.slug})`).join(" vs ")}`);
  }

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
