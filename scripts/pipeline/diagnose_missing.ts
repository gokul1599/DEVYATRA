import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { ALL_INDIA_DESTINATIONS } from "../../src/lib/destinations/all-india-data";
import { CANONICAL_BENCHMARK_SPECS } from "./build_canonical_temple_index";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const missingNames = [
  "Sheetla Mata",
  "Amarnath",
  "Gokarna Mahabaleshwar",
  "Belur",
  "Somanathapura",
  "Hampi",
  "Pattadakal",
  "Aihole",
  "Vaikom",
  "Ganpatipule",
  "Mukteshwar",
  "Brihadisvara Thanjavur",
  "Meenakshi",
  "Ranganathaswamy",
  "Kamakshi",
  "Varadaraja Perumal",
  "Tiruchendur",
  "Thiruttani",
  "Swamimalai",
  "Bhadrakali",
  "Chilkur",
  "Banke Bihari",
  "Prem Mandir",
  "Kal Bhairav",
  "Gangotri",
  "Tungnath",
  "Jageshwar",
  "Mansa Devi Haridwar",
  "Tarakeswar"
];

async function check() {
  const dbTemples = await prisma.temple.findMany({
    select: { id: true, name: true, slug: true, stateCode: true, latitude: true, longitude: true, address: true }
  });
  const dbPlaces = await prisma.place.findMany({
    select: { id: true, name: true, slug: true, state: true, district: true, latitude: true, longitude: true }
  });

  for (const name of missingNames) {
    const spec = CANONICAL_BENCHMARK_SPECS.find(s => s.benchmarkName === name);
    if (!spec) continue;

    console.log(`\n=================== [${name}] (Expected: ${spec.expectedState}, coords: ${spec.latitude}, ${spec.longitude}) ===================`);
    
    // Look for candidates within 30km in DB temples
    const nearbyTemples = dbTemples.filter(t => {
      const d = Math.hypot(t.latitude - spec.latitude, t.longitude - spec.longitude) * 111;
      return d < 25;
    });

    // Look for candidates by name substring
    const nameMatchesTemples = dbTemples.filter(t => {
      const n = t.name.toLowerCase();
      const s = spec.benchmarkName.toLowerCase();
      const words = s.split(" ").filter(w => w.length > 3);
      return words.some(w => n.includes(w));
    });

    // Check destinations
    const destMatches = ALL_INDIA_DESTINATIONS.filter(d => {
      const dist = Math.hypot(d.latitude - spec.latitude, d.longitude - spec.longitude) * 111;
      return dist < 25 || d.name.toLowerCase().includes(spec.benchmarkName.toLowerCase());
    });

    // Check places
    const placeMatches = dbPlaces.filter(p => {
      const dist = Math.hypot(p.latitude - spec.latitude, p.longitude - spec.longitude) * 111;
      return dist < 25 || p.name.toLowerCase().includes(spec.benchmarkName.toLowerCase());
    });

    console.log(`  Nearby Temples (<25km): ${nearbyTemples.length}`);
    for (const t of nearbyTemples.slice(0, 3)) {
      console.log(`    - [${t.id}] "${t.name}" | coords: (${t.latitude}, ${t.longitude})`);
    }

    console.log(`  Name Match Temples: ${nameMatchesTemples.length}`);
    for (const t of nameMatchesTemples.slice(0, 3)) {
      console.log(`    - [${t.id}] "${t.name}" (${t.stateCode}) | coords: (${t.latitude}, ${t.longitude})`);
    }

    console.log(`  Destinations (<25km or name match): ${destMatches.length}`);
    for (const d of destMatches.slice(0, 3)) {
      console.log(`    - [${d.id}] "${d.name}" | coords: (${d.latitude}, ${d.longitude})`);
    }

    console.log(`  Places (<25km or name match): ${placeMatches.length}`);
    for (const p of placeMatches.slice(0, 3)) {
      console.log(`    - [${p.id}] "${p.name}" | coords: (${p.latitude}, ${p.longitude})`);
    }
  }

  await prisma.$disconnect();
}

check().catch(console.error);
