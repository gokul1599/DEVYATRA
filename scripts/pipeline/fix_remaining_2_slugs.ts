import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function run() {
  await prisma.temple.update({
    where: { id: "IN-MH-MUM-000001" },
    data: {
      slug: "mahalakshmi-temple-kolhapur-maharashtra",
      districtId: "cmubbira9004kosffntm3xfeo", // Kolhapur
    }
  });
  console.log("Updated Mahalakshmi Kolhapur slug");

  await prisma.temple.update({
    where: { id: "IN-OD-BAR-000050" },
    data: {
      slug: "rajarani-temple-bhubaneswar-khordha-odisha",
      districtId: "cmubbk11j00beosffy87e2ifn", // Khordha
    }
  });
  console.log("Updated Rajarani slug");

  await prisma.$disconnect();
}

run().catch(console.error);
