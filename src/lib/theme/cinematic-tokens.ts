/**
 * DEVYATRA / TEMPLEORA — V2.5 SACRED CINEMATIC INDIA
 * Global Design Tokens & Section Color Environments
 * 
 * Provides centralized tokens for emotional color atmospheres:
 * - HERO: Sacred Gold / Night (Obsidian, Moon Ivory, Antique Gold, Saffron Glow)
 * - EXPLORE: Earth / Sandstone (Sandstone, Warm Ivory, Muted Gold, Terracotta)
 * - ARCHITECTURE: Maroon / Stone (Deep Maroon, Carved Basalt, Antique Gold)
 * - FAMOUS: Editorial Dark / Gold (Deep Obsidian, Bright Gold, Warm Ivory)
 * - MAP: Midnight Indigo / Jade (Midnight Indigo, Muted Jade, Gold Accents)
 * - FESTIVALS: Saffron / Coral / Night (Saffron, Coral Amber, Midnight Background)
 * - JOURNEY: Forest / Amber (Forest Green, Amber, Earth Brown, Parchment)
 * - TRUST: Emerald / Ivory (Deep Emerald, Forest Muted, Crisp Ivory)
 */

export type SectionTheme =
  | "hero"
  | "explore"
  | "architecture"
  | "famous"
  | "map"
  | "festivals"
  | "journey"
  | "trust";

export interface SectionThemeConfig {
  name: string;
  mood: string;
  bgClass: string;
  borderClass: string;
  accentTextClass: string;
  glowClass: string;
  gradientOverlay: string;
}

export const SECTION_THEMES: Record<SectionTheme, SectionThemeConfig> = {
  hero: {
    name: "Sacred Gold & Night",
    mood: "Arrival / Wonder / Timelessness",
    bgClass: "bg-obsidian",
    borderClass: "border-gold/20",
    accentTextClass: "text-gold-bright",
    glowClass: "shadow-[0_0_50px_-15px_rgba(200,162,75,0.25)]",
    gradientOverlay: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(200,162,75,0.15), transparent 70%)",
  },
  explore: {
    name: "Earth & Sandstone",
    mood: "Geography / Discovery / Vast Landscape",
    bgClass: "bg-[#110e0c]",
    borderClass: "border-[#8c6b4a]/30",
    accentTextClass: "text-[#e8d5be]",
    glowClass: "shadow-[0_0_50px_-15px_rgba(194,163,130,0.18)]",
    gradientOverlay: "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(194,163,130,0.12), transparent 75%)",
  },
  architecture: {
    name: "Maroon & Sacred Stone",
    mood: "Sacred Form / Dynastic Patronage / Carved Basalt",
    bgClass: "bg-[#130b0d]",
    borderClass: "border-[#6e1f2b]/40",
    accentTextClass: "text-[#f3a8b4]",
    glowClass: "shadow-[0_0_50px_-15px_rgba(110,31,43,0.25)]",
    gradientOverlay: "radial-gradient(ellipse 75% 50% at 50% 0%, rgba(110,31,43,0.18), transparent 70%)",
  },
  famous: {
    name: "Editorial Dark & Gold",
    mood: "Landmark Greatness / Historic Wonder",
    bgClass: "bg-obsidian-2",
    borderClass: "border-gold/25",
    accentTextClass: "text-gold-bright",
    glowClass: "shadow-[0_0_50px_-15px_rgba(228,190,114,0.2)]",
    gradientOverlay: "radial-gradient(ellipse 70% 40% at 50% 10%, rgba(200,162,75,0.10), transparent 70%)",
  },
  map: {
    name: "Midnight Indigo & Jade",
    mood: "Geographic Intelligence / Living Coordinates",
    bgClass: "bg-[#0b101d]",
    borderClass: "border-[#1e293b]/60",
    accentTextClass: "text-[#38bdf8]",
    glowClass: "shadow-[0_0_50px_-15px_rgba(56,189,248,0.16)]",
    gradientOverlay: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(15,23,42,0.4), transparent 80%)",
  },
  festivals: {
    name: "Saffron & Celestial Flame",
    mood: "Celebration / Movement / Lunar Radiance",
    bgClass: "bg-[#140d08]",
    borderClass: "border-[#d9822b]/30",
    accentTextClass: "text-[#fba858]",
    glowClass: "shadow-[0_0_50px_-15px_rgba(217,130,43,0.22)]",
    gradientOverlay: "radial-gradient(ellipse 75% 50% at 50% 0%, rgba(217,130,43,0.14), transparent 70%)",
  },
  journey: {
    name: "Forest & Amber Pilgrim Trail",
    mood: "Movement / Wayfaring / Quiet Roads",
    bgClass: "bg-[#0a130f]",
    borderClass: "border-[#1c3829]/50",
    accentTextClass: "text-[#6ee7b7]",
    glowClass: "shadow-[0_0_50px_-15px_rgba(28,56,41,0.25)]",
    gradientOverlay: "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(28,56,41,0.2), transparent 75%)",
  },
  trust: {
    name: "Emerald & Immutable Truth",
    mood: "Integrity / Ground Truth / Assurance",
    bgClass: "bg-[#09120e]",
    borderClass: "border-emerald-900/40",
    accentTextClass: "text-emerald-300",
    glowClass: "shadow-[0_0_50px_-15px_rgba(4,120,87,0.18)]",
    gradientOverlay: "radial-gradient(ellipse 65% 40% at 50% 0%, rgba(4,120,87,0.12), transparent 70%)",
  },
};

/**
 * Returns class names for styling components inside a thematic section
 */
export function getSectionTheme(theme: SectionTheme): SectionThemeConfig {
  return SECTION_THEMES[theme] ?? SECTION_THEMES.hero;
}
