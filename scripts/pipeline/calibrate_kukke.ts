import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function run() {
  await prisma.temple.update({
    where: { id: "IN-KA-DAK-000003" },
    data: {
      latitude: 12.6644,
      longitude: 75.6158,
      dataConfidence: 95,
      isCentroidFallback: false,
      verificationStatus: "VERIFIED_OFFICIAL"
    }
  });
  console.log("Calibrated Kukke Subramanya coordinates to (12.6644, 75.6158)");
  await prisma.$disconnect();
}

run().catch(console.error);
