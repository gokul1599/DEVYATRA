import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const targetStates = ["OD", "GJ", "MP", "UK", "UP"];

  console.log("==========================================");
  console.log("TARGET STATES BASELINE AUDIT");
  console.log("==========================================");

  for (const code of targetStates) {
    const state = await prisma.state.findUnique({
      where: { code },
      include: {
        districts: {
          include: {
            temples: {
              select: { id: true, isCentroidFallback: true },
            },
          },
        },
      },
    });

    if (!state) {
      console.log(`State ${code} not found in database!`);
      continue;
    }

    const totalDistricts = state.districts.length;
    let totalTemples = 0;
    let representedDistricts = 0;
    let centroidCount = 0;

    const unrepresentedDistricts: string[] = [];

    for (const d of state.districts) {
      const count = d.temples.length;
      totalTemples += count;
      if (count > 0) {
        representedDistricts++;
      } else {
        unrepresentedDistricts.push(d.name);
      }
      centroidCount += d.temples.filter((t) => t.isCentroidFallback).length;
    }

    const coveragePct = Math.round((representedDistricts / totalDistricts) * 100);

    console.log(`\nState: ${state.name} (${state.code})`);
    console.log(`- Total LGD Districts in DB: ${totalDistricts}`);
    console.log(`- Represented Districts:      ${representedDistricts} (${coveragePct}%)`);
    console.log(`- Unrepresented Districts:    ${unrepresentedDistricts.length}`);
    console.log(`- Current Temples:           ${totalTemples}`);
    console.log(`- Centroid Fallbacks:        ${centroidCount}`);
    if (unrepresentedDistricts.length > 0) {
      console.log(`- Sample Unrepresented:      ${unrepresentedDistricts.slice(0, 5).join(", ")}...`);
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
