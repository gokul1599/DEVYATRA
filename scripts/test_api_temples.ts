import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function testApiFilters() {
  console.log("=== VERIFYING API QUERY LOGIC ===");

  // 1. Total without filters
  const totalAll = await prisma.temple.count();
  console.log("1. Total All Indexed Temples:", totalAll, "(Expected: 1655)");

  // 2. State filter: TN
  const totalTN = await prisma.temple.count({
    where: {
      OR: [
        { stateCode: { equals: "TN" } },
        { state: { slug: { equals: "tamil-nadu" } } },
        { state: { name: { contains: "Tamil Nadu", mode: "insensitive" } } }
      ]
    }
  });
  console.log("2. Total Tamil Nadu Temples:", totalTN, "(Expected: 171)");

  // 3. State filter: MH
  const totalMH = await prisma.temple.count({
    where: { stateCode: "MH" }
  });
  console.log("3. Total Maharashtra Temples:", totalMH, "(Expected: 161)");

  // 4. Combined Filter: State=AP and Search="Venkateswara"
  const totalCombined = await prisma.temple.count({
    where: {
      AND: [
        { stateCode: "AP" },
        {
          OR: [
            { name: { contains: "Venkateswara", mode: "insensitive" } },
            { description: { contains: "Venkateswara", mode: "insensitive" } }
          ]
        }
      ]
    }
  });
  console.log("4. Combined AP + 'Venkateswara':", totalCombined);

  // 5. Pagination calculation for limit 24
  const limit = 24;
  const totalPages = Math.ceil(totalAll / limit);
  console.log(`5. Pagination with limit=${limit}: ${totalPages} total pages. (Expected: 69)`);

  await prisma.$disconnect();
}

testApiFilters().catch(console.error);
