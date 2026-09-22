import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client/index.js";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
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

  const zeroCoords = await prisma.temple.count({
    where: { OR: [{ latitude: 0 }, { longitude: 0 }] }
  });
  console.log("Zero Coordinates Count:", zeroCoords);

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

  // Check top 10 districts
  const templesPerDistrict = await prisma.temple.groupBy({
    by: ["districtId"],
    _count: { _all: true },
    orderBy: { _count: { districtId: "desc" } }
  });
  console.log(`\nDistinct Districts with Temples: ${templesPerDistrict.length}`);

  // Distinct verification & operational states
  const byGoogleStatus = await prisma.temple.groupBy({
    by: ["googlePlaceVerificationStatus"],
    _count: { _all: true }
  });
  console.log("\nBy Google Place Verification Status:");
  for (const g of byGoogleStatus) {
    console.log(`  - ${g.googlePlaceVerificationStatus}: ${g._count._all}`);
  }

  await prisma.$disconnect();
}

diagnose().catch((err) => {
  console.error("Diagnostic error:", err);
  process.exit(1);
});
