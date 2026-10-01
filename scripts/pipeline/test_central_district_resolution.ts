import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { POPULAR_DISTRICTS, STATE_BOUNDARIES } from "../../src/lib/map/admin-boundaries";
import { haversineDistanceKm } from "../../src/lib/canonical/canonical-identity";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function run() {
  const centralTemples = await prisma.temple.findMany({
    where: {
      district: {
        name: { contains: "Central" }
      }
    },
    select: {
      id: true,
      name: true,
      address: true,
      latitude: true,
      longitude: true,
      stateCode: true,
      district: { select: { id: true, name: true } }
    }
  });

  const allRealDistricts = await prisma.district.findMany({
    where: {
      name: { not: { contains: "Central" } }
    },
    select: {
      id: true,
      name: true,
      slug: true,
      officialCode: true,
      state: { select: { code: true } }
    }
  });

  console.log(`Total temples with synthetic Central district: ${centralTemples.length}`);
  console.log(`Total real districts in DB: ${allRealDistricts.length}`);

  // Build lookup of district centroids from POPULAR_DISTRICTS and temples in that district
  const districtCentroids = new Map<string, { lat: number; lng: number }>();
  for (const [_, pd] of Object.entries(POPULAR_DISTRICTS)) {
    districtCentroids.set(pd.name.toLowerCase().trim(), pd.center);
  }

  let resolvedByAddress = 0;
  let resolvedByCoords = 0;
  let unresolved = 0;

  const resolutionSamples: any[] = [];

  for (const t of centralTemples) {
    const stateDists = allRealDistricts.filter(d => 
      d.state.code.toUpperCase() === t.stateCode.toUpperCase() ||
      (t.stateCode.toUpperCase() === "UK" && d.state.code.toUpperCase() === "UT")
    );

    let assignedDistrict: typeof allRealDistricts[0] | null = null;
    let method = "";

    // 1. Check address for real district name
    const addr = (t.address || "").toLowerCase();
    for (const d of stateDists) {
      const dName = d.name.toLowerCase();
      if (addr.includes(dName) && dName.length > 3) {
        assignedDistrict = d;
        method = `address_match ("${d.name}")`;
        resolvedByAddress++;
        break;
      }
    }

    // 2. If not found in address, find closest district with known centroid in that state
    if (!assignedDistrict && t.latitude && t.longitude) {
      let minDist = Infinity;
      let closestDist: typeof allRealDistricts[0] | null = null;

      for (const d of stateDists) {
        const center = districtCentroids.get(d.name.toLowerCase().trim());
        if (center) {
          const dist = haversineDistanceKm(t.latitude, t.longitude, center.lat, center.lng);
          if (dist < minDist) {
            minDist = dist;
            closestDist = d;
          }
        }
      }

      if (closestDist && minDist <= 120.0) {
        assignedDistrict = closestDist;
        method = `coord_proximity (${closestDist.name}, ${minDist.toFixed(1)} km)`;
        resolvedByCoords++;
      }
    }

    // 3. Fallback: if state has districts, pick the most appropriate or state capital district
    if (!assignedDistrict && stateDists.length > 0) {
      unresolved++;
    }

    if (resolutionSamples.length < 25) {
      resolutionSamples.push({
        id: t.id,
        name: t.name,
        state: t.stateCode,
        assigned: assignedDistrict ? assignedDistrict.name : "UNRESOLVED",
        method,
      });
    }
  }

  console.log(`Resolution results:`);
  console.log(`- Resolved by explicit address: ${resolvedByAddress} (${((resolvedByAddress / centralTemples.length) * 100).toFixed(1)}%)`);
  console.log(`- Resolved by geodetic proximity: ${resolvedByCoords} (${((resolvedByCoords / centralTemples.length) * 100).toFixed(1)}%)`);
  console.log(`- Remaining needing fallback: ${unresolved} (${((unresolved / centralTemples.length) * 100).toFixed(1)}%)`);

  console.log("\nSample Resolutions:");
  console.log(resolutionSamples);

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
