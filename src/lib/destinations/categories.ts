/**
 * DEVYATRA / TEMPLEORA — MASTER CATEGORY SYSTEM (PHASE V2.5)
 * 
 * Strict authoritative taxonomy of all 15 India Discovery Categories:
 * 1. Sacred Shrines
 * 2. Heritage & ASI
 * 3. Ancient Caves
 * 4. Hills & Mountains
 * 5. Waterfalls
 * 6. Lakes & Wetlands
 * 7. Nature & Ghats
 * 8. Beaches & Coast
 * 9. Wildlife & Reserves
 * 10. Gardens & Parks
 * 11. Family & Fun
 * 12. Adventure & Treks
 * 13. Culture & Arts
 * 14. Heritage Food
 * 15. Bazaars & Crafts
 */

export type MasterCategory =
  | "SACRED"
  | "HERITAGE"
  | "CAVES"
  | "HILLS"
  | "WATERFALLS"
  | "LAKES"
  | "NATURE"
  | "BEACHES"
  | "WILDLIFE"
  | "PARKS"
  | "FAMILY"
  | "ADVENTURE"
  | "CULTURE"
  | "FOOD"
  | "SHOPPING";

export interface CategoryDefinition {
  id: MasterCategory;
  slug: string;
  label: string;
  pluralLabel: string;
  iconName: string;
  emoji: string;
  badgeClass: string;
  borderClass: string;
  accentHex: string;
  description: string;
  heroTagline: string;
  subcategories: string[];
  authoritativeSources: string[];
}

export const MASTER_CATEGORIES: Record<MasterCategory, CategoryDefinition> = {
  SACRED: {
    id: "SACRED",
    slug: "sacred",
    label: "Sacred & Sanctuaries",
    pluralLabel: "Sacred Shrines & Teerthams",
    iconName: "Landmark",
    emoji: "🛕",
    badgeClass: "bg-amber-500/15 text-amber-300",
    borderClass: "border-amber-500/30",
    accentHex: "#f59e0b",
    description: "Living temples, jyotirlingas, shakti peethas, ashrams, mathas, gurudwaras, and sacred river sangams.",
    heroTagline: "Living Sanctuaries of Bharat",
    subcategories: [
      "Temple",
      "Shrine",
      "Ashram",
      "Matha",
      "Monastery",
      "Gurudwara",
      "Jain Temple",
      "Buddhist Stupa",
      "Sacred River Ghat",
      "Sacred Kund/Tank",
      "Sacred Mountain",
      "Pilgrimage Centre"
    ],
    authoritativeSources: ["State Endowments & Devasthanam Boards", "ASI", "Cultural Registries"]
  },
  HERITAGE: {
    id: "HERITAGE",
    slug: "heritage",
    label: "Heritage & Monuments",
    pluralLabel: "Monuments & Forts",
    iconName: "Castle",
    emoji: "🏛️",
    badgeClass: "bg-orange-500/15 text-orange-300",
    borderClass: "border-orange-500/30",
    accentHex: "#ea580c",
    description: "UNESCO World Heritage sites, ASI centrally protected monuments, dynastic forts, royal palaces, stepwells, and ancient ruins.",
    heroTagline: "Monuments of Dynastic Genius",
    subcategories: [
      "ASI Protected Monument",
      "UNESCO World Heritage Site",
      "Hill Fort",
      "Royal Palace",
      "Ancient Stepwell",
      "Archaeological Site",
      "Dynastic Gateway",
      "State Protected Monument"
    ],
    authoritativeSources: ["Archaeological Survey of India (ASI)", "UNESCO World Heritage Centre", "State Archaeology Depts"]
  },
  CAVES: {
    id: "CAVES",
    slug: "caves",
    label: "Ancient Caves",
    pluralLabel: "Rock-Cut Caves & Caverns",
    iconName: "Mountain",
    emoji: "⛰️",
    badgeClass: "bg-stone-500/15 text-stone-300",
    borderClass: "border-stone-500/30",
    accentHex: "#78716c",
    description: "Monolithic rock-cut sanctuaries, Buddhist chaitya halls, Jain viharas, and natural karst limestone cavern complexes.",
    heroTagline: "Subterranean Marvels of Ancient Bharat",
    subcategories: [
      "Rock-Cut Cave",
      "Buddhist Chaitya & Vihara",
      "Jain Cave Complex",
      "Hindu Rock-Cut Sanctuary",
      "Natural Limestone Cavern",
      "Prehistoric Painted Cave"
    ],
    authoritativeSources: ["ASI", "Geological Survey of India", "UNESCO"]
  },
  HILLS: {
    id: "HILLS",
    slug: "hills",
    label: "Hills & Mountains",
    pluralLabel: "Hills & Mountain Passes",
    iconName: "MountainSnow",
    emoji: "🏔️",
    badgeClass: "bg-teal-500/15 text-teal-300",
    borderClass: "border-teal-500/30",
    accentHex: "#0d9488",
    description: "Western Ghats cloud ridges, Himalayan peaks, high motorable passes, scenic hill stations, and tea plateaus.",
    heroTagline: "High Summits & Cloud Sanctuaries",
    subcategories: [
      "Hill Station",
      "Mountain Peak",
      "High Altitude Pass",
      "Scenic Mountain Ridge",
      "Valley Viewpoint",
      "Plateau"
    ],
    authoritativeSources: ["Survey of India", "Indian Mountaineering Foundation (IMF)", "State Tourism Depts"]
  },
  WATERFALLS: {
    id: "WATERFALLS",
    slug: "waterfalls",
    label: "Waterfalls & Cascades",
    pluralLabel: "Waterfalls & Gorges",
    iconName: "Droplets",
    emoji: "💧",
    badgeClass: "bg-cyan-500/15 text-cyan-300",
    borderClass: "border-cyan-500/30",
    accentHex: "#06b6d4",
    description: "Perennial plunge falls, tiered mountain cascades, river gorges, and monsoon torrents across India's ghats.",
    heroTagline: "Living Waters & Cascading Falls",
    subcategories: [
      "Plunge Waterfall",
      "Tiered Mountain Cascade",
      "River Gorge Fall",
      "Seasonal Monsoon Cascade",
      "Forest Waterfall"
    ],
    authoritativeSources: ["State Forest Departments", "Central Water Commission", "State Tourism"]
  },
  LAKES: {
    id: "LAKES",
    slug: "lakes",
    label: "Lakes & Wetlands",
    pluralLabel: "Lakes, Wetlands & Tarns",
    iconName: "Waves",
    emoji: "🌊",
    badgeClass: "bg-sky-500/15 text-sky-300",
    borderClass: "border-sky-500/30",
    accentHex: "#0284c7",
    description: "Ramsar designated wetlands, high-altitude glacial tarns, expansive brackish lagoons, and holy sacred lakes.",
    heroTagline: "Pristine Waters & Sacred Lakes",
    subcategories: [
      "Ramsar Site",
      "High-Altitude Glacial Lake",
      "Freshwater Lake",
      "Coastal Brackish Lagoon",
      "Sacred Teertham Lake",
      "Bird Wetland"
    ],
    authoritativeSources: ["Wetlands of India Portal", "MoEFCC Ramsar Secretariat", "State Wetland Authorities"]
  },
  NATURE: {
    id: "NATURE",
    slug: "nature",
    label: "Nature & Ghats",
    pluralLabel: "Nature Landscapes & Ghats",
    iconName: "Compass",
    emoji: "🌿",
    badgeClass: "bg-emerald-500/15 text-emerald-300",
    borderClass: "border-emerald-500/30",
    accentHex: "#10b981",
    description: "Geological formations, marble canyons, living root bridges, sacred forest groves, and picturesque river valleys.",
    heroTagline: "The Living Geography of India",
    subcategories: [
      "River Valley",
      "Sacred Forest Grove",
      "Canyon & Gorge",
      "Living Root Bridge",
      "Geological Wonder",
      "Grassland & Meadow"
    ],
    authoritativeSources: ["Geological Survey of India", "State Forest Depts", "Botanical Survey of India"]
  },
  BEACHES: {
    id: "BEACHES",
    slug: "beaches",
    label: "Beaches & Coast",
    pluralLabel: "Beaches & Coastlines",
    iconName: "Sun",
    emoji: "🏖️",
    badgeClass: "bg-yellow-500/15 text-yellow-300",
    borderClass: "border-yellow-500/30",
    accentHex: "#eab308",
    description: "Blue Flag certified beaches, sacred coastal ghats, pristine coral atolls, and sunset ocean promenades.",
    heroTagline: "Where Sacred Land Meets Ocean",
    subcategories: [
      "Blue Flag Certified Beach",
      "Sacred Pilgrim Coast",
      "Pristine Crescent Beach",
      "Coral Island & Atoll",
      "Coastal Promenade",
      "Sea Cliff"
    ],
    authoritativeSources: ["Society of Integrated Coastal Management (SICOM)", "State Maritime Boards"]
  },
  WILDLIFE: {
    id: "WILDLIFE",
    slug: "wildlife",
    label: "Wildlife Reserves",
    pluralLabel: "National Parks & Sanctuaries",
    iconName: "Trees",
    emoji: "🐅",
    badgeClass: "bg-lime-500/15 text-lime-300",
    borderClass: "border-lime-500/30",
    accentHex: "#84cc16",
    description: "Project Tiger reserves, National Parks, wildlife sanctuaries, and protected biosphere habitats of native Indian fauna.",
    heroTagline: "Guardians of the Ancient Wild",
    subcategories: [
      "Tiger Reserve",
      "National Park",
      "Wildlife Sanctuary",
      "Biosphere Reserve",
      "Elephant Reserve",
      "Bird Sanctuary"
    ],
    authoritativeSources: ["National Tiger Conservation Authority (NTCA)", "Wildlife Institute of India (WII)", "MoEFCC"]
  },
  PARKS: {
    id: "PARKS",
    slug: "parks",
    label: "Gardens & Parks",
    pluralLabel: "Botanical Gardens & Parks",
    iconName: "Flower2",
    emoji: "🌳",
    badgeClass: "bg-green-500/15 text-green-300",
    borderClass: "border-green-500/30",
    accentHex: "#22c55e",
    description: "Historic Mughal charbaghs, botanical arboretums, rock gardens, and sprawling municipal biodiversity parks.",
    heroTagline: "Symphonies of Petals & Stone",
    subcategories: [
      "Botanical Garden",
      "Mughal Charbagh Garden",
      "Rock Garden",
      "Biodiversity Park",
      "Historic Urban Park"
    ],
    authoritativeSources: ["Botanical Survey of India", "Horticultural Departments", "ASI"]
  },
  FAMILY: {
    id: "FAMILY",
    slug: "family",
    label: "Family & Explorations",
    pluralLabel: "Family Discovery & Science",
    iconName: "Users",
    emoji: "🚂",
    badgeClass: "bg-indigo-500/15 text-indigo-300",
    borderClass: "border-indigo-500/30",
    accentHex: "#6366f1",
    description: "Heritage mountain railways, interactive science cities, planetariums, rail museums, and family cultural hubs.",
    heroTagline: "Journeys for Every Generation",
    subcategories: [
      "UNESCO Mountain Railway",
      "Science Centre & Planetarium",
      "Rail Museum",
      "Heritage Studio Complex",
      "Children's Exploration Park"
    ],
    authoritativeSources: ["National Council of Science Museums (NCSM)", "Indian Railways", "State Tourism"]
  },
  ADVENTURE: {
    id: "ADVENTURE",
    slug: "adventure",
    label: "Adventure & Treks",
    pluralLabel: "Adventure & Alpine Trails",
    iconName: "Footprints",
    emoji: "🧗",
    badgeClass: "bg-rose-500/15 text-rose-300",
    borderClass: "border-rose-500/30",
    accentHex: "#f43f5e",
    description: "High Himalayan pilgrim treks, white-water river rafting rapids, alpine trails, and cliff climbs.",
    heroTagline: "Journeys of Courage & Elevation",
    subcategories: [
      "High Altitude Pilgrim Trek",
      "White Water Rafting Route",
      "Himalayan Ridge Trail",
      "Caving Expedition",
      "Paragliding Site"
    ],
    authoritativeSources: ["Indian Mountaineering Foundation (IMF)", "State Adventure Tourism Wings"]
  },
  CULTURE: {
    id: "CULTURE",
    slug: "culture",
    label: "Culture & Living Arts",
    pluralLabel: "Cultural Centers & Museums",
    iconName: "Music",
    emoji: "🎭",
    badgeClass: "bg-purple-500/15 text-purple-300",
    borderClass: "border-purple-500/30",
    accentHex: "#a855f7",
    description: "Living craft villages, classical dance theaters, national museums, manuscript archives, and cultural centers.",
    heroTagline: "The Living Traditions of India",
    subcategories: [
      "National Museum",
      "Living Craft Village",
      "Classical Arts Theatre",
      "Monastic Cultural Center",
      "Memorial Palace Museum"
    ],
    authoritativeSources: ["Ministry of Culture", "Museums of India", "Sangeet Natak Akademi"]
  },
  FOOD: {
    id: "FOOD",
    slug: "food",
    label: "Heritage Food & Flavors",
    pluralLabel: "Heritage Food & Prasadam",
    iconName: "Utensils",
    emoji: "🍲",
    badgeClass: "bg-amber-600/15 text-amber-300",
    borderClass: "border-amber-600/30",
    accentHex: "#d97706",
    description: "Centuries-old temple prasadam lanes, historic kachori and chaat alleys, GI culinary traditions, and royal thalis.",
    heroTagline: "Sacred Flavors & Timeless Bazaars",
    subcategories: [
      "Centuries-Old Food Street",
      "Historic Prasadam Kitchen",
      "GI Food Heritage Sthal",
      "Heritage Eatery Corridor",
      "Traditional Spice & Sweets Lane"
    ],
    authoritativeSources: ["IP India GI Registry", "FSSAI Clean Street Food Hubs", "State Tourism"]
  },
  SHOPPING: {
    id: "SHOPPING",
    slug: "shopping",
    label: "Bazaars & Crafts",
    pluralLabel: "Historic Bazaars & Crafts",
    iconName: "ShoppingBag",
    emoji: "🛍️",
    badgeClass: "bg-pink-500/15 text-pink-300",
    borderClass: "border-pink-500/30",
    accentHex: "#ec4899",
    description: "GI-tagged handloom weaving streets, bronze casting guilds, historic spice lanes, and traditional craft bazaars.",
    heroTagline: "Centuries of Artisanal Mastery",
    subcategories: [
      "GI Handloom Weaving Cluster",
      "Historic Royal Bazaar",
      "Artisan Bronze & Stone Guild",
      "Traditional Toy Craft Village",
      "Historic Spice & Perfume Market"
    ],
    authoritativeSources: ["Office of Development Commissioner (Handicrafts)", "IP India GI Registry", "National Handloom Board"]
  }
};

/**
 * Normalizes input string to canonical MasterCategory
 */
export function normalizeCategory(input?: string | null): MasterCategory {
  if (!input) return "HERITAGE";
  const s = input.trim().toUpperCase();

  if (s in MASTER_CATEGORIES) return s as MasterCategory;

  // Map legacy / alternative strings
  if (s === "PILGRIMAGE" || s === "TEMPLES" || s === "TEMPLE") return "SACRED";
  if (s === "UNESCO" || s === "FORTS" || s === "PALACES" || s === "ARCHITECTURE") return "HERITAGE";
  if (s === "CAVE") return "CAVES";
  if (s === "HILL" || s === "MOUNTAINS" || s === "PASSES") return "HILLS";
  if (s === "WATERFALL") return "WATERFALLS";
  if (s === "LAKE" || s === "WETLANDS" || s === "RIVERS") return "LAKES";
  if (s === "LANDSCAPES") return "NATURE";
  if (s === "BEACH" || s === "ISLANDS" || s === "COAST") return "BEACHES";
  if (s === "SANCTUARIES" || s === "NATIONAL_PARK" || s === "TIGER_RESERVE") return "WILDLIFE";
  if (s === "GARDENS") return "PARKS";
  if (s === "ENTERTAINMENT" || s === "THEME_PARK" || s === "AMUSEMENT_PARK") return "FAMILY";
  if (s === "TREKS" || s === "TREK") return "ADVENTURE";
  if (s === "MUSEUMS" || s === "ARTS") return "CULTURE";
  if (s === "CUISINE" || s === "PRASADAM") return "FOOD";
  if (s === "BAZAARS" || s === "CRAFTS" || s === "HANDICRAFTS") return "SHOPPING";

  return "HERITAGE";
}

export function isValidCategory(input?: string | null): boolean {
  if (!input) return false;
  const s = input.trim().toUpperCase();
  return s in MASTER_CATEGORIES;
}

export function getAllCategories(): CategoryDefinition[] {
  return Object.values(MASTER_CATEGORIES);
}

export function getCategoryMeta(category: string): CategoryDefinition {
  const normalized = normalizeCategory(category);
  return MASTER_CATEGORIES[normalized];
}
