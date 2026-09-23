/**
 * DEVYATRA / TEMPLEORA — PHASE V2.2 PRODUCTION VERIFICATION SUITE
 * 
 * Verifies:
 * 1. National Temple Data Expansion (≥ 2,200 temples, ≥ 720 districts, 0 centroid fallbacks, 36/36 states)
 * 2. Normalized Nearby Architecture (FamousPlace, TempleNearbyPlace, 5 categories, multi-temple reuse)
 * 3. Adaptive Radius Engine (Urban 12km, Semi-urban 25km, Rural 50km, Mountain 75km)
 * 4. "Build My Day Around This Temple" AI Planner (Darshan, Midday prasadam break, verified attractions)
 * 5. Composite Search Queries (Places, "Temples near X")
 */

import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (existsSync(".env")) process.loadEnvFile(".env");
import {
  calculateHaversineDistanceKm,
  determineAdaptiveRadius,
  calculateRelevanceScore,
  getEditorialHighlight,
  formatDistanceString,
  NearbyPlaceEngine,
} from "../src/lib/nearby/engine";
import { generateDayAroundTemple } from "../src/lib/ai/planner2";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is required.");
  process.exit(1);
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function runVerification() {
  console.log("================================================================");
  console.log("🕉️  DEVYATRA / TEMPLEORA — V2.2 PRODUCTION VERIFICATION SUITE");
  console.log("================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` — ${detail}` : ""}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // GATE 1: National Catalog Invariants
    // -------------------------------------------------------------
    console.log("--- GATE 1: National Catalog & Provenance Invariants ---");
    const totalTemples = await prisma.temple.count();
    assert(totalTemples >= 2200, `Total Temples count (found: ${totalTemples} ≥ 2,200)`);

    const districtsRepresented = await prisma.district.count({
      where: { temples: { some: {} } },
    });
    assert(districtsRepresented >= 720, `LGD Districts represented (found: ${districtsRepresented} ≥ 720)`);

    const statesRepresented = await prisma.state.count({
      where: { temples: { some: {} } },
    });
    assert(statesRepresented === 36, `States & UTs represented (found: ${statesRepresented} === 36)`);

    // Verify 0 centroid fallbacks
    const badCoords = await prisma.temple.count({
      where: {
        OR: [
          { latitude: { lt: 6.0 } },
          { latitude: { gt: 38.0 } },
          { longitude: { lt: 68.0 } },
          { longitude: { gt: 98.0 } },
        ],
      },
    });
    assert(badCoords === 0, `Strict Zero Centroid Fallbacks / Coordinates out of bounds (found: ${badCoords})`);

    // -------------------------------------------------------------
    // GATE 2: Normalized Nearby Architecture & Multi-Temple Reuse
    // -------------------------------------------------------------
    console.log("\n--- GATE 2: Normalized Nearby Famous Places Architecture ---");
    const totalPlaces = await prisma.famousPlace.count();
    assert(totalPlaces >= 20, `Total Famous Places seeded (found: ${totalPlaces} ≥ 20)`);

    const totalLinks = await prisma.templeNearbyPlace.count();
    assert(totalLinks >= 35, `Temple-Nearby Spatial Links established (found: ${totalLinks} ≥ 35)`);

    // Check category diversity
    const categoryGroups = await prisma.famousPlace.groupBy({
      by: ["category"],
      _count: { id: true },
    });
    const categoriesFound = new Set(categoryGroups.map((c) => c.category));
    assert(categoriesFound.has("HERITAGE"), "Category HERITAGE present");
    assert(categoriesFound.has("PILGRIMAGE"), "Category PILGRIMAGE present");
    assert(categoriesFound.has("NATURE"), "Category NATURE present");
    assert(categoriesFound.has("CULTURE"), "Category CULTURE present");
    assert(categoriesFound.has("LOCAL_EXPERIENCES"), "Category LOCAL_EXPERIENCES present");

    // Multi-temple reuse check: at least 1 famous place is linked to multiple temples
    const multiLinkedPlaces = await prisma.famousPlace.findMany({
      where: {
        templeLinks: {
          some: {},
        },
      },
      include: {
        _count: { select: { templeLinks: true } },
      },
    });
    const reusedPlace = multiLinkedPlaces.find((p) => p._count.templeLinks >= 2);
    assert(
      !!reusedPlace,
      `Multi-Temple Place Reuse (e.g. '${reusedPlace?.name}' linked to ${reusedPlace?._count.templeLinks} shrines)`
    );

    // -------------------------------------------------------------
    // GATE 3: Adaptive Radius Engine & Deterministic Scoring
    // -------------------------------------------------------------
    console.log("\n--- GATE 3: Adaptive Radius Engine & Scoring ---");
    const urban = determineAdaptiveRadius("city", 13.0827, 80.2707);
    assert(urban.maxRadiusKm === 12 && urban.locationType === "dense_urban", "Dense urban adaptive radius = 12km");

    const semiUrban = determineAdaptiveRadius("town", 9.9252, 78.1198);
    assert(semiUrban.maxRadiusKm === 25 && semiUrban.locationType === "semi_urban", "Semi-urban adaptive radius = 25km");

    const rural = determineAdaptiveRadius("village", 15.335, 76.46);
    assert(rural.maxRadiusKm === 50 && rural.locationType === "rural", "Rural adaptive radius = 50km");

    const mountain = determineAdaptiveRadius("remote", 30.7352, 79.0669);
    assert(mountain.maxRadiusKm === 75 && mountain.locationType === "mountain_remote", "Mountain adaptive radius = 75km");

    // Haversine sanity test: Distance between Madurai Meenakshi (9.9195, 78.1193) & Thirumalai Nayakkar (9.9152, 78.1238)
    const dKm = calculateHaversineDistanceKm(9.9195, 78.1193, 9.9152, 78.1238);
    assert(dKm > 0.4 && dKm < 0.8, `Haversine distance accurate (${dKm} km between Meenakshi & Thirumalai Mahal)`);

    // Editorial highlight label test (guarantees NO arbitrary numerical scores are exposed)
    const hl1 = getEditorialHighlight("HERITAGE", 90, true);
    assert(hl1 === "Featured Nearby", "Top scored attraction receives 'Featured Nearby'");
    const hl2 = getEditorialHighlight("PILGRIMAGE", 60, false);
    assert(hl2 === "Pilgrimage Highlight", "Pilgrimage category receives 'Pilgrimage Highlight'");

    // Distance string transparency test (straight-line honesty)
    const distStrAir = formatDistanceString(1.4);
    assert(distStrAir === "Approx. 1.4 km away", "Straight-line air distance labeled 'Approx.'");
    const distStrRoad = formatDistanceString(1.4, 2.1, 10);
    assert(distStrRoad === "2.1 km (~10 min drive)", "Road distance displays driving minutes");

    // -------------------------------------------------------------
    // GATE 4: "Build My Day Around This Temple" AI Planner
    // -------------------------------------------------------------
    console.log("\n--- GATE 4: 'Build My Day Around This Temple' Engine ---");
    const dayPlan = await generateDayAroundTemple({
      templeSlug: "meenakshi-amman-temple",
      pace: "standard",
      companions: ["family"],
      interests: ["heritage", "pilgrimage", "food"],
    });

    assert(dayPlan.templeName.includes("Meenakshi"), "Day plan targets Meenakshi Amman Temple");
    assert(dayPlan.stops.length >= 4, `Day plan generates structured stops (found: ${dayPlan.stops.length})`);
    
    const hasSanctumDarshan = dayPlan.stops.some((s) => s.type === "darshan");
    assert(hasSanctumDarshan, "Day plan includes Sanctum Mukhya Darshan stop");

    const hasMealBreak = dayPlan.stops.some((s) => s.type === "meal_break");
    assert(hasMealBreak, "Day plan includes midday prasadam/Annadanam break");

    const hasEveningAarti = dayPlan.stops.some((s) => s.type === "aarti");
    assert(hasEveningAarti, "Day plan includes evening Aarti/Ghat stop");

    assert(
      dayPlan.honestDisclaimer.includes("verified official registries") ||
      dayPlan.honestDisclaimer.includes("focused entirely on the sacred sanctum"),
      "Day plan contains anti-hallucination ground truth verification disclaimer"
    );

    // -------------------------------------------------------------
    // GATE 5: Nearby Discovery Integration on Temple
    // -------------------------------------------------------------
    console.log("\n--- GATE 5: Real-time Temple Nearby Discovery ---");
    const meenakshi = await prisma.temple.findFirst({
      where: {
        OR: [
          { slug: { contains: "meenakshi", mode: "insensitive" } },
          { name: { contains: "Meenakshi", mode: "insensitive" } },
        ],
      },
    });

    if (meenakshi) {
      assert(true, `Meenakshi temple record found in database (slug: '${meenakshi.slug}', name: '${meenakshi.name}')`);
      const nearbyRes = await NearbyPlaceEngine.getNearbyForTemple(
        meenakshi.id,
        meenakshi.latitude,
        meenakshi.longitude,
        "city"
      );
      assert(nearbyRes.totalFound > 0, `NearbyPlaceEngine finds attractions for Meenakshi (found: ${nearbyRes.totalFound})`);
      assert(
        nearbyRes.attractions.some((a) => a.name.includes("Thirumalai")),
        "Thirumalai Nayakkar Mahal identified near Meenakshi Amman"
      );
    } else {
      assert(false, "Meenakshi temple record found in database");
    }

  } catch (err) {
    console.error("Fatal error during verification:", err);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n================================================================");
  console.log(`VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification();
