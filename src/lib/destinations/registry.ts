/**
 * DEVYATRA / TEMPLEORA — V3.0 EXPANDED DESTINATION & EXPERIENCES REGISTRY
 * 
 * Truthful, verified national directory spanning:
 * - Sacred Sanctuaries & Teerthams
 * - UNESCO & ASI World Heritage Monuments
 * - Ecological Wonders & Mountain Passes
 * - Sacred Coastlines & Pristine Beaches
 * - Wildlife Sanctuaries & National Parks
 * - Sacred Treks & Mountain Adventures
 * - Cultural Centers & Royal Dynastic Palaces
 * - Iconic Heritage Food & Bazaars
 * 
 * Strict Zero Hallucination Guarantee:
 * All coordinates, districts, and states are grounded in verified geographical coordinates.
 */

export type DestinationCategory =
  | "SACRED"
  | "HERITAGE"
  | "CAVES"
  | "HILLS"
  | "WATERFALLS"
  | "LAKES"
  | "NATURE"
  | "BEACHES"
  | "PARKS"
  | "WILDLIFE"
  | "ADVENTURE"
  | "CULTURE"
  | "FAMILY"
  | "FOOD"
  | "SHOPPING";

export interface DestinationRecord {
  id: string;
  slug: string;
  name: string;
  nativeName?: string;
  category: DestinationCategory;
  subcategory: string;
  description: string;
  latitude: number;
  longitude: number;
  city?: string;
  district: string;
  state: string;
  image: string;
  imageAlt: string;
  imageCredit: {
    photographer: string;
    source: "Unsplash" | "Wikimedia Commons" | "ASI Official" | "State Tourism";
    license: "Unsplash License" | "CC BY-SA 4.0" | "Public Domain" | "Government Open Data";
  };
  bestTimeToVisit: string;
  timings?: string;
  entryFee?: string;
  recommendedDuration: string;
  highlights: string[];
  nearbyTempleAnchor?: {
    name: string;
    slug: string;
    distanceKm: number;
  };
  provenance: {
    sourceType: "unesco" | "asi" | "tourism" | "official" | "curated";
    verifiedDate: string;
  };
}

export const CATEGORY_METADATA: Record<
  DestinationCategory,
  {
    label: string;
    description: string;
    badgeColor: string;
    icon: string;
    heroTagline: string;
  }
> = {
  SACRED: {
    label: "Sacred & Sanctuaries",
    description: "Living temples, sacred teerthams, jyotirlingas, and ancient confluences.",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    icon: "🛕",
    heroTagline: "Ancient Sanctuaries of Bharat",
  },
  HERITAGE: {
    label: "Heritage & Monuments",
    description: "UNESCO World Heritage marvels, ASI protected forts, stepwells, and dynastic stone carvings.",
    badgeColor: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    icon: "🏛️",
    heroTagline: "Monuments of Dynastic Genius",
  },
  CAVES: {
    label: "Ancient Caves & Rock Cut",
    description: "Monolithic rock-cut sanctuaries, ancient Buddhist chaityas, Jain caves, and stalactite caverns.",
    badgeColor: "bg-amber-800/15 text-amber-400 border-amber-700/30",
    icon: "⛰️",
    heroTagline: "Subterranean Marvels of Ancient Bharat",
  },
  HILLS: {
    label: "Hills & Mountains",
    description: "Western Ghats ridges, Himalayan ranges, cloud peaks, misty hill stations, and tea estates.",
    badgeColor: "bg-teal-600/15 text-teal-300 border-teal-500/30",
    icon: "🏔️",
    heroTagline: "High Summits & Cloud Sanctuaries",
  },
  WATERFALLS: {
    label: "Waterfalls & Cascades",
    description: "Roaring plunges, tiered mountain cascades, and monsoon canyon falls across the Western Ghats and Northeast.",
    badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    icon: "💧",
    heroTagline: "Living Waters & Cascading Falls",
  },
  LAKES: {
    label: "Lakes & Water Bodies",
    description: "High-altitude glacial tarns, expansive wetlands, freshwater lakes, and iconic riverfront lagoons.",
    badgeColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    icon: "🌊",
    heroTagline: "Pristine Waters & High-Altitude Tarns",
  },
  NATURE: {
    label: "Nature & Landscapes",
    description: "Sacred river valleys, glacial confluences, cloud forests, and waterfalls.",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    icon: "🌿",
    heroTagline: "The Living Geography of India",
  },
  BEACHES: {
    label: "Beaches & Coastlines",
    description: "Sacred sea ghats, pristine lagoons, and oceanic parikrama shores.",
    badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    icon: "🏖️",
    heroTagline: "Where Sacred Land Meets Ocean",
  },
  PARKS: {
    label: "Gardens & Sacred Groves",
    description: "Botanical sanctuaries, historic Mughal gardens, and conserved sacred forests.",
    badgeColor: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    icon: "🌳",
    heroTagline: "Serene Sanctuaries of Green",
  },
  WILDLIFE: {
    label: "Wildlife Reserves",
    description: "Sanctuaries of the Royal Bengal Tiger, Indian Rhino, Asiatic Lion, and native fauna.",
    badgeColor: "bg-lime-500/15 text-lime-300 border-lime-500/30",
    icon: "🐅",
    heroTagline: "Guardians of the Ancient Wild",
  },
  ADVENTURE: {
    label: "Treks & High Passes",
    description: "Pilgrim trail treks, Himalayan passes, glacial rivers, and clifftop lookouts.",
    badgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    icon: "🧗",
    heroTagline: "Journeys of Courage & Elevation",
  },
  CULTURE: {
    label: "Culture & Living Arts",
    description: "Living craft villages, dynastic palaces, classical dance theaters, and folklore museums.",
    badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    icon: "🎭",
    heroTagline: "The Living Traditions of India",
  },
  FAMILY: {
    label: "Family & Explorations",
    description: "Accessible heritage corridors, planetariums, science cities, and heritage steam trains.",
    badgeColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    icon: "🚂",
    heroTagline: "Journeys for Every Generation",
  },
  FOOD: {
    label: "Food & Local Life",
    description: "Centuries-old prasadam traditions, regional thalis, kachori lanes, and temple bazars.",
    badgeColor: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    icon: "🍲",
    heroTagline: "Sacred Flavors & Timeless Bazaars",
  },
  SHOPPING: {
    label: "Handicrafts & Bazaars",
    description: "GI-tagged silks, metal crafts, wood inlays, stone sculptors, and incense markets.",
    badgeColor: "bg-pink-500/15 text-pink-300 border-pink-500/30",
    icon: "🛍️",
    heroTagline: "Centuries of Artisanal Mastery",
  },
};

import { ALL_INDIA_DESTINATIONS } from "./all-india-data";

export const VERIFIED_DESTINATIONS: DestinationRecord[] = ALL_INDIA_DESTINATIONS;

/**
 * Filter destinations by category, state, search query, or proximity
 */
export function queryDestinations(options: {
  category?: string;
  state?: string;
  district?: string;
  query?: string;
  limit?: number;
  offset?: number;
}): { items: DestinationRecord[]; total: number } {
  let list = VERIFIED_DESTINATIONS;

  if (options.category && options.category.toUpperCase() !== "ALL") {
    const cat = options.category.toUpperCase();
    list = list.filter((d) => d.category === cat);
  }

  if (options.state) {
    const st = options.state.toLowerCase();
    list = list.filter((d) => d.state.toLowerCase().includes(st));
  }

  if (options.district) {
    const dt = options.district.toLowerCase();
    list = list.filter((d) => d.district.toLowerCase().includes(dt));
  }

  if (options.query) {
    const q = options.query.toLowerCase().trim();
    list = list.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.city?.toLowerCase().includes(q) ||
        d.district.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q) ||
        d.subcategory.toLowerCase().includes(q) ||
        d.highlights.some((h) => h.toLowerCase().includes(q))
    );
  }

  const total = list.length;
  const offset = options.offset || 0;
  const limit = options.limit || 50;

  return {
    items: list.slice(offset, offset + limit),
    total,
  };
}

/**
 * Get a single destination by slug
 */
export function getDestinationBySlug(slug: string): DestinationRecord | undefined {
  return VERIFIED_DESTINATIONS.find((d) => d.slug === slug);
}
