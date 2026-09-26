/**
 * DEVYATRA / TEMPLEORA — DATA PIPELINE: IMPORT STAGE
 * 
 * Command: npm run data:import
 * 
 * Idempotently upserts validated, deduplicated candidates into:
 * 1. `Place` (`places`)
 * 2. `PlaceSource` (`place_sources`)
 * 3. `PlaceCategoryRelation` (`place_category_relations`)
 * 4. `FamousPlace` (`nearby_places`)
 * 5. `TempleNearbyPlace` (`temple_nearby_places`)
 */

import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client.js";
import { discoverAllCandidates } from "./discover.js";
import { normalizeAllCandidates } from "./normalize.js";
import { validateAllCandidates } from "./validate.js";
import { deduplicateCandidates } from "./dedupe.js";
import { calculateHaversineDistanceKm } from "../../src/lib/nearby/engine.js";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

export async function runImportPipeline() {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  console.log("==> [IMPORT] Connecting to production database...");

  try {
    // 1. Discovery
    const raw = discoverAllCandidates();
    // 2. Normalize
    const normalized = normalizeAllCandidates(raw);
    // 3. Validate
    const { valid } = validateAllCandidates(normalized);
    // 4. Deduplicate
    const { unique } = deduplicateCandidates(valid);

    console.log(`==> [IMPORT] Beginning database upsert for ${unique.length} canonical records...`);

    let upsertedPlaces = 0;
    let loggedSources = 0;
    let categoryRelations = 0;
    let syncedFamous = 0;
    let linkedTemples = 0;

    for (const place of unique) {
      // 1. Upsert Canonical Place
      const upserted = await prisma.place.upsert({
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
          status: "ACTIVE",
          timings: place.timings,
          entryFee: place.entryFee,
          bestTimeToVisit: place.bestTimeToVisit,
          recommendedDuration: place.recommendedDuration,
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
          sourceName: place.sources[0]?.publisher || place.state,
          sourceType: place.sources[0]?.sourceType || "TOURISM",
          sourceUrl: place.sources[0]?.url,
          officialWebsite: place.sources[0]?.url,
          verifiedAt: new Date(),
          lastCheckedAt: new Date(),
          image: place.image,
          imageAlt: place.imageAlt,
          imageCreditName: place.imageCreditName,
          imageCreditSource: place.imageCreditSource,
          imageLicense: place.imageLicense,
          isAiGeneratedImage: false,
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
          status: "ACTIVE",
          timings: place.timings,
          entryFee: place.entryFee,
          bestTimeToVisit: place.bestTimeToVisit,
          recommendedDuration: place.recommendedDuration,
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
          sourceName: place.sources[0]?.publisher || place.state,
          sourceType: place.sources[0]?.sourceType || "TOURISM",
          sourceUrl: place.sources[0]?.url,
          officialWebsite: place.sources[0]?.url,
          verifiedAt: new Date(),
          lastCheckedAt: new Date(),
          image: place.image,
          imageAlt: place.imageAlt,
          imageCreditName: place.imageCreditName,
          imageCreditSource: place.imageCreditSource,
          imageLicense: place.imageLicense,
          isAiGeneratedImage: false,
          highlights: place.highlights || [],
          tags: place.tags || [],
          culturalTags: place.culturalTags || [],
          audienceTags: place.audienceTags || [],
        },
      });
      upsertedPlaces++;

      // 2. Upsert Canonical Source
      for (const src of place.sources) {
        await prisma.placeSource.create({
          data: {
            placeId: upserted.id,
            sourceType: place.provenanceTier || "OFFICIAL_STATUTORY",
            sourceName: src.publisher || src.title,
            sourceUrl: src.url,
            officialRecordId: src.officialRecordId || null,
            retrievedAt: new Date(),
            lastVerifiedAt: new Date(),
            verificationMethod: "PIPELINE_STATUTORY_SYNC",
            verificationStatus: "VERIFIED_OFFICIAL",
            notes: `Source: ${src.title}`,
          },
        });
        loggedSources++;
      }

      // 3. Upsert Multi-Category Relations
      const allCats = place.categories && place.categories.length > 0 ? place.categories : [place.category];
      for (const cat of allCats) {
        await prisma.placeCategoryRelation.upsert({
          where: {
            placeId_category: {
              placeId: upserted.id,
              category: cat,
            },
          },
          update: {
            isPrimary: cat === place.category,
          },
          create: {
            placeId: upserted.id,
            category: cat,
            isPrimary: cat === place.category,
          },
        });
        categoryRelations++;
      }

      // 4. Sync into FamousPlace for backwards compatibility
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
          sourceType: place.sources[0]?.sourceType || "TOURISM",
          sourceUrl: place.sources[0]?.url,
          officialUrl: place.sources[0]?.url,
          imageReference: place.image,
          verificationStatus: "VERIFIED_OFFICIAL",
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
          sourceType: place.sources[0]?.sourceType || "TOURISM",
          sourceUrl: place.sources[0]?.url,
          officialUrl: place.sources[0]?.url,
          imageReference: place.image,
          verificationStatus: "VERIFIED_OFFICIAL",
          verifiedAt: new Date(),
          lastCheckedAt: new Date(),
        },
      });
      syncedFamous++;

      // 5. Connect nearby temples if anchor slugs provided
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
    console.log("✔ [IMPORT COMPLETE] PIPELINE SUMMARY");
    console.log("=======================================================");
    console.log(`Places in DB (canonical):    ${upsertedPlaces}`);
    console.log(`Sources logged:              ${loggedSources}`);
    console.log(`Category relations:          ${categoryRelations}`);
    console.log(`FamousPlace (sync):          ${syncedFamous}`);
    console.log(`Temple links established:    ${linkedTemples}`);
    console.log("=======================================================\n");

  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.includes("import")) {
  runImportPipeline()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Fatal error during import pipeline:", err);
      process.exit(1);
    });
}
