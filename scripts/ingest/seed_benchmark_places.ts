import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { BENCHMARK_FAMOUS_PLACES } from "../../src/lib/destinations/benchmark-famous-places";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (existsSync(".env")) process.loadEnvFile(".env");

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log("No DATABASE_URL set. Skipping DB write.");
    return;
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  console.log(`Seeding ${BENCHMARK_FAMOUS_PLACES.length} benchmark famous places into prisma.place...`);

  let inserted = 0;
  for (const item of BENCHMARK_FAMOUS_PLACES) {
    try {
      await prisma.place.upsert({
        where: { slug: item.slug },
        update: {
          name: item.name,
          nativeName: item.nativeName,
          category: item.category,
          categories: [item.category],
          subcategory: item.subcategory,
          description: item.description,
          latitude: item.latitude,
          longitude: item.longitude,
          coordinatePrecision: "EXACT",
          city: item.city,
          district: item.district,
          state: item.state,
          country: "India",
          bestTimeToVisit: item.bestTimeToVisit,
          highlights: item.highlights || [],
          tags: item.tags || [],
          image: item.image,
          imageAlt: item.imageAlt,
          imageCreditName: item.imageCredit?.photographer,
          imageCreditSource: item.imageCredit?.source,
          imageLicense: item.imageCredit?.license,
          verificationStatus: "VERIFIED_OFFICIAL",
          provenanceTier: item.provenance.sourceType === "unesco" || item.provenance.sourceType === "asi" ? "OFFICIAL_STATUTORY" : "STATE_GOVERNMENT",
          sourceType: item.provenance.sourceType,
          sourceName: item.provenance.sourceType?.toUpperCase(),
          sourceUrl: item.provenance.sourceUrl,
        },
        create: {
          id: item.id,
          slug: item.slug,
          name: item.name,
          nativeName: item.nativeName,
          category: item.category,
          categories: [item.category],
          subcategory: item.subcategory,
          description: item.description,
          latitude: item.latitude,
          longitude: item.longitude,
          coordinatePrecision: "EXACT",
          city: item.city,
          district: item.district,
          state: item.state,
          country: "India",
          bestTimeToVisit: item.bestTimeToVisit,
          highlights: item.highlights || [],
          tags: item.tags || [],
          image: item.image,
          imageAlt: item.imageAlt,
          imageCreditName: item.imageCredit?.photographer,
          imageCreditSource: item.imageCredit?.source,
          imageLicense: item.imageCredit?.license,
          verificationStatus: "VERIFIED_OFFICIAL",
          provenanceTier: item.provenance.sourceType === "unesco" || item.provenance.sourceType === "asi" ? "OFFICIAL_STATUTORY" : "STATE_GOVERNMENT",
          sourceType: item.provenance.sourceType,
          sourceName: item.provenance.sourceType?.toUpperCase(),
          sourceUrl: item.provenance.sourceUrl,
        },
      });
      inserted++;
    } catch (e) {
      console.warn(`Failed upsert for ${item.slug}:`, e);
    }
  }

  console.log(`Successfully seeded ${inserted} benchmark famous places.`);
  const totalPlaces = await prisma.place.count();
  console.log(`Total prisma.place count: ${totalPlaces}`);

  await prisma.$disconnect();
}

seed().catch(console.error);
