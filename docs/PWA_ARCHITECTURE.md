# 🇮🇳 DEVYATRA / TEMPLEORA — PWA ARCHITECTURE

**Date**: 2026-09-23  
**Standard**: Progressive Web App (PWA) Standards (W3C Web App Manifest)  

---

## 1. Web App Manifest Directives (`src/app/manifest.ts`)

- **Name**: `Devyatra — Discover India's Temples`
- **Short Name**: `Devyatra`
- **Display**: `standalone` (eliminates browser chrome and URL bar on iOS and Android)
- **Start URL**: `/`
- **Background & Theme Color**: `#0d0b09` (Obsidian palette)
- **Icon Specifications**: Vector SVG and maskable variants configured for home screen installation.

---

## 2. Mobile-First Ergonomic Layout

- **Bottom Navigation Rail (`MobileNav`)**: Fixed at bottom of mobile viewports with quick thumb-reach access across 6 core views:
  1. **Home**: Primary discovery and sacred atlas search.
  2. **Explore**: State-by-state geographic drilldown.
  3. **Map**: Geolocation nearby shrines.
  4. **AI Plan**: Multi-day AI journey builder.
  5. **Temples**: Complete alphabetic and deity catalog.
  6. **My Journey**: Personal saved circuits, holy alerts, and offline snapshots.
- **Touch Affordances**: Minimum 44×44px hitboxes for all interactive touch targets.
- **Offline Shell**: LocalStorage persistence of itinerary stops and temple contacts for disconnected pilgrimage.
