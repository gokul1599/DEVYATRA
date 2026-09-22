/**
 * Database Pre-Import Snapshot Engine
 * Takes a point-in-time snapshot of the database state before state data ingestion.
 *
 * Usage:
 *   npx tsx scripts/db_snapshot.ts [label]
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL is not configured.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const label = process.argv[2] || "pre_phase9_andhra";
  const backupDir = path.resolve(process.cwd(), "backups");
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }

  console.log("==================================================");
  console.log("📸 DATABASE PRE-IMPORT SNAPSHOT");
  console.log(`Label: ${label}`);
  console.log("==================================================\n");

  const totalTemples = await prisma.temple.count();
  const centroidCount = await prisma.temple.count({ where: { isCentroidFallback: true } });
  const totalStates = await prisma.state.count();
  const totalDistricts = await prisma.district.count();
  const totalSources = await prisma.templeSource.count();
  const totalAuditResults = await prisma.auditResult.count();

  // State-wise breakdown
  const stateCounts = await prisma.temple.groupBy({
    by: ["stateCode"],
    _count: { id: true },
  });

  // Fetch all existing temple identifiers and slugs for rapid rollback reference
  const templeInventory = await prisma.temple.findMany({
    select: {
      id: true,
      identifier: true,
      slug: true,
      name: true,
      stateCode: true,
      districtId: true,
      latitude: true,
      longitude: true,
      verificationStatus: true,
      createdAt: true,
    },
    orderBy: { identifier: "asc" },
  });

  const snapshot = {
    label,
    timestamp: new Date().toISOString(),
    summary: {
      totalTemples,
      centroidCount,
      totalStates,
      totalDistricts,
      totalSources,
      totalAuditResults,
      stateBreakdown: Object.fromEntries(stateCounts.map((s) => [s.stateCode, s._count.id])),
    },
    temples: templeInventory,
  };

  const filename = `db_snapshot_${label}.json`;
  const filePath = path.join(backupDir, filename);

  writeFileSync(filePath, JSON.stringify(snapshot, null, 2), "utf-8");

  console.log(`✅ Snapshot saved to: ${filePath}`);
  console.log(`📊 Total Temples Recorded: ${totalTemples}`);
  console.log(`📊 Centroid Fallbacks: ${centroidCount}`);
  console.log(`📊 AP Temples Currently: ${snapshot.summary.stateBreakdown["AP"] || 0}`);
  console.log(`📊 States Represented: ${stateCounts.length}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Snapshot error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
