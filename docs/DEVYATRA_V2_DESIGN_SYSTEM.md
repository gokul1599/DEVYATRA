# 🇮🇳 DEVYATRA / TEMPLEORA — V2 DESIGN SYSTEM SPECIFICATION
## Theme: Sacred Indian Heritage × Ultra-Premium Luxury × Modern AI

**Design System Version**: 2.0.0  
**Target Resolution**: Universal Responsive (Mobile-First 360px → Ultra-Wide 4K)  
**WCAG Compliance**: Level AA (Contrast ≥ 4.5:1 for body, ≥ 3.0:1 for large display)  
**Reduced Motion Support**: Strict `@media (prefers-reduced-motion: reduce)` compliance  

---

## 1. Aesthetic Philosophy: Sacred Sanctuary

Devyatra V2 does not present temples as standard tourist commodities or mundane database rows. The visual identity embodies **Sacred Sanctuary**—a digital sanctum sanctorum designed with reverence, optical depth, calm atmospheric luminescence, and meticulous typography.

### Core Visual Principles
1. **Atmospheric Luminescence**: Warm candle/diya golden light cutting through deep obsidian stone.
2. **Tactile Sacred Materials**: Textured stone, gold leaf, crushed vermilion, raw sandalwood, and handmade parchment.
3. **Pacing of Devotion**: Animations are meditative and unhurried; transitions glide smoothly without erratic jumps.
4. **Cultural Authenticity**: Vernacular scripts are elevated as first-class design elements, not secondary translations.

---

## 2. Color Palette & Token Hierarchy

### 2.1 Surface & Obsidian Stones
| Token | Hex | Role / Application |
|:---|:---|:---|
| `--color-obsidian` | `#0D0B09` | Deepest sanctum darkness, page root background |
| `--color-obsidian-2` | `#14110D` | Primary card background, elevated surface |
| `--color-obsidian-3` | `#1C1812` | Interactive hover states, popover surfaces |
| `--color-obsidian-4` | `#262019` | Modal overlays, deep input backgrounds |
| `--color-line` | `#2A241C` | Subtle stone architectural dividers (1px hairlines) |

### 2.2 Sacred Accents & Illumination
| Token | Hex | Role / Application |
|:---|:---|:---|
| `--color-gold` | `#C8A24B` | Primary heritage gold; active states, primary badges |
| `--color-gold-bright` | `#E4BE72` | Glowing highlights, star ratings, sacred halos |
| `--color-gold-dim` | `#8A6F3A` | Tertiary borders, muted icons, timestamps |
| `--color-saffron` | `#D9822B` | Sacred Kesar / Saffron; CTA buttons, active tabs |
| `--color-terracotta` | `#B45A3D` | Earthy temple brick; regional circuit badges |
| `--color-maroon` | `#6E1F2B` | Deep Sindoor / Kumkuma; urgent sacred alerts |

### 2.3 Editorial Parchment & Light Mode
| Token | Hex | Role / Application |
|:---|:---|:---|
| `--color-parchment` | `#F6F1E7` | Light mode surface base; manuscript feel |
| `--color-parchment-2` | `#EFE7D8` | Light mode elevated card surface |
| `--color-ink` | `#1C1813` | Deep carbon text on light parchment |
| `--color-ink-dim` | `#5C5345` | Secondary text on light parchment |

---

## 3. Typography & Vernacular System

### 3.1 Font Stack Hierarchy
```css
/* Display & Sacred Headers */
font-family: var(--font-display), "Cinzel", "Fraunces", Georgia, serif;

/* Operational & System Text */
font-family: var(--font-sans), "Geist Sans", "Inter", -apple-system, sans-serif;

/* Monospace / Coordinates & Panchang Math */
font-family: var(--font-mono), "Geist Mono", "JetBrains Mono", monospace;
```

### 3.2 Indic Vernacular Typography
Devyatra renders regional temple names in their native orthography:
- **Devanagari** (`hi`, `mr`): *Noto Sans Devanagari*
- **Telugu** (`te`): *Noto Sans Telugu*
- **Tamil** (`ta`): *Noto Sans Tamil*
- **Kannada** (`kn`): *Noto Sans Kannada*
- **Malayalam** (`ml`): *Noto Sans Malayalam*
- **Bengali & Assamese** (`bn`, `as`): *Noto Sans Bengali*
- **Gujarati** (`gu`): *Noto Sans Gujarati*
- **Odia** (`or`): *Noto Sans Odia*
- **Gurmukhi** (`pa`): *Noto Sans Gurmukhi*

---

## 4. Motion & Animation Principles

Animations evoke the gentle flicker of oil lamps, temple bell resonance, and the calm rhythm of pradakshina (circumambulation).

### 4.1 Timing & Curves
- **Micro-Interactions** (Button hover, tab switch): `duration: 0.2s`, `ease: [0.25, 1, 0.5, 1]` (Editorial ease-out).
- **Surface Reveal** (Card entrances, modal popups): `duration: 0.4s`, `ease: [0.16, 1, 0.3, 1]`.
- **Cinematic Ambient Motion** (Hero lighting, sacred particles): `duration: 2.0s – 5.0s`, continuous smooth sine wave oscillation.

### 4.2 Reduced-Motion Strict Enforcement
All components must check for reduced-motion preferences:
```tsx
const prefersReduced = useReducedMotion();
const animateProps = prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 };
```

---

## 5. Signature Component Library

### 5.1 SacredAmbient (`src/components/sacred-ambient.tsx`)
- Provides subtle, low-CPU canvas particle effects resembling golden diya embers floating in dark stone sanctuaries.
- Automatically disables canvas loops when window loses focus or when `prefers-reduced-motion` is active.

### 5.2 TempleCard (`src/components/temple-card.tsx`)
- Card displaying high-resolution shrine imagery with subtle zoom on hover (`scale-105 transition-transform duration-700`).
- Features: Real-time IST darshan status badge (`OPEN_NOW` green pulse, `AFTERNOON_BREAK` amber, `CLOSED` stone), native script deity name, verified statutory trust badge, and distance telemetry.

### 5.3 PlanStudio (`src/components/plan-studio.tsx`)
- Multi-step luxury itinerary studio allowing pilgrims to select trip duration (1-Day, 2-Day, 3-Day), mobility constraints (standard, elderly, children), and sacred tradition focus.
- Visual timeline with connection paths, driving durations, and terrain-aware dilation warnings.

### 5.4 LivePanchangWidget (`src/components/panchang-widget.tsx`)
- Real-time astronomical widget displaying Hindu Samvat, Tithi, Paksha, Nakshatra, and auspicious muhurtas computed directly in IST.

### 5.5 MobileNavigationRail (`src/components/header.tsx`)
- Fixed bottom navigation bar on mobile viewports (`< 768px`) with 48px minimum touch target size.
- 6 ergonomic destinations: Home, Explore, Map, Plan, Temples, Saved Journeys.

---

## 6. Accessibility & Inclusivity (WCAG 2.1 AA)

1. **Touch Targets**: All interactive elements (buttons, sliders, toggles, accordion headers) measure at least `48px × 48px` clickable area.
2. **Keyboard Focus Rings**: Visible high-contrast gold outline (`outline: 2px solid #C8A24B; outline-offset: 2px`) on all `:focus-visible` elements.
3. **Screen Reader Attributes**: All icons accompanied by `aria-label` or `aria-hidden="true"`; map controls explicitly tagged with descriptive action labels.
4. **Color Independence**: Statuses never rely solely on color; every badge pairs color with an explicit textual label and icon (e.g., green dot + "Open Now" + Clock icon).
