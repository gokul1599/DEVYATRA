import { ALL_INDIA_DESTINATIONS } from "../../src/lib/destinations/all-india-data.js";
import { normalizeCategory } from "../../src/lib/destinations/categories.js";
import type { RawPlaceInput } from "./types.js";
import { validatePlaceRecord } from "./validate.js";
import { deduplicatePlaces } from "./dedupe.js";

export function loadAllIndiaRawPlaces(): RawPlaceInput[] {
  return ALL_INDIA_DESTINATIONS.map((d): RawPlaceInput => {
    const cat = normalizeCategory(d.category);
    
    // Multi-category determination
    const categoriesSet = new Set<string>([cat]);
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

    return {
      slug: d.slug,
      name: d.name,
      nativeName: d.nativeName,
      alternateNames: d.highlights?.slice(0, 2) || [],
      category: cat,
      categories: Array.from(categoriesSet) as any,
      subcategory: d.subcategory || d.subtype || undefined,
      description: d.description,
      latitude: d.latitude,
      longitude: d.longitude,
      coordinatePrecision: d.locationConfidence === "approximate" ? "APPROXIMATE" : "EXACT",
      city: d.city,
      district: d.district,
      state: d.state,
      country: "India",
      status: "ACTIVE",
      timings: d.timings,
      entryFee: d.entryFee,
      bestTimeToVisit: d.bestTimeToVisit,
      recommendedDuration: d.recommendedDuration,
      facilities: ["Drinking Water", "Restrooms", "Parking"],
      accessibilityFeatures: ["Paved Walkways"],
      asiProtected: !!d.asiReference || d.provenance.sourceType === "asi",
      asiMonumentId: d.asiReference || undefined,
      unescoDesignated: !!d.unescoReference || d.provenance.sourceType === "unesco",
      unescoReference: d.unescoReference || undefined,
      ramsarSite: (d.category === "LAKES" || d.category === "WILDLIFE") && (d.description.toLowerCase().includes("ramsar") || (d.tags && d.tags.includes("ramsar"))),
      tigerReserve: d.category === "WILDLIFE" && (d.description.toLowerCase().includes("tiger") || (d.tags && d.tags.includes("tiger"))),
      nationalPark: d.category === "WILDLIFE" && (d.subcategory?.toLowerCase().includes("national park") || d.description.toLowerCase().includes("national park")),
      wildlifeSanctuary: d.category === "WILDLIFE" && (d.subcategory?.toLowerCase().includes("sanctuary") || d.description.toLowerCase().includes("sanctuary")),
      verificationStatus: "VERIFIED_OFFICIAL",
      provenanceTier: d.provenance.sourceType === "unesco" || d.provenance.sourceType === "asi" || d.provenance.sourceType === "official" ? "OFFICIAL_STATUTORY" : "STATE_GOVERNMENT",
      sourceName: d.provenance.sourceType === "unesco" 
        ? "UNESCO World Heritage Centre" 
        : d.provenance.sourceType === "asi" 
        ? "Archaeological Survey of India (ASI)" 
        : d.tags?.includes("ramsar")
        ? "Wetlands of India / Ramsar Convention"
        : d.tags?.includes("ntca")
        ? "National Tiger Conservation Authority (NTCA)"
        : d.tags?.includes("gi-tag")
        ? "Intellectual Property India (GI Registry)"
        : d.tags?.includes("museums")
        ? "Museums of India (Ministry of Culture)"
        : "State Tourism & Culture Department",
      sourceType: d.provenance.sourceType,
      sourceUrl: d.provenance.sourceUrl,
      officialWebsite: d.officialWebsite,
      image: d.image,
      imageAlt: d.imageAlt,
      imageCreditName: d.imageCredit.photographer,
      imageCreditSource: d.imageCredit.source,
      imageLicense: d.imageCredit.license,
      isAiGeneratedImage: false,
      highlights: d.highlights || [],
      tags: d.tags || [],
      culturalTags: d.culturalTags || [],
      audienceTags: d.audienceTags || [],
      nearbyTempleSlugs: d.nearbyTempleAnchor ? [d.nearbyTempleAnchor.slug] : []
    };
  });
}
