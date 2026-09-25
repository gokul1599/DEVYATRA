export interface CategoryMeta {
  id: string;
  label: string;
  iconName: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const MAP_CATEGORIES: CategoryMeta[] = [
  { id: "all", label: "All Destinations", iconName: "Compass", color: "#F59E0B", bgClass: "bg-gold/15", textClass: "text-gold-bright", borderClass: "border-gold/40" },
  { id: "sacred", label: "Sacred Shrines", iconName: "Sparkles", color: "#F59E0B", bgClass: "bg-amber-500/15", textClass: "text-amber-300", borderClass: "border-amber-500/40" },
  { id: "heritage", label: "Heritage & ASI", iconName: "Landmark", color: "#D97706", bgClass: "bg-amber-700/15", textClass: "text-amber-400", borderClass: "border-amber-600/40" },
  { id: "caves", label: "Ancient Caves", iconName: "Mountain", color: "#854D0E", bgClass: "bg-amber-800/15", textClass: "text-amber-400", borderClass: "border-amber-700/40" },
  { id: "hills", label: "Hills & Mountains", iconName: "MountainSnow", color: "#0D9488", bgClass: "bg-teal-600/15", textClass: "text-teal-300", borderClass: "border-teal-500/40" },
  { id: "waterfalls", label: "Waterfalls", iconName: "Droplets", color: "#06B6D4", bgClass: "bg-cyan-500/15", textClass: "text-cyan-300", borderClass: "border-cyan-500/40" },
  { id: "lakes", label: "Lakes & Wetlands", iconName: "Waves", color: "#0369A1", bgClass: "bg-sky-600/15", textClass: "text-sky-300", borderClass: "border-sky-500/40" },
  { id: "nature", label: "Nature & Ghats", iconName: "Trees", color: "#10B981", bgClass: "bg-emerald-500/15", textClass: "text-emerald-300", borderClass: "border-emerald-500/40" },
  { id: "beaches", label: "Beaches & Coast", iconName: "Waves", color: "#0284C7", bgClass: "bg-sky-500/15", textClass: "text-sky-300", borderClass: "border-sky-500/40" },
  { id: "wildlife", label: "Wildlife & Reserves", iconName: "PawPrint", color: "#16A34A", bgClass: "bg-green-600/15", textClass: "text-green-300", borderClass: "border-green-600/40" },
  { id: "parks", label: "Gardens & Parks", iconName: "Trees", color: "#059669", bgClass: "bg-emerald-600/15", textClass: "text-emerald-300", borderClass: "border-emerald-600/40" },
  { id: "family", label: "Family & Fun", iconName: "Smile", color: "#6366F1", bgClass: "bg-indigo-500/15", textClass: "text-indigo-300", borderClass: "border-indigo-500/40" },
  { id: "adventure", label: "Adventure & Treks", iconName: "Compass", color: "#EA580C", bgClass: "bg-orange-500/15", textClass: "text-orange-300", borderClass: "border-orange-500/40" },
  { id: "culture", label: "Culture & Arts", iconName: "Palette", color: "#9333EA", bgClass: "bg-purple-500/15", textClass: "text-purple-300", borderClass: "border-purple-500/40" },
  { id: "food", label: "Heritage Food", iconName: "UtensilsCrossed", color: "#E11D48", bgClass: "bg-rose-500/15", textClass: "text-rose-300", borderClass: "border-rose-500/40" },
  { id: "shopping", label: "Bazaars & Crafts", iconName: "ShoppingBag", color: "#DB2777", bgClass: "bg-pink-500/15", textClass: "text-pink-300", borderClass: "border-pink-500/40" },
  { id: "verified", label: "Verified Only", iconName: "ShieldCheck", color: "#10B981", bgClass: "bg-emerald-500/15", textClass: "text-emerald-300", borderClass: "border-emerald-500/40" },
];

export function getCategoryVisual(category?: string): CategoryMeta {
  const cat = (category || "").toUpperCase();
  if (cat === "HERITAGE") return MAP_CATEGORIES.find((c) => c.id === "heritage") || MAP_CATEGORIES[2];
  if (cat === "CAVES" || cat === "CAVE") return MAP_CATEGORIES.find((c) => c.id === "caves") || MAP_CATEGORIES[3];
  if (cat === "HILLS" || cat === "HILL" || cat === "MOUNTAIN" || cat === "MOUNTAINS") return MAP_CATEGORIES.find((c) => c.id === "hills") || MAP_CATEGORIES[4];
  if (cat === "WATERFALLS" || cat === "WATERFALL" || cat === "CASCADE") return MAP_CATEGORIES.find((c) => c.id === "waterfalls") || MAP_CATEGORIES[5];
  if (cat === "LAKES" || cat === "LAKE" || cat === "WETLAND" || cat === "WATER_BODY") return MAP_CATEGORIES.find((c) => c.id === "lakes") || MAP_CATEGORIES[6];
  if (cat === "NATURE") return MAP_CATEGORIES.find((c) => c.id === "nature") || MAP_CATEGORIES[7];
  if (cat === "BEACHES" || cat === "BEACH" || cat === "COAST") return MAP_CATEGORIES.find((c) => c.id === "beaches") || MAP_CATEGORIES[8];
  if (cat === "WILDLIFE") return MAP_CATEGORIES.find((c) => c.id === "wildlife") || MAP_CATEGORIES[9];
  if (cat === "PARKS" || cat === "PARK" || cat === "GARDEN" || cat === "GARDENS") return MAP_CATEGORIES.find((c) => c.id === "parks") || MAP_CATEGORIES[10];
  if (cat === "FAMILY" || cat === "THEME_PARK" || cat === "SCIENCE") return MAP_CATEGORIES.find((c) => c.id === "family") || MAP_CATEGORIES[11];
  if (cat === "ADVENTURE") return MAP_CATEGORIES.find((c) => c.id === "adventure") || MAP_CATEGORIES[12];
  if (cat === "CULTURE" || cat === "MUSEUM") return MAP_CATEGORIES.find((c) => c.id === "culture") || MAP_CATEGORIES[13];
  if (cat === "FOOD") return MAP_CATEGORIES.find((c) => c.id === "food") || MAP_CATEGORIES[14];
  if (cat === "SHOPPING") return MAP_CATEGORIES.find((c) => c.id === "shopping") || MAP_CATEGORIES[15];
  return MAP_CATEGORIES.find((c) => c.id === "sacred") || MAP_CATEGORIES[1]; // default sacred
}
