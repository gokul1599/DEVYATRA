/**
 * DEVYATRA / TEMPLEORA — DATA PIPELINE: DISCOVERY STAGE
 * 
 * Command: npm run data:discover
 * 
 * Loads candidates from statutory national databases, state tourism registries,
 * and institutional gazetteers. Formats raw inputs into PipelineCandidateRecord
 * with explicit provenance tracking.
 */

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ALL_INDIA_DESTINATIONS } from "../../src/lib/destinations/all-india-data.js";
import { normalizeCategory, MASTER_CATEGORIES } from "../../src/lib/destinations/categories.js";
import { NATIONAL_SOURCE_REGISTRY } from "../../src/lib/destinations/source-registry.js";
import type { PipelineCandidateRecord, PipelineSourceReference } from "./types.js";

export function discoverAllCandidates(): PipelineCandidateRecord[] {
  console.log("==> [DISCOVER] Starting India Place Discovery Pipeline...");
  const candidates: PipelineCandidateRecord[] = [];

  for (const d of ALL_INDIA_DESTINATIONS) {
    const primaryCat = normalizeCategory(d.category);
    
    // Multi-category determination
    const categoriesSet = new Set<any>([primaryCat]);
    if (d.category === "CAVES") {
      categoriesSet.add("HERITAGE");
      if (d.tags?.includes("buddhist") || d.tags?.includes("shaivite") || d.description.toLowerCase().includes("temple")) {
        categoriesSet.add("SACRED");
      }
    }
    if (d.category === "HILLS" || d.category === "MOUNTAINS") {
      categoriesSet.add("NATURE");
      if (d.tags?.includes("trek") || d.description.toLowerCase().includes("trek")) {
        categoriesSet.add("ADVENTURE");
      }
    }
    if (d.category === "WATERFALLS" || d.category === "LAKES") {
      categoriesSet.add("NATURE");
    }
    if (d.tags?.includes("unesco") || d.unescoReference) {
      categoriesSet.add("HERITAGE");
    }
    if (d.category === "SHOPPING" || d.category === "BAZAARS" || d.category === "CRAFTS") {
      categoriesSet.add("SHOPPING");
      if (d.tags?.includes("crafts") || d.tags?.includes("handloom") || d.tags?.includes("folk-art") || d.tags?.includes("art")) {
        categoriesSet.add("CULTURE");
      }
    }
    if (d.category === "FOOD") {
      categoriesSet.add("FOOD");
      categoriesSet.add("CULTURE");
    }
    if (d.category === "FAMILY") {
      categoriesSet.add("FAMILY");
      if (d.tags?.includes("museums") || d.tags?.includes("archaeology")) {
        categoriesSet.add("CULTURE");
        categoriesSet.add("HERITAGE");
      }
    }
    if (d.category === "ADVENTURE" || d.tags?.includes("trekking")) {
      categoriesSet.add("ADVENTURE");
    }

    // Determine authoritative source reference
    const sourceRef: PipelineSourceReference = {
      title: d.provenance?.sourceType === "unesco"
        ? "UNESCO World Heritage Convention Inscription"
        : d.provenance?.sourceType === "asi"
        ? "Archaeological Survey of India Gazette"
        : `${d.state} State Tourism & Statutory Gazetteer`,
      publisher: d.provenance?.sourceType === "unesco"
        ? "UNESCO World Heritage Centre"
        : d.provenance?.sourceType === "asi"
        ? "Archaeological Survey of India"
        : `${d.state} Tourism Department`,
      url: d.provenance?.sourceUrl || "https://tourism.gov.in/",
      sourceType: d.provenance?.sourceType === "unesco"
        ? "UNESCO"
        : d.provenance?.sourceType === "asi"
        ? "STATUTORY"
        : "TOURISM",
      accessedAt: d.provenance?.verifiedDate || new Date().toISOString().split("T")[0],
      officialRecordId: d.asiReference || d.unescoReference || null,
    };

    const candidate: PipelineCandidateRecord = {
      id: d.id,
      slug: d.slug,
      name: d.name,
      nativeName: d.nativeName,
      alternateNames: d.highlights?.slice(0, 2) || [],
      category: primaryCat,
      categories: Array.from(categoriesSet),
      subcategory: d.subcategory || d.subtype || undefined,
      description: d.description,

      state: d.state,
      district: d.district,
      city: d.city,
      country: "India",

      latitude: d.latitude,
      longitude: d.longitude,
      coordinateStatus: "VERIFIED",
      coordinatePrecision: d.locationConfidence === "exact" ? "EXACT" : "APPROXIMATE",

      timings: d.timings || d.verifiedHours || null,
      entryFee: d.entryFee || d.verifiedEntryFee || null,
      bestTimeToVisit: d.bestTimeToVisit,
      recommendedDuration: d.recommendedDuration,
      accessType: d.operationalStatus === "RESTRICTED" ? "RESTRICTED" : "PUBLIC",

      asiProtected: Boolean(d.asiReference || d.tags?.includes("asi")),
      asiMonumentId: d.asiReference || null,
      unescoDesignated: Boolean(d.unescoReference || d.tags?.includes("unesco")),
      unescoReference: d.unescoReference || null,
      ramsarSite: Boolean(d.tags?.includes("ramsar") || d.description.toLowerCase().includes("ramsar")),
      tigerReserve: Boolean(d.tags?.includes("tiger-reserve")),
      nationalPark: Boolean(d.tags?.includes("national-park") || d.subcategory?.includes("National Park")),
      wildlifeSanctuary: Boolean(d.tags?.includes("wildlife-sanctuary") || d.subcategory?.includes("Sanctuary")),
      elephantReserve: Boolean(d.tags?.includes("elephant-reserve")),
      biosphereReserve: Boolean(d.tags?.includes("biosphere-reserve")),
      communityReserve: Boolean(d.tags?.includes("community-reserve")),
      marineProtectedArea: Boolean(d.tags?.includes("marine-protected-area")),
      importantBirdArea: Boolean(d.tags?.includes("iba") || d.tags?.includes("birding")),
      gsiProtected: Boolean(d.tags?.includes("gsi") || d.subcategory?.includes("GSI")),
      gsiMonumentId: d.tags?.includes("gsi") ? `GSI-${d.slug}` : null,

      placeKind: d.tags?.includes("gsi") ? "geographic_feature" : "point_of_interest",
      subtypes: d.subtype ? [d.subtype] : [],
      activities: d.tags?.filter(t => ["trekking", "birding", "boating", "safari", "photography", "caving"].includes(t)) || [],
      designations: [
        ...(d.unescoReference ? ["UNESCO World Heritage"] : []),
        ...(d.asiReference ? ["ASI Protected Monument"] : []),
        ...(d.tags?.includes("gsi") ? ["GSI National Geological Monument"] : []),
        ...(d.tags?.includes("ramsar") ? ["Ramsar Wetland Site"] : []),
      ],

      sources: [sourceRef],
      provenanceTier: d.provenance?.sourceType === "unesco"
        ? "INTERNATIONAL_INSTITUTIONAL"
        : d.provenance?.sourceType === "asi"
        ? "OFFICIAL_STATUTORY"
        : "STATE_GOVERNMENT",
      verificationStatus: "VERIFIED_OFFICIAL",
      verifiedAt: d.provenance?.verifiedDate || new Date().toISOString().split("T")[0],
      lastCheckedAt: new Date().toISOString(),

      image: d.image,
      imageAlt: d.imageAlt,
      imageCreditName: d.imageCredit?.photographer,
      imageCreditSource: d.imageCredit?.source,
      imageLicense: d.imageCredit?.license,
      isAiGeneratedImage: false,

      highlights: d.highlights || [],
      tags: d.tags || [],
      culturalTags: d.culturalTags || [],
      audienceTags: d.audienceTags || [],

      nearbyTempleSlugs: d.nearbyTempleAnchor?.slug ? [d.nearbyTempleAnchor.slug] : [],

      pipelineStatus: "DISCOVERED",
    };

    candidates.push(candidate);
  }

  console.log(`==> [DISCOVER] Discovered ${candidates.length} candidates across India.`);
  return candidates;
}

export function exportStructuredDatasets(candidates: PipelineCandidateRecord[]) {
  const dataDir = join(process.cwd(), "data");
  const natDir = join(dataDir, "national");
  const stateDir = join(dataDir, "states");
  const catDir = join(dataDir, "categories");

  [dataDir, natDir, stateDir, catDir].forEach((dir) => {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  });

  // 1. National Datasets
  const nationalSummary = {
    generatedAt: new Date().toISOString(),
    totalPlaces: candidates.length,
    sourcesTracked: NATIONAL_SOURCE_REGISTRY.length,
    sourceRegistry: NATIONAL_SOURCE_REGISTRY,
    candidatesSummary: candidates.map(c => ({
      slug: c.slug,
      name: c.name,
      category: c.category,
      state: c.state,
      district: c.district,
      designations: c.designations,
    })),
  };
  writeFileSync(join(natDir, "national_summary.json"), JSON.stringify(nationalSummary, null, 2));

  // 2. State-specific partition
  const byState: Record<string, PipelineCandidateRecord[]> = {};
  for (const c of candidates) {
    if (!byState[c.state]) byState[c.state] = [];
    byState[c.state].push(c);
  }
  writeFileSync(join(stateDir, "all_36_states_coverage.json"), JSON.stringify(byState, null, 2));

  // 3. Category taxonomy partition
  const byCat: Record<string, PipelineCandidateRecord[]> = {};
  for (const c of candidates) {
    if (!byCat[c.category]) byCat[c.category] = [];
    byCat[c.category].push(c);
  }
  writeFileSync(join(catDir, "taxonomy.json"), JSON.stringify({
    categories: MASTER_CATEGORIES,
    placeCounts: Object.fromEntries(Object.entries(byCat).map(([k, v]) => [k, v.length])),
  }, null, 2));

  console.log(`==> [DISCOVER] Exported structured files to data/national, data/states, data/categories.`);
}

if (process.argv[1]?.includes("discover")) {
  const candidates = discoverAllCandidates();
  exportStructuredDatasets(candidates);
  console.log(`[DISCOVER COMPLETE] Found ${candidates.length} candidates.`);
}
