/**
 * Devyatra / Templeora Design System Tokens
 * Theme: Indian Heritage × Luxury Travel × Modern AI
 */

export const DESIGN_TOKENS = {
  colors: {
    // Surfaces
    background: "#0A0908", // Deep sacred obsidian
    surfaceDark: "#12100E", // Warm dark earth
    surfaceCard: "#181412", // Card elevation
    surfaceCardHover: "#201B18", // Interactive hover
    surfaceParchment: "#FAF7F2", // High-contrast editorial cream
    
    // Borders & Dividers
    borderSubtle: "rgba(200, 155, 60, 0.12)", // Golden hairline
    borderCard: "rgba(255, 255, 255, 0.08)",
    borderActive: "rgba(224, 109, 40, 0.35)", // Saffron focus ring
    
    // Heritage Accents
    saffron: "#E06D28", // Sacred Saffron (primary energetic accent)
    saffronLight: "#F38544",
    gold: "#C89B3C", // Temple Gopuram Gold (prestige & heritage)
    goldMuted: "#9A7A38",
    vermilion: "#B93826", // Kumkuma / sacred red
    emerald: "#2E6B56", // Sacred groves & bilateral trust
    
    // Typography
    textPrimary: "#FAF6F0", // Parchment white
    textSecondary: "#A89F91", // Warm stone gray
    textMuted: "#726A5E", // Secondary annotations
    textGold: "#DFBA68", // Highlighted spiritual terms
  },
  
  typography: {
    fontDisplay: "var(--font-display, serif)",
    fontBody: "var(--font-sans, system-ui, sans-serif)",
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  radii: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
  
  shadows: {
    glowGold: "0 0 25px rgba(200, 155, 60, 0.15)",
    glowSaffron: "0 0 30px rgba(224, 109, 40, 0.2)",
    cardElevated: "0 10px 30px -10px rgba(0, 0, 0, 0.6)",
  },
  
  animation: {
    easeEditorial: [0.25, 1, 0.5, 1], // Luxury cubic bezier
    durationFast: 0.2,
    durationNormal: 0.35,
    durationCinematic: 0.8,
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;
