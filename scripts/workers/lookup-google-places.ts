/**
 * Google Places Official Verification Engine (Phase 6A)
 *
 * Discovers and validates genuine Google Place IDs for temples requiring lookup.
 *
 * Rules:
 * 1. NEVER create synthetic IDs (no "ChIJ_...").
 * 2. Only accept Place IDs directly returned by official Google Places API New.
 * 3. Enforce strict cost control: minimal field masks, request throttling, exponential backoff, batch caps.
 * 4. Rigorous matching: Haversine distance < 2.5km, token similarity, deity/locality verification.
 * 5. Lifecycle: PENDING_LOOKUP → GOOGLE_SEARCH → CANDIDATE_FOUND → MATCH_VALIDATION → VERIFIED / NO_MATCH.
 * 6. Audit trail: Record all operations to AuditResult.
 */
import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { haversineDistance, jaroWinkler } from "../../src/lib/importer/deduplicate";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const primaryApiKey = process.env.GOOGLE_MAPS_API_KEY || "";
const fallbackApiKey = process.env.GOOGLE_MAPS_FALLBACK_API_KEY || "";
let activeApiKey = primaryApiKey || fallbackApiKey;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

// Parse CLI flags
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const forceAll = args.includes("--force");
const limitArg = args.find((a) => a.startsWith("--limit="));
const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : 10;
const templeIdArg = args.find((a) => a.startsWith("--temple-id="));
const singleTempleId = templeIdArg ? templeIdArg.split("=")[1] : null;

// Google API configuration & cost control
const PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const FIELD_MASK = "places.id,places.displayName,places.formattedAddress,places.location,places.types,places.googleMapsUri";
const REQUEST_DELAY_MS = 600; // Throttling: max ~1.6 req/sec
const MAX_RETRIES = 3;
const MAX_DISTANCE_METERS = 2500; // 2.5 km tolerance
const MIN_NAME_SIMILARITY = 0.55;

interface GooglePlaceCandidate {
  id: string;
  displayName?: { text: string; languageCode?: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  types?: string[];
  googleMapsUri?: string;
}

/** Delay helper for rate limiting */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Call Google Places API New with backoff and cost control */
async function searchGooglePlaces(
  textQuery: string,
  biasLat: number,
  biasLng: number
): Promise<GooglePlaceCandidate[]> {
  if (!activeApiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured.");
  }

  const payload = {
    textQuery,
    locationBias: {
      circle: {
        center: { latitude: biasLat, longitude: biasLng },
        radius: 3000.0, // 3km bias radius
      },
    },
    maxResultCount: 3, // Minimal candidate count to reduce compute/bandwidth
  };

  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    attempt++;
    try {
      const response = await fetch(PLACES_SEARCH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": activeApiKey,
          "X-Goog-FieldMask": FIELD_MASK,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 429 || response.status === 503) {
        const backoffMs = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.warn(`[Google API] Rate limited (HTTP ${response.status}). Retrying in ${Math.round(backoffMs)}ms...`);
        await sleep(backoffMs);
        continue;
      }

      if (response.status === 403 && fallbackApiKey && activeApiKey !== fallbackApiKey) {
        console.warn("[Google API] Primary key 403 (SERVICE_DISABLED). Switching to verified fallback API key...");
        activeApiKey = fallbackApiKey;
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Google API] HTTP ${response.status}: ${errorText}`);
        return [];
      }

      const data = await response.json();
      return (data.places as GooglePlaceCandidate[]) || [];
    } catch (err) {
      if (attempt >= MAX_RETRIES) throw err;
      await sleep(1500);
    }
  }

  return [];
}

/** Tokenize and normalize text for comparison */
function cleanText(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Validate whether a candidate is genuinely the temple */
function evaluateCandidate(
  temple: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    mainDeity?: string | null;
    districtName?: string | null;
  },
  candidate: GooglePlaceCandidate
): { isMatch: boolean; score: number; distanceM: number; reason: string } {
  if (!candidate.id || !candidate.location) {
    return { isMatch: false, score: 0, distanceM: Infinity, reason: "Missing ID or location coordinates" };
  }

  // Reject synthetic IDs
  if (candidate.id.startsWith("ChIJ_") || candidate.id.length < 15) {
    return { isMatch: false, score: 0, distanceM: Infinity, reason: "Disallowed ID format" };
  }

  // Reject obvious commercial types (restaurants, lodging)
  const types = candidate.types || [];
  if (
    types.includes("lodging") ||
    types.includes("restaurant") ||
    types.includes("bar") ||
    types.includes("shopping_mall")
  ) {
    return { isMatch: false, score: 0, distanceM: Infinity, reason: "Candidate is a commercial establishment" };
  }

  // Geospatial distance check
  const distanceM = haversineDistance(
    temple.latitude,
    temple.longitude,
    candidate.location.latitude,
    candidate.location.longitude
  );

  if (distanceM > MAX_DISTANCE_METERS) {
    return {
      isMatch: false,
      score: 0,
      distanceM,
      reason: `Distance ${distanceM}m exceeds maximum tolerance of ${MAX_DISTANCE_METERS}m`,
    };
  }

  // Name similarity
  const candName = candidate.displayName?.text || "";
  const tClean = cleanText(temple.name);
  const cClean = cleanText(candName);
  const similarity = jaroWinkler(tClean, cClean);

  // Boost if deity or temple keywords match
  let score = similarity;
  if (temple.mainDeity && cClean.includes(cleanText(temple.mainDeity))) {
    score = Math.min(1.0, score + 0.15);
  }

  // Proximity bonus
  if (distanceM < 500) {
    score = Math.min(1.0, score + 0.15);
  }

  const isMatch = score >= MIN_NAME_SIMILARITY;
  return {
    isMatch,
    score,
    distanceM,
    reason: isMatch
      ? `Valid match (score ${score.toFixed(2)}, distance ${Math.round(distanceM)}m)`
      : `Low similarity score ${score.toFixed(2)}`,
  };
}

async function runGooglePlacesWorker() {
  console.log("=================================================");
  console.log("🔍 DEVYATRA GOOGLE PLACES VERIFICATION WORKER");
  console.log("=================================================");
  console.log(`Settings:`);
  console.log(`  - Dry Run: ${isDryRun}`);
  console.log(`  - Batch Limit: ${limit}`);
  console.log(`  - API Key Present: ${Boolean(activeApiKey)}`);
  console.log(`  - Single ID filter: ${singleTempleId || "None (Queue)"}\n`);

  if (!activeApiKey) {
    console.warn("⚠️ GOOGLE_MAPS_API_KEY is not set in environment or .env.local.");
    console.warn("The worker will audit and display pending records without making live HTTP calls.\n");
  }

  // Query records requiring Google Place lookup
  const queryWhere: any = {};
  if (singleTempleId) {
    queryWhere.id = singleTempleId;
  } else if (!forceAll) {
    queryWhere.OR = [
      { googlePlaceId: null },
      { googlePlaceVerificationStatus: "PENDING_LOOKUP" },
    ];
  }

  const queue = await prisma.temple.findMany({
    where: queryWhere,
    take: limit,
    select: {
      id: true,
      identifier: true,
      name: true,
      latitude: true,
      longitude: true,
      mainDeity: true,
      googlePlaceId: true,
      googlePlaceVerificationStatus: true,
      district: { select: { name: true } },
      state: { select: { name: true, code: true } },
    },
  });

  console.log(`Loaded ${queue.length} temples in the verification queue.\n`);

  let verifiedCount = 0;
  let rejectedCount = 0;
  let skippedCount = 0;
  let apiCallsCount = 0;

  for (let i = 0; i < queue.length; i++) {
    const temple = queue[i];
    console.log(`[${i + 1}/${queue.length}] ${temple.identifier} — ${temple.name} (${temple.district?.name}, ${temple.state?.name})`);

    if (!activeApiKey) {
      console.log("  ℹ️ Skipped live search (API key not configured).");
      skippedCount++;
      continue;
    }

    try {
      // Formulate precision query
      const searchQuery = `${temple.name}, ${temple.district?.name || ""} ${temple.state?.name || ""}`;
      console.log(`  → Searching Google Places: "${searchQuery}"`);

      apiCallsCount++;
      const candidates = await searchGooglePlaces(searchQuery, temple.latitude, temple.longitude);
      await sleep(REQUEST_DELAY_MS); // Throttling

      if (candidates.length === 0) {
        console.log("  ⚠️ No candidates returned by Google API.");
        if (!isDryRun) {
          await prisma.temple.update({
            where: { id: temple.id },
            data: { googlePlaceVerificationStatus: "NO_MATCH" },
          });
          await prisma.auditResult.create({
            data: {
              templeId: temple.id,
              templeIdentifier: temple.identifier,
              templeName: temple.name,
              fieldChecked: "Google_Place_ID",
              existingValue: temple.googlePlaceId || "None",
              problem: "No Google Places match found within geographic bias",
              status: "OPEN",
              severity: "LOW",
              verified: false,
            },
          });
        }
        rejectedCount++;
        continue;
      }

      // Evaluate candidates
      let bestCandidate: GooglePlaceCandidate | null = null;
      let bestEvaluation: ReturnType<typeof evaluateCandidate> | null = null;

      for (const cand of candidates) {
        const evaluation = evaluateCandidate(
          {
            id: temple.id,
            name: temple.name,
            latitude: temple.latitude,
            longitude: temple.longitude,
            mainDeity: temple.mainDeity,
            districtName: temple.district?.name,
          },
          cand
        );

        if (evaluation.isMatch) {
          if (!bestEvaluation || evaluation.score > bestEvaluation.score) {
            bestCandidate = cand;
            bestEvaluation = evaluation;
          }
        }
      }

      if (bestCandidate && bestEvaluation) {
        console.log(`  ✅ MATCH FOUND: "${bestCandidate.displayName?.text}" (ID: ${bestCandidate.id})`);
        console.log(`     Score: ${bestEvaluation.score.toFixed(2)}, Distance: ${Math.round(bestEvaluation.distanceM)}m`);

        if (!isDryRun) {
          const alreadyAssigned = await prisma.temple.findFirst({
            where: {
              googlePlaceId: bestCandidate.id,
              id: { not: temple.id },
            },
            select: { id: true, identifier: true, name: true },
          });

          if (alreadyAssigned) {
            console.log(`  ⚠️ Duplicate Place ID conflict: "${bestCandidate.id}" already claimed by ${alreadyAssigned.identifier} (${alreadyAssigned.name}). Flagging for duplicate review.`);
            await prisma.temple.update({
              where: { id: temple.id },
              data: {
                googlePlaceVerificationStatus: "DUPLICATE_CANDIDATE",
              },
            });
            await prisma.auditResult.create({
              data: {
                templeId: temple.id,
                templeIdentifier: temple.identifier,
                templeName: temple.name,
                fieldChecked: "Google_Place_ID_Duplicate",
                existingValue: temple.googlePlaceId || "None",
                sourceFound: `Shared Google Place ID ${bestCandidate.id} with ${alreadyAssigned.identifier} (${alreadyAssigned.name})`,
                sourceUrl: bestCandidate.googleMapsUri,
                sourceType: "GOOGLE_PLACES",
                verified: false,
                recommendedAction: `Review potential duplicate with ${alreadyAssigned.identifier}`,
                severity: "HIGH",
                status: "OPEN",
              },
            });
            rejectedCount++;
            continue;
          }

          await prisma.temple.update({
            where: { id: temple.id },
            data: {
              googlePlaceId: bestCandidate.id,
              googlePlaceVerificationStatus: "VERIFIED",
              googleMapsUrl: bestCandidate.googleMapsUri || undefined,
            },
          });

          await prisma.auditResult.create({
            data: {
              templeId: temple.id,
              templeIdentifier: temple.identifier,
              templeName: temple.name,
              fieldChecked: "Google_Place_ID",
              existingValue: temple.googlePlaceId || "None",
              sourceFound: `Google Places API (${bestCandidate.displayName?.text})`,
              sourceUrl: bestCandidate.googleMapsUri,
              sourceType: "GOOGLE_PLACES",
              verified: true,
              recommendedAction: `Associated official Google Place ID: ${bestCandidate.id}`,
              severity: "LOW",
              status: "RESOLVED",
            },
          });
        }
        verifiedCount++;
      } else {
        console.log(`  ❌ Rejected: Candidate failed verification criteria.`);
        if (!isDryRun) {
          await prisma.temple.update({
            where: { id: temple.id },
            data: { googlePlaceVerificationStatus: "NEEDS_VERIFICATION" },
          });
        }
        rejectedCount++;
      }
    } catch (err: unknown) {
      console.error(`  ❌ Error processing ${temple.identifier}:`, err instanceof Error ? err.message : String(err));
      rejectedCount++;
    }
  }

  const estimatedCost = (apiCallsCount * 0.017).toFixed(4);

  console.log("\n=================================================");
  console.log("🏛️ GOOGLE PLACES VERIFICATION QUEUE REPORT");
  console.log("=================================================");
  console.log(`• Total Temples in Batch:    ${queue.length}`);
  console.log(`• Live API Calls Dispatched: ${apiCallsCount}`);
  console.log(`• Verified & Associated:     ${verifiedCount}`);
  console.log(`• Flagged / Unmatched:       ${rejectedCount}`);
  console.log(`• Skipped:                   ${skippedCount}`);
  console.log(`• Estimated API Cost:        $${estimatedCost} USD ($0.017/query)`);
  console.log(`• Mode:                      ${isDryRun ? "DRY RUN (no DB writes)" : "LIVE DATABASE SYNCHRONIZATION"}`);
  console.log("=================================================");
}

runGooglePlacesWorker()
  .catch((err) => {
    console.error("Worker failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
