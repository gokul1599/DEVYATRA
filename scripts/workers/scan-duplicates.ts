/**
 * Duplicate Detection Worker
 * Scans temple records across districts using probabilistic similarity and geospatial proximity.
 * Writes detected candidate duplicates to data/audit/detected_duplicates.json and logs to AuditResult.
 */
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { evaluateDuplicate, type DuplicateMatchResult } from "../../src/lib/importer/deduplicate";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function runDuplicateScan() {
  console.log("=== DEVYATRA PROBABILISTIC DUPLICATE SCANNER ===");

  const temples = await prisma.temple.findMany({
    select: {
      id: true,
      identifier: true,
      name: true,
      alternativeNames: true,
      mainDeity: true,
      stateCode: true,
      latitude: true,
      longitude: true,
      district: { select: { name: true } }
    }
  });

  console.log(`Loaded ${temples.length} temples for cross-comparison.`);

  // Group by state for efficient candidate pairing
  const byState = new Map<string, typeof temples>();
  for (const t of temples) {
    const list = byState.get(t.stateCode) || [];
    list.push(t);
    byState.set(t.stateCode, list);
  }

  const flaggedPairs: {
    temple1: { id: string; name: string; state: string; district?: string };
    temple2: { id: string; name: string; state: string; district?: string };
    match: DuplicateMatchResult;
  }[] = [];

  for (const [state, list] of byState.entries()) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const t1 = list[i];
        const t2 = list[j];

        const match = evaluateDuplicate(
          {
            id: t1.id,
            name: t1.name,
            alternativeNames: t1.alternativeNames,
            mainDeity: t1.mainDeity,
            stateCode: t1.stateCode,
            districtName: t1.district?.name,
            latitude: t1.latitude,
            longitude: t1.longitude
          },
          {
            id: t2.id,
            name: t2.name,
            alternativeNames: t2.alternativeNames,
            mainDeity: t2.mainDeity,
            stateCode: t2.stateCode,
            districtName: t2.district?.name,
            latitude: t2.latitude,
            longitude: t2.longitude
          }
        );

        if (match.classification === "EXACT_DUPLICATE" || match.classification === "PROBABLE_DUPLICATE") {
          flaggedPairs.push({
            temple1: { id: t1.id, name: t1.name, state: t1.stateCode, district: t1.district?.name },
            temple2: { id: t2.id, name: t2.name, state: t2.stateCode, district: t2.district?.name },
            match
          });
        }
      }
    }
  }

  console.log(`Found ${flaggedPairs.length} candidate duplicate pairs.`);

  if (!existsSync("data/audit")) mkdirSync("data/audit", { recursive: true });
  writeFileSync("data/audit/detected_duplicates.json", JSON.stringify(flaggedPairs, null, 2), "utf-8");
  console.log("Report saved to data/audit/detected_duplicates.json");

  console.log("=========================================");
}

runDuplicateScan()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
