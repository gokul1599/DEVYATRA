import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

async function main() {
  const temples = await prisma.temple.count();
  const states = await prisma.state.count({ where: { temples: { some: {} } } });
  const districts = await prisma.district.count({ where: { temples: { some: {} } } });
  const pendingVerif = await prisma.temple.count({ where: { verificationStatus: "NEEDS_VERIFICATION" } });
  const centroids = await prisma.temple.count({ where: { isCentroidFallback: true } });
  const verifiedOfficial = await prisma.temple.count({ where: { verificationStatus: "VERIFIED_OFFICIAL" } });
  const verifiedSource = await prisma.temple.count({ where: { verificationStatus: "VERIFIED_SOURCE" } });
  const verifiedCoordinates = await prisma.temple.count({ where: { isCentroidFallback: false, latitude: { not: 0 } } });

  console.log("DATABASE_LIVE_METRICS:", JSON.stringify({
    temples,
    states,
    districts,
    pendingVerif,
    centroids,
    verifiedOfficial,
    verifiedSource,
    verifiedCoordinates,
  }, null, 2));

  await prisma.$disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
