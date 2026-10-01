import { CANONICAL_BENCHMARK_SPECS } from "./build_canonical_temple_index";
import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { haversineDistanceKm } from "../../src/lib/canonical/canonical-identity";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function run() {
  const checkNames = ["Sringeri", "Mahalakshmi Kolhapur", "Mayapur", "Kukke Subramanya"];

  for (const name of checkNames) {
    const spec = CANONICAL_BENCHMARK_SPECS.find(s => s.benchmarkName === name);
    if (!spec) {
      console.log(`Spec not found for ${name}`);
      continue;
    }
    console.log(`\nSpec for "${name}":`);
    console.log(`  expectedState: ${spec.expectedState}, expectedDistrict: ${spec.expectedDistrict}`);
    console.log(`  coords: (${spec.latitude}, ${spec.longitude})`);
    console.log(`  primaryKeywords:`, spec.primaryKeywords);
    console.log(`  negativeKeywords:`, spec.negativeKeywords);

    // Find DB records with keywords
    const matches = await prisma.temple.findMany({
      where: {
        stateCode: spec.expectedStateCode,
        OR: spec.primaryKeywords.map(k => ({ name: { contains: k, mode: "insensitive" } }))
      },
      select: {
        id: true,
        name: true,
        slug: true,
        latitude: true,
        longitude: true,
        district: { select: { name: true } }
      }
    });

    console.log(`  DB matches (${matches.length}):`);
    for (const m of matches) {
      const dist = haversineDistanceKm(m.latitude, m.longitude, spec.latitude, spec.longitude);
      console.log(`    - [${m.id}] "${m.name}" (${m.district?.name}) | coords: (${m.latitude}, ${m.longitude}) | dist: ${dist.toFixed(1)} km`);
    }
  }

  await prisma.$disconnect();
}

run().catch(console.error);
