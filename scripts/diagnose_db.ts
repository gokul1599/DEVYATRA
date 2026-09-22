import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not configured");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function diagnose() {
  console.log("=== STEP 1: FORENSIC DATABASE DIAGNOSTIC ===");
  const total = await prisma.temple.count();
  console.log("Total Temples:", total);

  const byStatus = await prisma.temple.groupBy({
    by: ["verificationStatus"],
    _count: { _all: true }
  });
  console.log("\nTemples by Verification Status:");
  for (const s of byStatus) {
    console.log(`  - ${s.verificationStatus}: ${s._count._all}`);
  }

  const centroidCount = await prisma.temple.count({
    where: { isCentroidFallback: true }
  });
  console.log("\nCentroid Fallback Count (isCentroidFallback = true):", centroidCount);

  const validCoords = await prisma.temple.count({
    where: {
      latitude: { not: 0 },
      longitude: { not: 0 },
      isCentroidFallback: false
    }
  });
  console.log("Temples with Valid Non-Centroid Coordinates:", validCoords);

  const statesCount = await prisma.state.count();
  console.log("\nTotal States in DB:", statesCount);

  const districtsCount = await prisma.district.count();
  console.log("Total Districts in DB:", districtsCount);

  const adminUnitsCount = await prisma.adminUnit.count();
  console.log("Total AdminUnits in DB:", adminUnitsCount);

  const templesPerState = await prisma.temple.groupBy({
    by: ["stateCode"],
    _count: { _all: true },
    orderBy: { _count: { stateCode: "desc" } }
  });
  console.log(`\nTemples by State (${templesPerState.length} states with temples):`);
  for (const s of templesPerState) {
    console.log(`  - ${s.stateCode}: ${s._count._all}`);
  }

  // Top 10 districts with temples
  const templesPerDistrict = await prisma.temple.groupBy({
    by: ["districtId"],
    _count: { _all: true },
    orderBy: { _count: { districtId: "desc" } }
  });
  console.log(`\nDistinct Districts with Temples: ${templesPerDistrict.length}`);

  const { CORE_TEMPLES } = await import("../src/lib/data/temples-core");
  const { EXTRA_TEMPLES_1 } = await import("../src/lib/data/temples-extra-1");
  const { EXTRA_TEMPLES_2 } = await import("../src/lib/data/temples-extra-2");
  const { TEMPLES } = await import("../src/lib/data/temples");

  console.log("\n=== STEP 4: STATIC FRONTEND DATA AUDIT ===");
  console.log("CORE_TEMPLES length:", CORE_TEMPLES.length);
  console.log("EXTRA_TEMPLES_1 length:", EXTRA_TEMPLES_1.length);
  console.log("EXTRA_TEMPLES_2 length:", EXTRA_TEMPLES_2.length);
  console.log("Combined TEMPLES length:", TEMPLES.length);

  // Distinct verification & operational states
  const byGoogleStatus = await prisma.temple.groupBy({
    by: ["googlePlaceVerificationStatus"],
    _count: { _all: true }
  });
  console.log("\nBy Google Place Verification Status:");
  for (const g of byGoogleStatus) {
    console.log(`  - ${g.googlePlaceVerificationStatus}: ${g._count._all}`);
  }

  // Check temples marked with different verificationStatus
  const unverified = await prisma.temple.count({ where: { verificationStatus: "UNVERIFIED" } });
  console.log("Unverified Temples:", unverified);

  const needsVerification = await prisma.temple.count({ where: { verificationStatus: "NEEDS_VERIFICATION" } });
  console.log("Needs Verification Temples:", needsVerification);

  await prisma.$disconnect();
}

diagnose().catch((err) => {
  console.error("Diagnostic error:", err);
  process.exit(1);
});
