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
      description: true,
      address: true,
      stateCode: true,
      district: { select: { name: true } }
    }
  });

  const nonTempleKeywords = [
    "mosque", "masjid", "church", "cathedral", "fort", "palace", "tomb",
    "garden", "museum", "gurdwara", "monastery", "monument", "wildlife", "national park"
  ];

  const matched = temples.filter(t => {
    const n = t.name.toLowerCase();
    // Exclude if it's explicitly a temple inside a fort, e.g. "Kalinjar Fort Temples" or "Chittorgarh Temples"
    const hasNonTemple = nonTempleKeywords.some(k => n.includes(k));
    const isTemple = n.includes("temple") || n.includes("mandir") || n.includes("devasthanam") || n.includes("kovil") || n.includes("gudi") || n.includes("ambal");
    return hasNonTemple && !isTemple;
  });

  console.log(`Found ${matched.length} distinct non-temple records in prisma.temple:`);
  for (const m of matched) {
    console.log(`- [${m.id}] "${m.name}" (${m.stateCode}, ${m.district?.name}) | slug: ${m.slug}`);
  }

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
