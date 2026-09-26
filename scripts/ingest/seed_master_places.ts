import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client.js";
import { loadAllIndiaRawPlaces } from "./master_dataset.js";
import { validatePlaceRecord } from "./validate.js";
import { deduplicatePlaces } from "./dedupe.js";
import { calculateHaversineDistanceKm } from "../../src/lib/nearby/engine.js";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

export async function seedMasterPlaces() {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  console.log("=== DEVYATRA / TEMPLEORA — MASTER PLACES SEEDER ===");

  try {
    const rawPlaces = loadAllIndiaRawPlaces();
    console.log(`Loaded ${rawPlaces.length} raw place candidates.`);

    // 1. Validation
    let validPlaces: typeof rawPlaces = [];
    let rejectedCount = 0;
    for (const p of rawPlaces) {
      const res = validatePlaceRecord(p);
      if (res.valid) {
        validPlaces.push(p);
      } else {
        console.warn(`[REJECTED] ${p.name} (${p.slug}):`, res.issues);
        rejectedCount++;
      }
    }
    console.log(`✔ Validation complete: ${validPlaces.length} passed, ${rejectedCount} rejected.`);

    // 2. Deduplication
    const dedupeReport = deduplicatePlaces(validPlaces);
    console.log(`✔ Deduplication complete: ${dedupeReport.unique.length} unique, ${dedupeReport.duplicates.length} duplicates filtered.`);

    // 3. Database Ingestion into Canonical `Place` Table
    let insertedPlaces = 0;
    let insertedSources = 0;
    let insertedCatRelations = 0;
    let syncedFamousPlaces = 0;
    let linkedTemples = 0;

    const stateCoverage = new Set<string>();
    const categoryCounts: Record<string, number> = {};

    for (const place of dedupeReport.unique) {
      stateCoverage.add(place.state);
      categoryCounts[place.category] = (categoryCounts[place.category] || 0) + 1;

      // 3a. Upsert Canonical Place
      const upsertedPlace = await prisma.place.upsert({
        where: { slug: place.slug },
        update: {
          name: place.name,
          nativeName: place.nativeName,
          alternateNames: place.alternateNames || [],
          category: place.category,
          categories: place.categories || [place.category],
          subcategory: place.subcategory,
          description: place.description,
          latitude: place.latitude,
          longitude: place.longitude,
          coordinatePrecision: place.coordinatePrecision || "EXACT",
          city: place.city,
          district: place.district,
          state: place.state,
          country: place.country || "India",
          status: place.status || "ACTIVE",
          timings: place.timings,
          entryFee: place.entryFee,
          bestTimeToVisit: place.bestTimeToVisit,
          recommendedDuration: place.recommendedDuration,
          facilities: place.facilities || [],
          accessibilityFeatures: place.accessibilityFeatures || [],
          asiProtected: place.asiProtected || false,
          asiMonumentId: place.asiMonumentId,
          unescoDesignated: place.unescoDesignated || false,
          unescoReference: place.unescoReference,
          ramsarSite: place.ramsarSite || false,
          tigerReserve: place.tigerReserve || false,
          nationalPark: place.nationalPark || false,
          wildlifeSanctuary: place.wildlifeSanctuary || false,
          elephantReserve: place.elephantReserve || false,
          biosphereReserve: place.biosphereReserve || false,
          communityReserve: place.communityReserve || false,
          marineProtectedArea: place.marineProtectedArea || false,
          importantBirdArea: place.importantBirdArea || false,
          gsiProtected: place.gsiProtected || false,
          gsiMonumentId: place.gsiMonumentId,
          placeKind: place.placeKind || "point_of_interest",
          subtypes: place.subtypes || [],
          activities: place.activities || [],
          designations: place.designations || [],
          faith: place.faith,
          religiousTradition: place.religiousTradition,
          accessType: place.accessType || "PUBLIC",
          accessRestrictions: place.accessRestrictions,
          verificationStatus: place.verificationStatus || "VERIFIED_OFFICIAL",
          provenanceTier: place.provenanceTier || "CURATED_DB",
          sourceName: place.sourceName,
          sourceType: place.sourceType,
          sourceUrl: place.sourceUrl,
          officialWebsite: place.officialWebsite,
          verifiedAt: new Date(),
          lastCheckedAt: new Date(),
          image: place.image,
          imageAlt: place.imageAlt,
          imageCreditName: place.imageCreditName,
          imageCreditSource: place.imageCreditSource,
          imageLicense: place.imageLicense,
          isAiGeneratedImage: place.isAiGeneratedImage || false,
          highlights: place.highlights || [],
          tags: place.tags || [],
          culturalTags: place.culturalTags || [],
          audienceTags: place.audienceTags || [],
        },
        create: {
          slug: place.slug,
          name: place.name,
          nativeName: place.nativeName,
          alternateNames: place.alternateNames || [],
          category: place.category,
          categories: place.categories || [place.category],
          subcategory: place.subcategory,
          description: place.description,
          latitude: place.latitude,
          longitude: place.longitude,
          coordinatePrecision: place.coordinatePrecision || "EXACT",
          city: place.city,
          district: place.district,
          state: place.state,
          country: place.country || "India",
          status: place.status || "ACTIVE",
          timings: place.timings,
          entryFee: place.entryFee,
          bestTimeToVisit: place.bestTimeToVisit,
          recommendedDuration: place.recommendedDuration,
          facilities: place.facilities || [],
          accessibilityFeatures: place.accessibilityFeatures || [],
          asiProtected: place.asiProtected || false,
          asiMonumentId: place.asiMonumentId,
          unescoDesignated: place.unescoDesignated || false,
          unescoReference: place.unescoReference,
          ramsarSite: place.ramsarSite || false,
          tigerReserve: place.tigerReserve || false,
          nationalPark: place.nationalPark || false,
          wildlifeSanctuary: place.wildlifeSanctuary || false,
          elephantReserve: place.elephantReserve || false,
          biosphereReserve: place.biosphereReserve || false,
          communityReserve: place.communityReserve || false,
          marineProtectedArea: place.marineProtectedArea || false,
          importantBirdArea: place.importantBirdArea || false,
          gsiProtected: place.gsiProtected || false,
          gsiMonumentId: place.gsiMonumentId,
          placeKind: place.placeKind || "point_of_interest",
          subtypes: place.subtypes || [],
          activities: place.activities || [],
          designations: place.designations || [],
          faith: place.faith,
          religiousTradition: place.religiousTradition,
          accessType: place.accessType || "PUBLIC",
          accessRestrictions: place.accessRestrictions,
          verificationStatus: place.verificationStatus || "VERIFIED_OFFICIAL",
          provenanceTier: place.provenanceTier || "CURATED_DB",
          sourceName: place.sourceName,
          sourceType: place.sourceType,
          sourceUrl: place.sourceUrl,
          officialWebsite: place.officialWebsite,
          verifiedAt: new Date(),
          lastCheckedAt: new Date(),
          image: place.image,
          imageAlt: place.imageAlt,
          imageCreditName: place.imageCreditName,
          imageCreditSource: place.imageCreditSource,
          imageLicense: place.imageLicense,
          isAiGeneratedImage: place.isAiGeneratedImage || false,
          highlights: place.highlights || [],
          tags: place.tags || [],
          culturalTags: place.culturalTags || [],
          audienceTags: place.audienceTags || [],
        },
      });
      insertedPlaces++;

      // 3b. Upsert Canonical Source
      await prisma.placeSource.create({
        data: {
          placeId: upsertedPlace.id,
          sourceType: place.provenanceTier || "OFFICIAL_STATUTORY",
          sourceName: place.sourceName,
          sourceUrl: place.sourceUrl,
          officialRecordId: place.asiMonumentId || place.unescoReference || null,
          retrievedAt: new Date(),
          lastVerifiedAt: new Date(),
          verificationMethod: "STATUTORY_REGISTRY_SYNC",
          verificationStatus: place.verificationStatus || "VERIFIED_OFFICIAL",
          notes: "Synchronized from authoritative statutory gazetteer / UNESCO / ASI registry.",
        },
      });
      insertedSources++;

      // 3c. Upsert Multi-Category Relations
      const allCats = place.categories && place.categories.length > 0 ? place.categories : [place.category];
      for (const cat of allCats) {
        await prisma.placeCategoryRelation.upsert({
          where: {
            placeId_category: {
              placeId: upsertedPlace.id,
              category: cat,
            },
          },
          update: {
            isPrimary: cat === place.category,
          },
          create: {
            placeId: upsertedPlace.id,
            category: cat,
            isPrimary: cat === place.category,
          },
        });
        insertedCatRelations++;
      }

      // 3d. Sync into `FamousPlace` (`nearby_places`) for backwards compatibility
      const fp = await prisma.famousPlace.upsert({
        where: { slug: place.slug },
        update: {
          name: place.name,
          nativeName: place.nativeName,
          category: place.category,
          subcategory: place.subcategory,
          description: place.description,
          latitude: place.latitude,
          longitude: place.longitude,
          city: place.city,
          district: place.district,
          state: place.state,
          country: place.country || "India",
          sourceType: place.sourceType,
          sourceUrl: place.sourceUrl,
          officialUrl: place.officialWebsite,
          imageReference: place.image,
          verificationStatus: place.verificationStatus || "VERIFIED_OFFICIAL",
          verifiedAt: new Date(),
          lastCheckedAt: new Date(),
        },
        create: {
          slug: place.slug,
          name: place.name,
          nativeName: place.nativeName,
          category: place.category,
          subcategory: place.subcategory,
          description: place.description,
          latitude: place.latitude,
          longitude: place.longitude,
          city: place.city,
          district: place.district,
          state: place.state,
          country: place.country || "India",
          sourceType: place.sourceType,
          sourceUrl: place.sourceUrl,
          officialUrl: place.officialWebsite,
          imageReference: place.image,
          verificationStatus: place.verificationStatus || "VERIFIED_OFFICIAL",
          verifiedAt: new Date(),
          lastCheckedAt: new Date(),
        },
      });
      syncedFamousPlaces++;

      // 3e. Connect nearby temples if anchor slugs provided
      if (place.nearbyTempleSlugs && place.nearbyTempleSlugs.length > 0) {
        for (const tSlug of place.nearbyTempleSlugs) {
          const temple = await prisma.temple.findFirst({
            where: {
              OR: [{ slug: tSlug }, { slug: { contains: tSlug.split("-")[0] } }],
            },
          });
          if (temple) {
            const distKm = calculateHaversineDistanceKm(
              temple.latitude,
              temple.longitude,
              place.latitude,
              place.longitude
            );
            await prisma.templeNearbyPlace.upsert({
              where: {
                templeId_nearbyPlaceId: {
                  templeId: temple.id,
                  nearbyPlaceId: fp.id,
                },
              },
              update: {
                distanceKm: Number(distKm.toFixed(1)),
                estimatedDriveMinutes: Math.round(distKm * 2.5),
                verifiedAt: new Date(),
              },
              create: {
                templeId: temple.id,
                nearbyPlaceId: fp.id,
                distanceKm: Number(distKm.toFixed(1)),
                estimatedDriveMinutes: Math.round(distKm * 2.5),
                relationshipType: "CANONICAL_VICINITY",
                priority: 1,
                verifiedAt: new Date(),
              },
            });
            linkedTemples++;
          }
        }
      }
    }

    console.log("\n=======================================================");
    console.log("✔ MASTER INGESTION SUMMARY");
    console.log("=======================================================");
    console.log(`Places in DB (canonical):    ${insertedPlaces}`);
    console.log(`Sources logged:              ${insertedSources}`);
    console.log(`Category relations:          ${insertedCatRelations}`);
    console.log(`FamousPlace (sync):          ${syncedFamousPlaces}`);
    console.log(`Temple links established:    ${linkedTemples}`);
    console.log(`States/UTs Covered:          ${stateCoverage.size} of 36`);
    console.log(`Category Breakdown:`, categoryCounts);
    console.log("=======================================================\n");

  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.includes("seed_master_places")) {
  seedMasterPlaces()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Fatal error during master place seeding:", err);
      process.exit(1);
    });
}
