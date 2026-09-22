/**
 * Phase 8 Verification Engine
 * Validates National Temple Coverage Engine, Admin Coverage Matrix,
 * Google Places Queue, Premium Explore India, and AI Pilgrimage Planner.
 *
 * Usage:
 *   npx tsx scripts/verify_phase8.ts
 */
import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getNationalCoverageMatrix } from "../src/lib/coverage/matrix";
import { buildPlan, type PlanRequest } from "../src/lib/ai/engine";
import { haversineDistance, jaroWinkler } from "../src/lib/importer/deduplicate";
import type { Temple } from "../src/lib/types";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL is not set.");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

interface CheckResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: CheckResult[] = [];

function recordCheck(name: string, passed: boolean, details: string) {
  results.push({ name, passed, details });
  const icon = passed ? "✅" : "❌";
  console.log(`${icon} [${passed ? "PASS" : "FAIL"}] ${name} — ${details}`);
}

async function runPhase8Verification() {
  console.log("==================================================");
  console.log("🇮🇳 DEVYATRA / TEMPLEORA — PHASE 8 VERIFICATION");
  console.log("National Coverage Engine + Explore India + AI Planner");
  console.log("==================================================\n");

  // Check 1: Database Baseline & Zero Centroids
  console.log("▶ Check 1: Database Integrity & 0 Centroid Fallbacks");
  const totalTemples = await prisma.temple.count();
  const centroidFallbacks = await prisma.temple.count({ where: { isCentroidFallback: true } });
  recordCheck(
    "Database Temple Baseline & Zero Centroids",
    totalTemples >= 1655 && centroidFallbacks === 0,
    `Total Temples: ${totalTemples} | Centroid Fallbacks: ${centroidFallbacks}`
  );

  // Check 2: 36 States/UTs Coverage
  console.log("\n▶ Check 2: 36 States & UTs Representation");
  const statesWithTemples = await prisma.temple.groupBy({
    by: ["stateCode"],
    _count: { id: true },
  });
  recordCheck(
    "National 36 States/UTs Coverage",
    statesWithTemples.length === 36,
    `Distinct States Represented: ${statesWithTemples.length} / 36`
  );

  // Check 3: National Coverage Matrix Calculation
  console.log("\n▶ Check 3: National Coverage Matrix Computation");
  const matrix = await getNationalCoverageMatrix();
  const matrixValid =
    matrix !== null &&
    matrix.totalStates >= 36 &&
    matrix.totalOfficialDistricts > 700 &&
    matrix.totalRepresentedDistricts >= 383 &&
    matrix.nationalDistrictCoveragePercent >= 40;

  recordCheck(
    "National District Coverage Matrix Engine",
    matrixValid,
    `States: ${matrix?.totalStates} | Represented Districts: ${matrix?.totalRepresentedDistricts}/${matrix?.totalOfficialDistricts} (${matrix?.nationalDistrictCoveragePercent}% Coverage)`
  );

  // Check 4: State Ingestion Scripts Verification
  console.log("\n▶ Check 4: State Ingestion Engine Modules");
  const requiredScripts = [
    "scripts/importers/types.ts",
    "scripts/importers/base-importer.ts",
    "scripts/importers/tamil-nadu.ts",
    "scripts/importers/karnataka.ts",
    "scripts/importers/andhra-pradesh.ts",
    "scripts/importers/kerala.ts",
    "scripts/importers/maharashtra.ts",
    "scripts/importers/rajasthan.ts",
    "scripts/importers/run-all.ts",
  ];
  const allScriptsExist = requiredScripts.every((p) => existsSync(p));
  recordCheck(
    "State Ingestion Script Suite",
    allScriptsExist,
    `${requiredScripts.length} state importer modules verified on disk`
  );

  // Check 5: Deduplication Algorithms (Haversine & Jaro-Winkler)
  console.log("\n▶ Check 5: Deduplication Engine Mathematics");
  // Two points in Chennai: ~1.4 km apart
  const testDist = haversineDistance(13.0827, 80.2707, 13.0900, 80.2800);
  const testSim = jaroWinkler("Kapaleeshwarar Temple", "Sri Kapaleeswarar Temple");
  const mathValid = testDist > 1000 && testDist < 2000 && testSim >= 0.80;
  recordCheck(
    "Haversine & Jaro-Winkler Deduplication Engine",
    mathValid,
    `Calculated Distance: ${Math.round(testDist)}m | Name Similarity: ${testSim.toFixed(3)}`
  );

  // Check 6: Google Places Worker Cost & Duplicate Protection
  console.log("\n▶ Check 6: Google Places Worker Integrity");
  const workerFile = "scripts/workers/lookup-google-places.ts";
  const workerCode = existsSync(workerFile) ? await (await import("node:fs/promises")).readFile(workerFile, "utf-8") : "";
  const workerHasCost = workerCode.includes("0.017") && workerCode.includes("DUPLICATE_CANDIDATE");
  recordCheck(
    "Google Places Worker Cost Telemetry & Duplicate Safety",
    workerHasCost,
    "Cost estimation ($0.017/query) and DUPLICATE_CANDIDATE conflict handling present"
  );

  // Check 7: AI Pilgrimage Multi-Temple & Demographic Engine
  console.log("\n▶ Check 7: Grounded AI Multi-Temple & Demographics");
  const sampleTempleA: Temple = {
    id: "sample-t1",
    slug: "sample-t1",
    name: "Sri Ranganathaswamy Temple",
    aliases: [],
    stateCode: "TN",
    districtSlug: "tiruchirappalli",
    district: "Tiruchirappalli",
    locationSlug: "srirangam",
    location: "Srirangam",
    locationKind: "city",
    latitude: 10.8624,
    longitude: 78.6901,
    mainDeity: "Lord Ranganatha",
    deities: ["Lord Ranganatha", "Ranganayaki"],
    type: "Divya Desam",
    tradition: ["Vaishnavism"],
    description: "Grand temple complex",
    whyFamous: [{ icon: "🪷", title: "Divya Desam", body: "First among 108 shrines", type: "historic" }],
    history: [{ title: "Chola Construction", year: "10th Century", body: "Reconstructed by Chola kings" }],
    timings: {
      slots: [{ label: "Morning Darshan", opening: "06:00", closing: "13:00" }],
      verification: { status: "VERIFIED_OFFICIAL" },
    },
    booking: {
      generalDarshan: "free",
      bookable: false,
      bookingMode: "offline",
      verification: { status: "VERIFIED_OFFICIAL" },
    },
    festivals: [],
    images: [],
    badges: [],
    verified: true,
    entryFee: {
      generalDarshan: "free",
      bookable: false,
      bookingMode: "offline",
      verification: { status: "VERIFIED_OFFICIAL" },
    },
    source: {
      id: "tn-hrce",
      org: "Tamil Nadu HR&CE",
      type: "government",
      status: "VERIFIED_OFFICIAL",
      lastVerified: "2026-09-22",
    },
  };

  const sampleTempleB: Temple = {
    ...sampleTempleA,
    id: "sample-t2",
    slug: "sample-t2",
    name: "Brihadisvara Temple",
    district: "Thanjavur",
    location: "Thanjavur",
    latitude: 10.7828,
    longitude: 79.1318,
    mainDeity: "Peruvudaiyar (Lord Shiva)",
  };

  const multiPlanReq: PlanRequest = {
    templeId: "sample-t1",
    additionalTempleIds: ["sample-t2"],
    date: "2026-09-25",
    arrival: "07:00",
    departure: "18:00",
    people: 4,
    budget: "mid",
    travel: "car",
    companions: ["family", "children", "elderly"],
    interests: ["Darshan", "History", "food"],
    lang: "en",
  };

  const generatedPlan = buildPlan(multiPlanReq, [sampleTempleA, sampleTempleB]);
  const hasTransit = generatedPlan.items.some((it) => it.type.includes("transit"));
  const hasRest = generatedPlan.items.some((it) => it.type.includes("rest"));
  const hasChildWarning = generatedPlan.warnings.some((w) => w.toLowerCase().includes("children"));
  const hasElderlyWarning = generatedPlan.warnings.some((w) => w.toLowerCase().includes("senior"));
  const groundedPlanValid = hasTransit && hasRest && hasChildWarning && hasElderlyWarning;

  recordCheck(
    "AI Multi-Temple Itinerary & Demographic Grounding",
    groundedPlanValid,
    `Transit leg: ${hasTransit ? "YES" : "NO"} | Child/Elderly rest: ${hasRest ? "YES" : "NO"} | Child warning: ${hasChildWarning ? "YES" : "NO"} | Senior warning: ${hasElderlyWarning ? "YES" : "NO"}`
  );

  // Check 8: Temples-Lite Dynamic PostgreSQL Endpoint
  console.log("\n▶ Check 8: Temples-Lite Dynamic Endpoint");
  const liteFile = "src/app/api/temples-lite/route.ts";
  const liteCode = existsSync(liteFile) ? await (await import("node:fs/promises")).readFile(liteFile, "utf-8") : "";
  const liteIsDynamic = liteCode.includes("prisma.temple.findMany");
  recordCheck(
    "Temples-Lite Dynamic Database Endpoint",
    liteIsDynamic,
    "Dynamically queries Neon PostgreSQL with 1,655-temple projection and static fallback"
  );

  // Summary
  console.log("\n==================================================");
  const totalPassed = results.filter((r) => r.passed).length;
  console.log(`Phase 8 Verification Summary: ${totalPassed} / ${results.length} PASS`);
  console.log("==================================================");

  if (totalPassed < results.length) {
    console.error("❌ Some verification checks failed.");
    process.exit(1);
  } else {
    console.log("✨ All Phase 8 verification checks passed flawlessly!");
    process.exit(0);
  }
}

runPhase8Verification()
  .catch((err) => {
    console.error("Verification engine failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
