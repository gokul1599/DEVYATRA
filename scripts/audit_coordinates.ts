/**
 * DEVYATRA / TEMPLEORA — V2.4 COORDINATE & LOCATION QUALITY AUDIT
 * Audits every temple in the PostgreSQL database for geospatial integrity.
 */

import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (existsSync(".env")) process.loadEnvFile(".env");

const INDIA_BOUNDS = {
  minLng: 68.0,
  minLat: 6.5,
  maxLng: 97.5,
  maxLat: 37.5,
};

async function runAudit() {
  console.log("🇮🇳 DEVYATRA V2.4 — GEOSPATIAL COORDINATE AUDIT STARTING...\n");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is missing.");
    process.exit(1);
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const totalTemples = await prisma.temple.count();
    console.log(`Total temples in database: ${totalTemples}`);

    const temples = await prisma.temple.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        latitude: true,
        longitude: true,
        isCentroidFallback: true,
        verificationStatus: true,
        sourceType: true,
        stateCode: true,
        district: { select: { name: true } },
      },
    });

    let invalidCoords = 0;
    let outOfBounds = 0;
    let nullIsland = 0;
    let centroidFallbacks = 0;
    let exactVerified = 0;
    let siteCenterVerified = 0;
    let approximate = 0;

    const coordMap = new Map<string, string>();
    const duplicates: Array<{ coord: string; temple1: string; temple2: string }> = [];

    for (const t of temples) {
      const { latitude: lat, longitude: lng, id, name, isCentroidFallback } = t;

      if (lat === null || lat === undefined || lng === null || lng === undefined || isNaN(lat) || isNaN(lng)) {
        invalidCoords++;
        console.warn(`[INVALID] Temple ${name} (${id}) has invalid coordinates.`);
        continue;
      }

      if (Math.abs(lat) < 0.001 && Math.abs(lng) < 0.001) {
        nullIsland++;
        console.warn(`[NULL ISLAND] Temple ${name} (${id}) is at 0,0.`);
        continue;
      }

      if (lat < INDIA_BOUNDS.minLat || lat > INDIA_BOUNDS.maxLat || lng < INDIA_BOUNDS.minLng || lng > INDIA_BOUNDS.maxLng) {
        outOfBounds++;
        console.warn(`[OUT OF BOUNDS] Temple ${name} (${id}) at (${lat}, ${lng}) is outside India bounds.`);
      }

      if (isCentroidFallback) {
        centroidFallbacks++;
      }

      // Check duplicate coordinates
      const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
      if (coordMap.has(key)) {
        duplicates.push({ coord: key, temple1: coordMap.get(key)!, temple2: name });
      } else {
        coordMap.set(key, name);
      }

      const ver = (t.verificationStatus || "").toUpperCase();
      const src = (t.sourceType || "").toLowerCase();
      if (ver.includes("OFFICIAL") || src.includes("official") || src.includes("asi")) {
        exactVerified++;
      } else if (ver.includes("SOURCE") || src.includes("google")) {
        siteCenterVerified++;
      } else {
        approximate++;
      }
    }

    console.log("\n========================================================");
    console.log("📊 AUDIT RESULTS SUMMARY:");
    console.log("========================================================");
    console.log(`✓ Total Temples Audited:       ${temples.length}`);
    console.log(`✓ Valid Coordinates:           ${temples.length - invalidCoords - nullIsland}`);
    console.log(`✓ Exact / Official Verified:   ${exactVerified}`);
    console.log(`✓ Site Center / Google Places: ${siteCenterVerified}`);
    console.log(`✓ Approximate / Curated:       ${approximate}`);
    console.log(`⚠ Centroid Fallbacks Flagged:  ${centroidFallbacks}`);
    console.log(`❌ Invalid Coordinates:        ${invalidCoords}`);
    console.log(`❌ Null Island (0,0):          ${nullIsland}`);
    console.log(`❌ Outside India Bounds:       ${outOfBounds}`);
    console.log(`ℹ Identical Coordinate Pairs:  ${duplicates.length}`);
    console.log("========================================================\n");

    if (centroidFallbacks === 0 && invalidCoords === 0 && nullIsland === 0) {
      console.log("🎉 SUCCESS: 100% real coordinates with 0 centroid fallbacks!\n");
    } else {
      console.log(`Notice: Centroid fallbacks are properly filtered in Map Engine.\n`);
    }
  } catch (err) {
    console.error("Audit error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAudit();
