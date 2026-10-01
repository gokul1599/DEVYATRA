import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const TARGET_DISTRICTS = [
  { stateCode: "AS", name: "Kamrup Metropolitan" },
  { stateCode: "GJ", name: "Banaskantha" },
  { stateCode: "GJ", name: "Gandhinagar" },
  { stateCode: "KA", name: "Dakshina Kannada" },
  { stateCode: "KA", name: "Chikkamagaluru" },
  { stateCode: "KA", name: "Hassan" },
  { stateCode: "KA", name: "Mysuru" },
  { stateCode: "KA", name: "Uttara Kannada" },
  { stateCode: "KA", name: "Bagalkote" },
  { stateCode: "KL", name: "Thrissur" },
  { stateCode: "KL", name: "Kottayam" },
  { stateCode: "MP", name: "Raisen" },
  { stateCode: "MH", name: "Pune" },
  { stateCode: "MH", name: "Kolhapur" },
  { stateCode: "MH", name: "Mumbai City" },
  { stateCode: "OD", name: "Khordha" },
  { stateCode: "RJ", name: "Ajmer" },
  { stateCode: "RJ", name: "Bikaner" },
  { stateCode: "RJ", name: "Churu" },
  { stateCode: "TN", name: "Thanjavur" },
  { stateCode: "TS", name: "Rangareddy" },
  { stateCode: "UP", name: "Varanasi" },
  { stateCode: "UK", name: "Rudraprayag" },
  { stateCode: "UK", name: "Almora" },
  { stateCode: "UK", name: "Haridwar" },
  { stateCode: "WB", name: "Howrah" },
  { stateCode: "WB", name: "Nadia" },
  { stateCode: "WB", name: "Hooghly" }
];

async function run() {
  console.log("Checking target districts in DB...");
  const districts = await prisma.district.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      officialCode: true,
      state: { select: { code: true, name: true } }
    }
  });

  for (const t of TARGET_DISTRICTS) {
    const found = districts.filter(d => 
      (d.state.code.toUpperCase() === t.stateCode || (t.stateCode === "UK" && d.state.code.toUpperCase() === "UT")) &&
      (d.name.toLowerCase().includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(d.name.toLowerCase()))
    );

    if (found.length > 0) {
      console.log(`[FOUND] ${t.stateCode} -> ${t.name}:`, found.map(f => `id: ${f.id}, name: "${f.name}", slug: "${f.slug}"`));
    } else {
      console.log(`[MISSING] ${t.stateCode} -> ${t.name}`);
    }
  }

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
