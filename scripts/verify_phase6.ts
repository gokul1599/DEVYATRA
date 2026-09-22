/**
 * Phase 6 Comprehensive Verification Script
 * Validates data trust, centroid de-quarantine, quality score engine,
 * multilingual search, and admin command center integrity.
 */
import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { calculateQualityScore } from "../src/lib/quality/score";
import { getAdminDashboardData, resolveTemple } from "../src/lib/db/directory";
import { canonical, search } from "../src/lib/search";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function verifyPhase6() {
  console.log("==================================================");
  console.log("🇮🇳 DEVYATRA PHASE 6 COMPREHENSIVE VERIFICATION");
  console.log("==================================================\n");

  let passes = 0;
  let failures = 0;

  const assert = (condition: boolean, title: string, detail?: string) => {
    if (condition) {
      console.log(`✅ [PASS] ${title}${detail ? ` (${detail})` : ""}`);
      passes++;
    } else {
      console.error(`❌ [FAIL] ${title}${detail ? ` (${detail})` : ""}`);
      failures++;
    }
  };

  // 1. Centroid De-quarantine Check
  console.log("1. Centroid De-quarantine Audit:");
  const centroidCount = await prisma.temple.count({
    where: { isCentroidFallback: true },
  });
  assert(centroidCount === 0, "All 7 centroid fallbacks de-quarantined", `Remaining: ${centroidCount}`);

  const ashtaSomeswaras = await prisma.temple.findFirst({
    where: { name: { contains: "Ashta Someswaras" } },
    include: { sources: true },
  });
  assert(
    Boolean(ashtaSomeswaras && ashtaSomeswaras.latitude === 16.7933 && ashtaSomeswaras.longitude === 82.0625),
    "Ashta Someswaras coordinates verified at Draksharamam (16.7933, 82.0625)"
  );
  assert(
    Boolean(ashtaSomeswaras && ashtaSomeswaras.sources.length > 0),
    "Ashta Someswaras has authoritative TempleSource provenance citation"
  );

  const bichpuria = await prisma.temple.findFirst({
    where: { name: { contains: "Bichpuria" } },
    include: { sources: true },
  });
  assert(
    Boolean(bichpuria && bichpuria.asiMonumentId === "N-RJ-111" && !bichpuria.isCentroidFallback),
    "Yupa Pillars in Bichpuria Temple verified with ASI Monument ID N-RJ-111"
  );

  // 2. Data Quality Score Engine Check
  console.log("\n2. Data Quality Score Engine Audit:");
  if (bichpuria) {
    const scoreBreakdown = calculateQualityScore(bichpuria);
    assert(
      scoreBreakdown.total >= 40 && scoreBreakdown.total <= 100,
      `Bichpuria quality score computed cleanly: ${scoreBreakdown.total}/100`,
      `Coords: ${scoreBreakdown.categories.coordinates.score}/20, Source: ${scoreBreakdown.categories.source.score}/20`
    );
  }

  // 3. Admin Command Center Metrics Check
  console.log("\n3. Admin Command Center Data Audit:");
  const adminData = await getAdminDashboardData();
  assert(
    adminData.metrics.templesIndexed >= 1655,
    "Admin dashboard reports live temple count",
    `${adminData.metrics.templesIndexed} temples`
  );
  assert(
    adminData.metrics.statesCount === 36,
    "Admin dashboard reports 36 active states & UTs",
    `${adminData.metrics.statesCount} states`
  );
  assert(
    adminData.metrics.pendingCoordinates === 0,
    "Admin dashboard reports 0 pending centroid coordinates",
    `${adminData.metrics.pendingCoordinates} pending`
  );
  assert(
    adminData.recentAudits.length > 0,
    "Admin dashboard loads active audit trail events",
    `${adminData.recentAudits.length} events`
  );

  // 4. Multilingual Search & Unicode Preservation
  console.log("\n4. Multilingual Search & Script Audit:");
  const teluguCanonical = canonical("తిరుపతి వేంకటేశ్వర");
  assert(
    teluguCanonical.includes("తిరుపతి"),
    "Unicode canonical preserves Telugu script tokens",
    teluguCanonical
  );

  const tamilCanonical = canonical("மீனாட்சி அம்மன்");
  assert(
    tamilCanonical.includes("மீனாட்சி"),
    "Unicode canonical preserves Tamil script tokens",
    tamilCanonical
  );

  const hindiCanonical = canonical("काशी विश्वनाथ");
  assert(
    hindiCanonical.includes("काशी"),
    "Unicode canonical preserves Devanagari script tokens",
    hindiCanonical
  );

  const localSearchResults = search("Tirupati", 5);
  assert(
    localSearchResults.temples.length > 0,
    "Search engine resolves known pilgrimage centers",
    `Found ${localSearchResults.temples.length} temples`
  );

  // 5. Dynamic Detail Page Resolution Audit
  console.log("\n5. Temple Detail Dynamic Resolution Audit:");
  const dequarantinedDetail = await resolveTemple("yupa-pillars-in-bichpuria-temple-rajasthan-000519");
  assert(
    Boolean(
      dequarantinedDetail &&
        "isCentroidFallback" in dequarantinedDetail &&
        !dequarantinedDetail.isCentroidFallback
    ),
    "Dequarantined temple resolves dynamically with non-centroid flag"
  );

  console.log("\n==================================================");
  console.log(`Audit Summary: ${passes} PASS, ${failures} FAIL`);
  console.log("==================================================");

  if (failures > 0) {
    process.exit(1);
  }
}

verifyPhase6()
  .catch((err) => {
    console.error("Verification crashed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
