# Devyatra / Templeora — Premium Design System Specification

## 1. Aesthetic Vision & Design Philosophy

### Indian Heritage × Luxury Travel × Modern AI

Devyatra is not an animated SaaS dashboard, a generic state tourism portal, or a cluttered devotional forum. It is an **ultra-premium, culturally reverent, modern pilgrimage atlas**.

* **No Synthetic Glamour**: No cartoonish glitter, no generic gold gradients everywhere, no fake star ratings on spiritual sites.
* **Factual Reverence**: Grounded in surveyed coordinates, ASI monument IDs, state gazetteers, and temple trusts.
* **Visual Restraint**: Deep obsidian and warm earthen backdrops allow sacred architecture, Indic typography, and rich cultural heritage to shine.

---

## 2. Color Palette & Surfaces

| Token | Hex Value | Semantic Purpose |
| :--- | :--- | :--- |
| `background` | `#0A0908` | Deep sacred obsidian base layer |
| `surfaceDark` | `#12100E` | Warm night earth layer for section backgrounds |
| `surfaceCard` | `#181412` | Default elevated card background |
| `surfaceCardHover` | `#201B18` | Interactive card hover elevation |
| `borderSubtle` | `rgba(200, 155, 60, 0.12)` | Subtle golden hairline border |
| `borderCard` | `rgba(255, 255, 255, 0.08)` | Structural card boundary |
| `borderActive` | `rgba(224, 109, 40, 0.35)` | Saffron active focus ring |
| `saffron` | `#E06D28` | Sacred Saffron (primary call to action & energy) |
| `gold` | `#C89B3C` | Gopuram Gold (heritage distinction & metadata highlights) |
| `vermilion` | `#B93826` | Kumkuma / sacred red (festivals & rituals) |
| `emerald` | `#2E6B56` | Sacred bilateral trust & verified official citations |
| `textPrimary` | `#FAF6F0` | High-legibility parchment white |
| `textSecondary` | `#A89F91` | Warm stone gray for descriptions and body copy |
| `textMuted` | `#726A5E` | Secondary annotations, timestamps, and captions |

---

## 3. Typography & Indic Script System

* **Display Serif**: `var(--font-display)` (Fraunces / Playfair Display) for temple titles, state headers, and editorial milestones.
* **Body Sans**: `var(--font-sans)` (Geist Sans / Inter) for metadata, data tables, and timings.
* **Indic Vernacular Scripts**: High-fidelity Unicode rendering preserving combining marks (`\p{M}`) for:
  - **Telugu**: శ్రీ వేంకటేశ్వర స్వామి వారి ఆలయం
  - **Tamil**: மீனாட்சி அம்மன் கோவில்
  - **Devanagari**: श्री काशी विश्वनाथ मंदिर
  - **Kannada**: ಶ್ರೀ ಚಾಮುಂಡೇಶ್ವರಿ ದೇವಾಲಯ
  - **Malayalam**: ഗുരുവായൂർ ശ്രീകൃഷ്ണ ക്ഷേത്രം
  - **Bengali**: দক্ষিণেশ্বর ভবতারিণী কালীমন্দির

---

## 4. Factual Temple Card Architecture

Temple cards communicate authenticity without commercial gimmicks:

```text
┌─────────────────────────────────────────────────────────────┐
│ [Visual Image / Sacred Canvas]       [Verified Trust Badge] │
│                                      [Save Bookmark Icon]   │
│                                                             │
│ Temple Name (English Romanized)                             │
│ Native Script Name (Telugu / Tamil / Devanagari / etc.)     │
│ Locality · District, State                                  │
│                                                             │
│ "Curated description summarizing historical significance"   │
│                                                             │
│ [Deity Chip] [Architecture Chip] [Tradition Chip]           │
│ ─────────────────────────────────────────────────────────── │
│ Heritage Sanctuary                            Explore Shrine →
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Animation & Motion Guidelines

### A. GSAP 3.15.0 (Cinematic Timelines)
* Used for scroll-linked image scaling and parallax depth on editorial hero sections.
* Leveraged via ScrollTrigger for coordinated section reveals without independent scroll listeners.

### B. Motion 13.4.0 (Component Micro-Interactions)
* Smooth card elevation (`scale: 1.01`, `y: -2px`) with gentle cubic-bezier curve `[0.25, 1, 0.5, 1]`.
* Animated tab switching and search pill suggestions.

### C. Three.js / Canvas (`sacred-ambient.tsx`)
* Native GPU-accelerated HTML5 Canvas rendering a slow-drifting sacred geometry star-ring with glowing golden embers.
* Lightweight (0 external runtime overhead, 60fps).
* Automatically reduced or paused when offscreen or in low-power modes.

### D. Spline React
* Restricted to lazy-loaded, isolated 3D viewports.
* Strict graceful fallback to static 2D imagery on mobile devices and low-tier graphics contexts.

---

## 6. Accessibility & Performance (WCAG 2.1 AA)

* **Reduced Motion Compliance**: All ambient canvases and Motion components observe `prefers-reduced-motion` and collapse to static visual states.
* **Keyboard Focus**: Visible saffron rings (`outline: 2px solid #E06D28`) on all interactive buttons, links, and filter pills.
* **Contrast Ratios**: Minimum 4.8:1 contrast for body copy (`#FAF6F0` and `#A89F91` over `#0A0908`).
* **Semantic Hierarchy**: Proper `h1` through `h4` document structure; ARIA labels on map controls and search modals.
