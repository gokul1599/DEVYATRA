import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { CANONICAL_BENCHMARK_SPECS } from "./build_canonical_temple_index";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function run() {
  console.log("Analyzing all 143 benchmark specs for multiple DB matches...");

  const allTemples = await prisma.temple.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      stateCode: true,
      latitude: true,
      longitude: true,
      district: { select: { id: true, name: true } }
    }
  });

  const duplicateMap: Array<{
    specName: string;
    expectedDistrict: string;
    expectedState: string;
    matches: typeof allTemples;
  }> = [];

  for (const spec of CANONICAL_BENCHMARK_SPECS) {
    const matches = allTemples.filter(t => {
      // Must be same state
      const stateMatch =
        t.stateCode.toUpperCase() === spec.expectedStateCode.toUpperCase() ||
        (t.stateCode === "UK" && spec.expectedStateCode === "UT") ||
        (t.stateCode === "UT" && spec.expectedStateCode === "UK");
      if (!stateMatch) return false;

      // Negative keywords check
      const nameL = t.name.toLowerCase();
      const slugL = t.slug.toLowerCase();
      if (spec.negativeKeywords.some(neg => nameL.includes(neg.toLowerCase()) || slugL.includes(neg.toLowerCase()))) {
        return false;
      }

      // Keyword check
      return spec.primaryKeywords.some(kw => nameL.includes(kw.toLowerCase()) || slugL.includes(kw.toLowerCase()));
    });

    if (matches.length > 1) {
      duplicateMap.push({
        specName: spec.benchmarkName,
        expectedDistrict: spec.expectedDistrict,
        expectedState: spec.expectedState,
        matches
      });
    }
  }

  console.log(`Found ${duplicateMap.length} benchmarks with MULTIPLE matching records in DB:`);
  for (const d of duplicateMap) {
    console.log(`\nBenchmark: "${d.specName}" (Expected: ${d.expectedDistrict}, ${d.expectedState}):`);
    for (const m of d.matches) {
      console.log(`  - [${m.id}] "${m.name}" (${m.district?.name}) | slug: ${m.slug}`);
    }
  }

  await prisma.$disconnect();
}

run().catch(console.error);
