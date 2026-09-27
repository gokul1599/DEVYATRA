import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function checkSpecific() {
  const items = [
    { name: "Swamimalai", terms: ["swamimalai", "swaminatha"], lat: 10.9575, lng: 79.3283 },
    { name: "Bhadrakali Warangal", terms: ["bhadrakali"], lat: 17.9944, lng: 79.5858 },
    { name: "Prem Mandir", terms: ["prem mandir"], lat: 27.5722, lng: 77.6744 },
    { name: "Kal Bhairav Varanasi", terms: ["bhairav", "kaal bhairav"], lat: 25.3183, lng: 83.0142 },
    { name: "Ganpatipule", terms: ["ganpatipule", "swayambhu ganpati"], lat: 17.1458, lng: 73.2667 },
    { name: "Shantadurga Kavlem", terms: ["shantadurga"], lat: 15.3622, lng: 73.9856 },
  ];

  for (const item of items) {
    console.log(`\nChecking ${item.name}...`);
    const byTerms = await prisma.temple.findMany({
      where: {
        OR: item.terms.map(t => ({
          OR: [
            { name: { contains: t, mode: "insensitive" } },
            { slug: { contains: t, mode: "insensitive" } },
            { address: { contains: t, mode: "insensitive" } }
          ]
        }))
      },
      select: { id: true, name: true, slug: true, latitude: true, longitude: true, stateCode: true, address: true }
    });
    console.log(`Found ${byTerms.length} matches by terms:`);
    for (const t of byTerms) {
      const d = Math.hypot(t.latitude - item.lat, t.longitude - item.lng) * 111;
      console.log(`  - [${t.id}] "${t.name}" (${t.stateCode}) | coords: (${t.latitude}, ${t.longitude}) | dist: ${d.toFixed(1)} km`);
    }
  }

  await prisma.$disconnect();
}

checkSpecific().catch(console.error);
