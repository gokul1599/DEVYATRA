import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { ALL_INDIA_DESTINATIONS } from "../../src/lib/destinations/all-india-data";
import { CORE_TEMPLES } from "../../src/lib/data/temples-core";
import { EXTRA_TEMPLES_1 } from "../../src/lib/data/temples-extra-1";
import { EXTRA_TEMPLES_2 } from "../../src/lib/data/temples-extra-2";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function inspect() {
  const dbTemples = await prisma.temple.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      stateCode: true,
      latitude: true,
      longitude: true,
      address: true,
      district: { select: { name: true } },
      state: { select: { name: true, slug: true } }
    }
  });

  console.log(`DB Temples loaded: ${dbTemples.length}`);
  console.log(`Static Core Temples: ${CORE_TEMPLES.length}`);
  console.log(`Static Extra Temples 1: ${EXTRA_TEMPLES_1.length}`);
  console.log(`Static Extra Temples 2: ${EXTRA_TEMPLES_2.length}`);
  console.log(`All India Destinations: ${ALL_INDIA_DESTINATIONS.length}`);

  // Test specifically the user's highlighted failure examples:
  const testList = [
    { query: "Venkateswara", state: "AP", label: "Tirumala Venkateswara" },
    { query: "Mallikarjuna", state: "AP", label: "Srisailam Mallikarjuna" },
    { query: "Kalahast", state: "AP", label: "Sri Kalahasteeswara" },
    { query: "Vishwanath", state: "UP", label: "Kashi Vishwanath" },
    { query: "Mahakaleshwar", state: "MP", label: "Mahakaleshwar Ujjain" },
    { query: "Jagannath", state: "OD", label: "Jagannath Puri" },
    { query: "Konark", state: "OD", label: "Konark Sun Temple" },
    { query: "Lingaraj", state: "OD", label: "Lingaraj Bhubaneswar" },
    { query: "Kamakshi", state: "TN", label: "Kamakshi Kanchipuram" },
    { query: "Ekambareswar", state: "TN", label: "Ekambareswarar Kanchipuram" },
    { query: "Varadaraja", state: "TN", label: "Varadaraja Perumal Kanchipuram" },
    { query: "Padmanabhaswamy", state: "KL", label: "Padmanabhaswamy Thiruvananthapuram" },
    { query: "Ganpatipule", state: "MH", label: "Ganpatipule Ratnagiri" },
    { query: "Tiruchendur", state: "TN", label: "Tiruchendur Murugan" },
    { query: "Dakshineswar", state: "WB", label: "Dakshineswar Kali Kolkata" },
    { query: "Tarakeswar", state: "WB", label: "Tarakeswar Hooghly" },
  ];

  const queries = [
    { name: "Kamakshi Amman Kanchipuram", terms: ["kamakshi", "kanchipuram"], state: "TN" },
    { name: "Varadaraja Perumal Kanchipuram", terms: ["varadaraja", "varadharaja", "perumal"], state: "TN" },
    { name: "Ganpatipule Ratnagiri", terms: ["ganpatipule", "swayambhu ganpati"], state: "MH" },
    { name: "Tiruchendur Murugan", terms: ["tiruchendur", "thiruchendur", "subramanya swamy"], state: "TN" },
    { name: "Tarakeswar Taraknath", terms: ["tarakeswar", "taraknath"], state: "WB" },
    { name: "Sri Kalahasteeswara", terms: ["kalahasti", "kalahasteeswara"], state: "AP" },
    { name: "Tripura Sundari Udaipur", terms: ["tripura sundari", "matabari"], state: "TR" },
    { name: "Navagraha Guwahati", terms: ["navagraha"], state: "AS" },
    { name: "Batadrava Than", terms: ["batadrava", "bordowa"], state: "AS" },
    { name: "Deo Sun Temple", terms: ["deo sun", "deo"], state: "BR" },
  ];

  console.log("\n=================== CHECKING CANONICAL CANDIDATES ===================");
  for (const q of queries) {
    console.log(`\nChecking: ${q.name} (Expected State: ${q.state})`);
    const matches = dbTemples.filter(d => {
      const nameL = d.name.toLowerCase();
      const slugL = d.slug.toLowerCase();
      const addrL = (d.address || "").toLowerCase();
      const stateMatch = d.stateCode === q.state || (d.state?.name && d.state.name.toLowerCase().includes(q.state.toLowerCase()));
      const termMatch = q.terms.some(t => nameL.includes(t) || slugL.includes(t) || addrL.includes(t));
      return termMatch;
    });

    console.log(`Found ${matches.length} matches:`);
    for (const m of matches) {
      console.log(`  - [${m.id}] "${m.name}" | ${m.slug} | state: ${m.state?.name || m.stateCode} | dist: ${m.district?.name} | coords: (${m.latitude}, ${m.longitude}) | addr: ${m.address}`);
    }
  }

  await prisma.$disconnect();
}

inspect().catch(console.error);
