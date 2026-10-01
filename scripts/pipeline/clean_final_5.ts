import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function run() {
  // Manibandh Shaktipeeth -> Ajmer
  await prisma.temple.update({
    where: { id: "IN-RJ-RAJ-000138" },
    data: { districtId: "cmubbj3jj006hosffo42up7ig" } // Ajmer
  });

  // Chowdeshwari -> Tumakuru
  const tumakuru = await prisma.district.findFirst({
    where: { state: { code: "KA" }, name: { contains: "Tumakur", mode: "insensitive" } }
  });
  if (tumakuru) {
    await prisma.temple.update({
      where: { id: "IN-KA-KAR-000111" },
      data: { districtId: tumakuru.id }
    });
  }

  // Mansa Mata Hasampur -> Sikar
  const sikar = await prisma.district.findFirst({
    where: { state: { code: "RJ" }, name: { contains: "Sikar", mode: "insensitive" } }
  });
  if (sikar) {
    await prisma.temple.update({
      where: { id: "IN-RJ-RAJ-000172" },
      data: { districtId: sikar.id }
    });
  }

  // Trilinga Kshetras -> Nandyal / Kurnool (Srisailam)
  const nandyal = await prisma.district.findFirst({
    where: { state: { code: "AP" }, name: { contains: "Nandyal", mode: "insensitive" } }
  });
  if (nandyal) {
    await prisma.temple.update({
      where: { id: "IN-AP-AND-000132" },
      data: { districtId: nandyal.id }
    });
  }

  // Neelkantheshwar -> Varanasi
  await prisma.temple.update({
    where: { id: "IN-UP-UTT-000152" },
    data: { districtId: "cmubbjene0083osffspunvcrj" } // Varanasi
  });

  console.log("Cleaned up final 5 synthetic central records!");
  await prisma.$disconnect();
}

run().catch(console.error);
