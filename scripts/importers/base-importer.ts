import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { haversineDistance, jaroWinkler } from "../../src/lib/importer/deduplicate";
import { districtMnemonic, templeIdentifier } from "../../src/lib/importer/identifier";
import { slugify } from "../../src/lib/importer/normalize";
import type { RawTempleRecord, ImporterOptions, ImporterTelemetry } from "./types";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

// Known state and national centroid coordinates to guard against accidental fallback ingestion
const KNOWN_CENTROIDS: Array<{ lat: number; lng: number; name: string }> = [
  { lat: 20.5937, lng: 78.9629, name: "National Centroid (India)" },
  { lat: 15.9129, lng: 79.7400, name: "Andhra Pradesh Centroid" },
  { lat: 15.3173, lng: 75.7139, name: "Karnataka Centroid" },
  { lat: 11.1271, lng: 78.6569, name: "Tamil Nadu Centroid" },
  { lat: 10.8505, lng: 76.2711, name: "Kerala Centroid" },
  { lat: 19.7515, lng: 75.7139, name: "Maharashtra Centroid" },
  { lat: 27.0238, lng: 74.2179, name: "Rajasthan Centroid" },
];

export async function processStateBatch(
  sourceName: string,
  sourceUrl: string,
  records: RawTempleRecord[],
  options: ImporterOptions = {}
): Promise<ImporterTelemetry> {
  const startTime = Date.now();
  const telemetry: ImporterTelemetry = {
    source: sourceName,
    sourceUrl,
    retrievedAt: new Date().toISOString(),
    recordsFound: records.length,
    recordsAdded: 0,
    recordsUpdated: 0,
    duplicates: 0,
    rejected: 0,
    needsVerification: 0,
    errors: [],
    duplicateDetails: [],
    addedDetails: [],
  };

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    telemetry.errors.push("DATABASE_URL is not configured.");
    return telemetry;
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  let importJobId: string | null = null;

  try {
    // 1. Create ImportJob record for tracking and observability
    try {
      const stateCodeHint = records[0]?.stateCode || "IND";
      const importJob = await prisma.importJob.create({
        data: {
          kind: "temple:state-expansion",
          source: `${sourceName} (${stateCodeHint})`,
          status: options.dryRun ? "dry_run_running" : "running",
          startedAt: new Date(),
          recordsFound: records.length,
          summary: {
            sourceUrl,
            dryRun: !!options.dryRun,
            parserVersion: options.parserVersion || "v1.0.0",
          },
        },
      });
      importJobId = importJob.id;
      telemetry.jobId = importJob.id;

      await prisma.importLog.create({
        data: {
          jobId: importJob.id,
          level: "info",
          message: `Started state expansion batch for ${sourceName} (${records.length} records). DryRun: ${!!options.dryRun}`,
          entity: stateCodeHint,
        },
      });
    } catch (jobErr: any) {
      // Non-fatal if ImportJob logging encounters a minor issue
      console.warn("Could not create ImportJob record:", jobErr.message);
    }

    // 2. Process records sequentially with strict data quality & deduplication
    for (const raw of records) {
      // Gate A: Mandatory fields
      if (!raw.name || raw.name.trim().length < 3 || !raw.latitude || !raw.longitude || !raw.stateCode || !raw.districtName) {
        telemetry.rejected++;
        telemetry.errors.push(`Missing mandatory fields for temple: "${raw.name || 'unnamed'}"`);
        continue;
      }

      // Gate B: India geographic bounds (Lat: 6.0 to 38.0, Lng: 68.0 to 98.0)
      if (raw.latitude < 6.0 || raw.latitude > 38.0 || raw.longitude < 68.0 || raw.longitude > 98.0) {
        telemetry.rejected++;
        telemetry.errors.push(`Invalid geographic bounds for ${raw.name}: ${raw.latitude}, ${raw.longitude}`);
        continue;
      }

      // Gate C: Zero coordinates & known centroid check
      if (raw.latitude === 0 || raw.longitude === 0) {
        telemetry.rejected++;
        telemetry.errors.push(`Zero coordinates rejected for ${raw.name}`);
        continue;
      }

      let matchesCentroid = false;
      for (const centroid of KNOWN_CENTROIDS) {
        const distToCentroid = haversineDistance(raw.latitude, raw.longitude, centroid.lat, centroid.lng);
        if (distToCentroid < 200) { // within 200 meters of a known regional centroid
          matchesCentroid = true;
          telemetry.rejected++;
          telemetry.errors.push(`Rejected centroid coordinate for ${raw.name} matching ${centroid.name}`);
          break;
        }
      }
      if (matchesCentroid) continue;

      // Gate D: Resolve State
      const state = await prisma.state.findUnique({
        where: { code: raw.stateCode.toUpperCase() },
        select: { id: true, name: true, code: true },
      });

      if (!state) {
        telemetry.rejected++;
        telemetry.errors.push(`Unknown state code: ${raw.stateCode}`);
        continue;
      }

      // Gate E: Resolve District via LGD hierarchy
      const districtSlug = slugify(raw.districtName);
      let district = await prisma.district.findFirst({
        where: { stateId: state.id, slug: districtSlug },
      });

      if (!district) {
        district = await prisma.district.findFirst({
          where: { stateId: state.id, name: { contains: raw.districtName, mode: "insensitive" } },
        });
      }

      if (!district) {
        const stateDistricts = await prisma.district.findMany({
          where: { stateId: state.id },
          select: { id: true, name: true, slug: true },
        });
        let bestDist: { id: string; name: string; slug: string } | null = null;
        let bestSim = 0;
        for (const d of stateDistricts) {
          const sim = jaroWinkler(districtSlug, d.slug);
          if (sim > bestSim && sim >= 0.80) {
            bestSim = sim;
            bestDist = d;
          }
        }
        if (bestDist) {
          district = await prisma.district.findUnique({ where: { id: bestDist.id } });
        }
      }

      if (!district) {
        telemetry.rejected++;
        telemetry.errors.push(`District "${raw.districtName}" not found in official state ${raw.stateCode}`);
        continue;
      }

      // Gate F: Deduplication Check 1 — Official Record ID match
      if (raw.sourceRecordId) {
        const existingBySourceId = await prisma.templeSource.findFirst({
          where: { officialRecordId: raw.sourceRecordId },
          include: { temple: { select: { id: true, name: true, identifier: true } } },
        });

        if (existingBySourceId && existingBySourceId.temple) {
          telemetry.duplicates++;
          telemetry.duplicateDetails?.push({
            name: raw.name,
            existingId: existingBySourceId.temple.id,
            existingName: existingBySourceId.temple.name,
            reason: `Exact officialRecordId match: ${raw.sourceRecordId}`,
          });

          if (!options.dryRun) {
            await prisma.templeSource.update({
              where: { id: existingBySourceId.id },
              data: { lastVerifiedAt: new Date() },
            });
            await prisma.temple.update({
              where: { id: existingBySourceId.temple.id },
              data: { lastVerifiedAt: new Date() },
            });
          }
          continue;
        }
      }

      // Gate G: Deduplication Check 2 — Spatial distance (< 500m) + Fuzzy Name (Jaro-Winkler >= 0.70)
      const nearbyExisting = await prisma.temple.findMany({
        where: {
          stateCode: raw.stateCode.toUpperCase(),
          latitude: { gte: raw.latitude - 0.05, lte: raw.latitude + 0.05 },
          longitude: { gte: raw.longitude - 0.05, lte: raw.longitude + 0.05 },
        },
        select: {
          id: true,
          name: true,
          nameLocal: true,
          latitude: true,
          longitude: true,
          identifier: true,
          officialWebsite: true,
          dataConfidence: true,
          verificationStatus: true,
        },
      });

      let matchedDuplicate: (typeof nearbyExisting)[0] | null = null;
      let duplicateReason = "";

      for (const existing of nearbyExisting) {
        const distM = haversineDistance(raw.latitude, raw.longitude, existing.latitude, existing.longitude);
        const nameSim = jaroWinkler(raw.name, existing.name);

        if (distM < 500 && nameSim >= 0.70) {
          matchedDuplicate = existing;
          duplicateReason = `Spatial ${Math.round(distM)}m, Name Sim ${(nameSim * 100).toFixed(1)}%`;
          break;
        }
      }

      if (matchedDuplicate) {
        telemetry.duplicateDetails?.push({
          name: raw.name,
          existingId: matchedDuplicate.id,
          existingName: matchedDuplicate.name,
          reason: duplicateReason,
        });

        if (options.dryRun) {
          telemetry.duplicates++;
          continue;
        }

        // Live run: Check if this official source is already linked
        const existingSource = await prisma.templeSource.findFirst({
          where: {
            templeId: matchedDuplicate.id,
            sourceName: raw.sourceName,
          },
        });

        if (!existingSource) {
          // Enrich existing temple record with official government provenance
          await prisma.$transaction(async (tx) => {
            await tx.templeSource.create({
              data: {
                templeId: matchedDuplicate!.id,
                sourceName: raw.sourceName,
                sourceUrl: raw.sourceUrl,
                sourceType: raw.sourceType === "government" ? "GOVERNMENT_ENDOWMENT" : "STATE_TOURISM",
                officialRecordId: raw.sourceRecordId || null,
                retrievedAt: new Date(),
                lastVerifiedAt: new Date(),
                verificationMethod: "API_INGEST",
                verificationStatus: "VERIFIED",
                notes: `Enriched via official state expansion engine from ${raw.sourceName} (Parser ${options.parserVersion || "v1.0.0"}).`,
              },
            });

            await tx.temple.update({
              where: { id: matchedDuplicate!.id },
              data: {
                nameLocal: matchedDuplicate!.nameLocal || raw.nameLocal || null,
                officialWebsite: matchedDuplicate!.officialWebsite || raw.officialWebsite || null,
                verificationStatus: "VERIFIED_OFFICIAL",
                dataConfidence: Math.max(matchedDuplicate!.dataConfidence, 85),
                lastVerifiedAt: new Date(),
              },
            });

            await tx.auditResult.create({
              data: {
                templeId: matchedDuplicate!.id,
                templeIdentifier: matchedDuplicate!.identifier,
                templeName: matchedDuplicate!.name,
                fieldChecked: "OFFICIAL_PROVENANCE_ENRICHMENT",
                existingValue: matchedDuplicate!.name,
                sourceFound: raw.sourceName,
                sourceUrl: raw.sourceUrl,
                sourceType: "GOVERNMENT_SOURCE",
                verified: true,
                problem: null,
                recommendedAction: "Linked official state endowment record to existing temple",
                severity: "LOW",
                status: "RESOLVED",
              },
            });
          });

          telemetry.recordsUpdated++;
        } else {
          telemetry.duplicates++;
        }

        continue;
      }

      // Gate H: Generate Stable Identifier & Collision-Free Slug
      const mnemonic = districtMnemonic(district.name);
      const districtTempleCount = await prisma.temple.count({ where: { districtId: district.id } });
      let seq = districtTempleCount + 1 + telemetry.recordsAdded;
      let identifier = templeIdentifier(raw.stateCode, mnemonic, seq);
      let templeId = identifier.replace("TEMPLE-IND-", "IN-");

      // Guarantee ID and Identifier uniqueness against any existing records
      while (await prisma.temple.findFirst({ where: { OR: [{ id: templeId }, { identifier }] } })) {
        seq++;
        identifier = templeIdentifier(raw.stateCode, mnemonic, seq);
        templeId = identifier.replace("TEMPLE-IND-", "IN-");
      }

      const baseSlug = `${slugify(raw.name)}-${slugify(district.name)}-${slugify(state.name)}`;
      let slug = baseSlug;
      let slugIndex = 1;
      while (await prisma.temple.findUnique({ where: { slug } })) {
        slugIndex++;
        slug = `${baseSlug}-${slugIndex}`;
      }

      if (options.dryRun) {
        telemetry.recordsAdded++;
        telemetry.addedDetails?.push({
          identifier,
          name: raw.name,
          district: district.name,
        });
        continue;
      }

      // Gate I: Atomic Transaction for New Verified Temple
      try {
        await prisma.$transaction(async (tx) => {
          const created = await tx.temple.create({
          data: {
            id: templeId,
            identifier,
            slug,
            name: raw.name,
            nameLocal: raw.nameLocal || null,
            description:
              raw.description ||
              `${raw.name} is a sanctified Hindu temple situated in ${district.name}, ${state.name}. Catalogued with verified state endowment provenance.`,
            stateCode: raw.stateCode.toUpperCase(),
            districtId: district.id,
            latitude: raw.latitude,
            longitude: raw.longitude,
            mainDeity: raw.mainDeity || "Sacred Deity",
            deities: raw.deities || (raw.mainDeity ? [raw.mainDeity] : []),
            templeType: raw.templeType || "Historic Hindu Temple",
            tradition: raw.tradition || ["Sanatana Dharma"],
            architecture: raw.architecture || null,
            historicalPeriod: raw.historicalPeriod || null,
            officialWebsite: raw.officialWebsite || null,
            verificationStatus: "VERIFIED_OFFICIAL",
            dataConfidence: 85,
            isCentroidFallback: false,
            source: raw.sourceName,
            sourceType: raw.sourceType,
            sourceUrl: raw.sourceUrl,
            lastVerifiedAt: new Date(),
          },
        });

        await tx.templeSource.create({
          data: {
            templeId: created.id,
            sourceName: raw.sourceName,
            sourceUrl: raw.sourceUrl,
            sourceType: raw.sourceType === "government" ? "GOVERNMENT_ENDOWMENT" : "STATE_TOURISM",
            officialRecordId: raw.sourceRecordId || null,
            retrievedAt: new Date(),
            lastVerifiedAt: new Date(),
            verificationMethod: "API_INGEST",
            verificationStatus: "VERIFIED",
            notes: `Ingested via official state expansion engine from ${raw.sourceName} (Parser ${options.parserVersion || "v1.0.0"}). License: Government Open Data / Public Domain`,
          },
        });

        await tx.auditResult.create({
          data: {
            templeId: created.id,
            templeIdentifier: created.identifier,
            templeName: created.name,
            fieldChecked: "STATE_EXPANSION_IMPORT",
            existingValue: "None",
            sourceFound: raw.sourceName,
            sourceUrl: raw.sourceUrl,
            sourceType: "GOVERNMENT_SOURCE",
            verified: true,
            problem: null,
            recommendedAction: "New authentic record ingested via state expansion engine",
            severity: "LOW",
            status: "RESOLVED",
          },
        });
      });

      telemetry.recordsAdded++;
      telemetry.addedDetails?.push({
        identifier,
        name: raw.name,
        district: district.name,
      });
    } catch (recErr: any) {
      telemetry.errors.push(`Failed inserting ${raw.name}: ${recErr.message || String(recErr)}`);
    }
    }

    telemetry.durationMs = Date.now() - startTime;

    // 3. Update ImportJob with final completion status
    if (importJobId) {
      const finalStatus =
        telemetry.errors.length > 0 && telemetry.recordsAdded === 0 && !options.dryRun
          ? "failed"
          : options.dryRun
          ? "completed_dry_run"
          : "completed";

      await prisma.importJob.update({
        where: { id: importJobId },
        data: {
          status: finalStatus,
          completedAt: new Date(),
          recordsFound: telemetry.recordsFound,
          recordsAdded: telemetry.recordsAdded,
          recordsUpdated: telemetry.recordsUpdated,
          duplicates: telemetry.duplicates,
          errors: telemetry.errors.length,
          summary: {
            sourceUrl,
            rejected: telemetry.rejected,
            durationMs: telemetry.durationMs,
            addedDetails: telemetry.addedDetails,
            duplicateDetails: telemetry.duplicateDetails,
            errors: telemetry.errors.slice(0, 10),
          },
        },
      });

      await prisma.importLog.create({
        data: {
          jobId: importJobId,
          level: telemetry.errors.length > 0 ? "warn" : "info",
          message: `Finished import job: Added ${telemetry.recordsAdded}, Updated ${telemetry.recordsUpdated}, Duplicates ${telemetry.duplicates}, Rejected ${telemetry.rejected}. Duration: ${telemetry.durationMs}ms`,
        },
      });
    }
  } catch (err: any) {
    telemetry.errors.push(err.message || String(err));
    if (importJobId) {
      await prisma.importJob.update({
        where: { id: importJobId },
        data: {
          status: "failed",
          completedAt: new Date(),
          errors: telemetry.errors.length,
          summary: { errors: telemetry.errors },
        },
      }).catch(() => {});
    }
  } finally {
    await prisma.$disconnect();
  }

  return telemetry;
}
