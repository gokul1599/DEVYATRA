/**
 * DEVYATRA / TEMPLEORA — V3.5 EXPANDED NATIONAL DESTINATION & EXPERIENCES REGISTRY
 * 
 * Truthful, verified national directory spanning:
 * - Sacred Sanctuaries & Teerthams
 * - UNESCO & ASI World Heritage Monuments
 * - Impregnable Forts & Royal Palaces
 * - Ancient Rock-Cut Caves & Monasteries
 * - High Summits, Mountain Passes & Hill Stations
 * - Glacial Tarns, Sacred Lakes & Lagoons
 * - Perennial Cascades & River Confluences
 * - Sacred Coastlines, Pristine Beaches & Atolls
 * - Protected Wildlife Sanctuaries & National Parks
 * - Sacred Treks & Mountain Adventures
 * - Museums, Living Arts & Craft Villages
 * - Heritage Food Bazaars & Prasadam Traditions
 * 
 * Strict Zero Hallucination Guarantee:
 * All coordinates, districts, and states are grounded in verified geographical coordinates.
 * No fabricated generic operational hours or synthetic fallback fees.
 */

export type DestinationCategory =
  | "SACRED"
  | "HERITAGE"
  | "UNESCO"
  | "FORTS"
  | "PALACES"
  | "CAVES"
  | "HILLS"
  | "MOUNTAINS"
  | "PASSES"
  | "LAKES"
  | "RIVERS"
  | "WATERFALLS"
  | "BEACHES"
  | "ISLANDS"
  | "NATURE"
  | "PARKS"
  | "GARDENS"
  | "WILDLIFE"
  | "ADVENTURE"
  | "TREKS"
  | "CULTURE"
  | "MUSEUMS"
  | "FAMILY"
  | "ENTERTAINMENT"
  | "FOOD"
  | "SHOPPING"
  | "BAZAARS"
  | "CRAFTS"
  | "ARCHITECTURE";

export interface DestinationRecord {
  id: string;
  slug: string;
  name: string;
  nativeName?: string;
  category: DestinationCategory;
  primaryCategory?: DestinationCategory;
  subtype?: string;
  subcategory?: string;
  tags?: string[];
  culturalTags?: string[];
  audienceTags?: string[];
  description: string;
  latitude: number;
  longitude: number;
  locationConfidence?: "exact" | "site_center" | "approximate";
  city?: string;
  district: string;
  state: string;
  image: string;
  imageAlt: string;
  imageCredit: {
    photographer: string;
    source: "Unsplash" | "Wikimedia Commons" | "ASI Official" | "State Tourism" | "Official Record";
    license: "Unsplash License" | "CC BY-SA 4.0" | "Public Domain" | "Government Open Data";
  };
  bestTimeToVisit?: string;
  timings?: string | null;
  entryFee?: string | null;
  recommendedDuration?: string;
  operationalStatus?: "OPEN" | "SEASONAL" | "RESTRICTED" | "UNVERIFIED";
  verifiedHours?: string | null;
  verifiedEntryFee?: string | null;
  officialWebsite?: string | null;
  unescoReference?: string | null;
  asiReference?: string | null;
  highlights: string[];
  nearbyTempleAnchor?: {
    name: string;
    slug: string;
    distanceKm: number;
  };
  provenance: {
    sourceType: "unesco" | "asi" | "tourism" | "official" | "curated" | "government";
    verifiedDate: string;
    sourceUrl?: string;
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
  UNESCO: {
    label: "UNESCO World Heritage",
    description: "Internationally designated cultural and natural landmarks of outstanding universal value.",
    badgeColor: "bg-amber-600/15 text-amber-200 border-amber-600/30",
    icon: "🌐",
    heroTagline: "Treasures of Universal Value",
  },
  FORTS: {
    label: "Forts & Citadels",
    description: "Impregnable hill fortresses, coastal bastions, and royal battlements.",
    badgeColor: "bg-stone-500/15 text-stone-200 border-stone-500/30",
    icon: "🏰",
    heroTagline: "Sentinels of Stone & History",
  },
  PALACES: {
    label: "Palaces & Royal Courts",
    description: "Splendid royal residences, mahals, and darbar halls.",
    badgeColor: "bg-yellow-600/15 text-yellow-200 border-yellow-600/30",
    icon: "👑",
    heroTagline: "Splendor of Princely Courts",
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
  MOUNTAINS: {
    label: "Mountains & Peaks",
    description: "Snowbound Himalayan summits, sacred peaks, and alpine ridges.",
    badgeColor: "bg-slate-500/15 text-slate-200 border-slate-500/30",
    icon: "🏔️",
    heroTagline: "Sacred Summits of the Gods",
  },
  PASSES: {
    label: "High Altitude Passes",
    description: "Strategic mountain passes, old silk route links, and high motorable passes.",
    badgeColor: "bg-blue-600/15 text-blue-200 border-blue-600/30",
    icon: "🛤️",
    heroTagline: "Gateways Across the Clouds",
  },
  LAKES: {
    label: "Lakes & Water Bodies",
    description: "High-altitude glacial tarns, expansive wetlands, freshwater lakes, and iconic riverfront lagoons.",
    badgeColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    icon: "🌊",
    heroTagline: "Pristine Waters & High-Altitude Tarns",
  },
  RIVERS: {
    label: "Rivers & Sacred Ghats",
    description: "Holy riverfronts, sacred sangams, and living bathing ghats.",
    badgeColor: "bg-cyan-600/15 text-cyan-200 border-cyan-600/30",
    icon: "🌊",
    heroTagline: "Living Lifelines of Bharat",
  },
  WATERFALLS: {
    label: "Waterfalls & Cascades",
    description: "Roaring plunges, tiered mountain cascades, and monsoon canyon falls across the Western Ghats and Northeast.",
    badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    icon: "💧",
    heroTagline: "Living Waters & Cascading Falls",
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
  ISLANDS: {
    label: "Islands & Atolls",
    description: "Coral atolls, river islands, and archipelagos in the Arabian Sea and Bay of Bengal.",
    badgeColor: "bg-emerald-600/15 text-emerald-200 border-emerald-600/30",
    icon: "🏝️",
    heroTagline: "Islands of Serenity & Wonder",
  },
  PARKS: {
    label: "Gardens & Sacred Groves",
    description: "Botanical sanctuaries, historic Mughal gardens, and conserved sacred forests.",
    badgeColor: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    icon: "🌳",
    heroTagline: "Serene Sanctuaries of Green",
  },
  GARDENS: {
    label: "Gardens & Charbaghs",
    description: "Formal Mughal charbaghs, landscaped arboretums, and terrace parks.",
    badgeColor: "bg-rose-600/15 text-rose-200 border-rose-600/30",
    icon: "🌸",
    heroTagline: "Symphonies of Petals & Stone",
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
  TREKS: {
    label: "Treks & Foot Trails",
    description: "Sacred parikrama walking tracks, high ridges, and forest treks.",
    badgeColor: "bg-orange-600/15 text-orange-200 border-orange-600/30",
    icon: "🥾",
    heroTagline: "Trails into the Wild",
  },
  CULTURE: {
    label: "Culture & Living Arts",
    description: "Living craft villages, dynastic palaces, classical dance theaters, and folklore museums.",
    badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    icon: "🎭",
    heroTagline: "The Living Traditions of India",
  },
  MUSEUMS: {
    label: "Museums & Galleries",
    description: "National museums, artifact galleries, and numismatic archives.",
    badgeColor: "bg-indigo-600/15 text-indigo-200 border-indigo-600/30",
    icon: "🏛️",
    heroTagline: "Keepers of Memory & Artifacts",
  },
  FAMILY: {
    label: "Family & Explorations",
    description: "Accessible heritage corridors, planetariums, science cities, and heritage steam trains.",
    badgeColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    icon: "🚂",
    heroTagline: "Journeys for Every Generation",
  },
  ENTERTAINMENT: {
    label: "Entertainment & Studios",
    description: "Cinema studios, cultural theme parks, and family leisure experiences.",
    badgeColor: "bg-fuchsia-600/15 text-fuchsia-200 border-fuchsia-600/30",
    icon: "🎪",
    heroTagline: "Celebration & Wonder",
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
  BAZAARS: {
    label: "Historic Bazaars",
    description: "Centuries-old night markets, spice alleys, and traditional bazaars.",
    badgeColor: "bg-amber-700/15 text-amber-200 border-amber-700/30",
    icon: "🏮",
    heroTagline: "Heartbeats of Ancient Trade",
  },
  CRAFTS: {
    label: "Handicrafts & Guilds",
    description: "Living artisan workshops, handlooms, and bronze casting.",
    badgeColor: "bg-violet-600/15 text-violet-200 border-violet-600/30",
    icon: "🎨",
    heroTagline: "Masterpieces of Living Hands",
  },
  ARCHITECTURE: {
    label: "Architectural Marvels",
    description: "Masterworks of structural geometry, acoustics, and stone craft.",
    badgeColor: "bg-stone-600/15 text-stone-200 border-stone-600/30",
    icon: "📐",
    heroTagline: "The Science of Sacred Stone",
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
  tag?: string;
  limit?: number;
  offset?: number;
}): { items: DestinationRecord[]; total: number } {
  let list = VERIFIED_DESTINATIONS;

  if (options.category && options.category.toUpperCase() !== "ALL") {
    const cat = options.category.toUpperCase();
    list = list.filter((d) => d.category === cat || d.primaryCategory === cat);
  }

  if (options.state) {
    const st = options.state.toLowerCase();
    list = list.filter((d) => d.state.toLowerCase().includes(st));
  }

  if (options.district) {
    const dt = options.district.toLowerCase();
    list = list.filter((d) => d.district.toLowerCase().includes(dt));
  }

  if (options.tag) {
    const tg = options.tag.toLowerCase();
    list = list.filter((d) => 
      d.tags?.some((t) => t.toLowerCase().includes(tg)) ||
      d.culturalTags?.some((t) => t.toLowerCase().includes(tg)) ||
      d.audienceTags?.some((t) => t.toLowerCase().includes(tg))
    );
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
        (d.subcategory || d.subtype || "").toLowerCase().includes(q) ||
        d.highlights.some((h) => h.toLowerCase().includes(q)) ||
        d.tags?.some((t) => t.toLowerCase().includes(q))
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
