import { existsSync } from "node:fs";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (existsSync(".env")) process.loadEnvFile(".env");

import { getPrisma } from "../../src/lib/db/client";

async function main() {
  const prisma = getPrisma();
  if (!prisma) {
    console.error("Prisma client not available");
    return;
  }
  const localityCount = await prisma.locality.count();
  console.log("Total localities in DB:", localityCount);
  
  const sampleLocs = await prisma.locality.findMany({
    take: 5,
    select: { id: true, name: true, kind: true, latitude: true, longitude: true, district: { select: { name: true } }, state: { select: { name: true } } }
  });
  console.log("Sample localities:", sampleLocs);

  // Check temples with locality or address matching sample
  const testCities = ["Madurai", "Puri", "Tirupati", "Varanasi", "Sringeri", "Kukke", "Ujjain", "Ayodhya", "Gokarna", "Hampi"];
  for (const city of testCities) {
    const temples = await prisma.temple.findMany({
      where: {
        OR: [
          { address: { contains: city, mode: "insensitive" } },
          { name: { contains: city, mode: "insensitive" } },
          { locality: { name: { contains: city, mode: "insensitive" } } },
          { district: { name: { contains: city, mode: "insensitive" } } },
          { adminUnit: { name: { contains: city, mode: "insensitive" } } },
        ]
      },
      select: { id: true, name: true, address: true, district: { select: { name: true } } },
      take: 3
    });
    console.log(`Found ${temples.length} temples for "${city}":`, temples.map(t => `${t.name} (${t.district?.name})`));
  }
}

main().catch(console.error);
