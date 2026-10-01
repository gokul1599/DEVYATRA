const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../../src/generated/prisma/client");
const fs = require("node:fs");
const path = require("node:path");

if (fs.existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (fs.existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function run() {
  const totalTemples = await prisma.temple.count();
  const centroidTrue = await prisma.temple.count({ where: { isCentroidFallback: true } });
  const centroidFalse = await prisma.temple.count({ where: { isCentroidFallback: false } });
  const totalPlaces = await prisma.place.count();
  const totalLocalities = await prisma.locality.count();
  const totalDistricts = await prisma.district.count();
  const totalStates = await prisma.state.count();

  console.log("DB Stats:", {
    totalTemples,
    centroidTrue,
    centroidFalse,
    totalPlaces,
    totalLocalities,
    totalDistricts,
    totalStates,
  });

  // Check verification statuses
  const templeStatuses = await prisma.temple.groupBy({
    by: ["verificationStatus"],
    _count: true,
  });
  console.log("Temple verification statuses:", templeStatuses);

  const placeStatuses = await prisma.place.groupBy({
    by: ["verificationStatus"],
    _count: true,
  });
  console.log("Place verification statuses:", placeStatuses);

  await prisma.$disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
