import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { POPULAR_DISTRICTS } from "../../src/lib/map/admin-boundaries";
import { haversineDistanceKm } from "../../src/lib/canonical/canonical-identity";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function run() {
  // Query all temples that have a REAL (non-Central) district
  const nonCentralTemples = await prisma.temple.findMany({
    where: {
      district: {
        name: { not: { contains: "Central" } }
      },
      latitude: { not: 0 },
      longitude: { not: 0 }
    },
    select: {
      districtId: true,
      latitude: true,
      longitude: true,
      stateCode: true,
      district: { select: { id: true, name: true } }
    }
  });

  console.log(`Found ${nonCentralTemples.length} temples with real districts.`);

  // Group by districtId and compute average centroid
  const distMap = new Map<string, { latSum: number; lngSum: number; count: number; name: string; stateCode: string }>();
  for (const t of nonCentralTemples) {
    const entry = distMap.get(t.districtId) || { latSum: 0, lngSum: 0, count: 0, name: t.district.name, stateCode: t.stateCode };
    entry.latSum += t.latitude;
    entry.lngSum += t.longitude;
    entry.count += 1;
    distMap.set(t.districtId, entry);
  }

  console.log(`Derived centroids for ${distMap.size} distinct real districts from existing temples!`);

  // Now test matching the 715 central temples against these derived centroids within the SAME state
  const centralTemples = await prisma.temple.findMany({
    where: {
      district: { name: { contains: "Central" } }
    },
    select: {
      id: true,
      name: true,
      address: true,
      latitude: true,
      longitude: true,
      stateCode: true
    }
  });

  let resolved = 0;
  let remaining = 0;

  for (const t of centralTemples) {
    let bestDistId: string | null = null;
    let minDist = Infinity;

    for (const [dId, c] of distMap.entries()) {
      if (c.stateCode.toUpperCase() === t.stateCode.toUpperCase()) {
        const centerLat = c.latSum / c.count;
        const centerLng = c.lngSum / c.count;
        const d = haversineDistanceKm(t.latitude, t.longitude, centerLat, centerLng);
        if (d < minDist) {
          minDist = d;
          bestDistId = dId;
        }
      }
    }

    if (bestDistId && minDist <= 150.0) {
      resolved++;
    } else {
      remaining++;
    }
  }

  console.log(`Using derived district centroids:`);
  console.log(`- Resolved: ${resolved} / ${centralTemples.length} (${((resolved / centralTemples.length) * 100).toFixed(1)}%)`);
  console.log(`- Remaining: ${remaining}`);

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
