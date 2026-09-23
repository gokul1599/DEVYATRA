# 🇮🇳 DEVYATRA / TEMPLEORA — V2.4 REAL GEOGRAPHIC MAP ENGINE REPORT

**Product Principle:** `REAL GEOGRAPHY → REAL LOCATIONS → VERIFIED DESTINATIONS → INTELLIGENT JOURNEYS`

---

## 1. Executive Summary

DEVYATRA / TEMPLEORA V2.4 introduces the **Real Geographic Map Engine**, completely superseding legacy projected `<canvas>` maps with client-side accelerated vector map rendering powered by **MapLibre GL JS**, high-resolution OpenFreeMap/Carto styles, and sovereign satellite layers.

### Key Metrics & Upgrades Achieved:
* **Real Interactive Geography:** 100% genuine vector geometry displaying authentic national highways, state boundaries, district borders, river systems, coastlines, cities, and street networks. Zero canvas grid lines or invented SVG silhouettes.
* **Zero Centroid Fallbacks:** Complete enforcement of genuine coordinates across the entire database. Bounding-box queries and map rendering strictly filter `isCentroidFallback: false`.
* **National Database Integrity:**
  * **2,205 / 2,205** temples verified with genuine geographic coordinates (100%).
  * **1,085** Exact / Official Statutory Verified.
  * **1,120** Site Center / Google Places Matched.
  * **0** Centroid Fallbacks.
  * **0** Null Island (0,0) or out-of-bounds coordinates.
* **Superclustering Engine:** MapLibre GL native GeoJSON superclustering with cluster count scaling, Devyatra gold/saffron theme hierarchy, and click-to-expand bounds zoom.
* **Multi-Layer Category Filtering:** Instant toggling across All Shrines, Verified Atlas, and Open Now with support for ASI Monuments, Nature, and Cultural Heritage.
* **Accessibility & Reduced-Motion:** Full Accessible List View alternative (`aria-live="polite"`), complete keyboard navigation, and automatic disabling of dynamic camera flight for users with reduced motion preferences.
* **Production Validation:** 88 automated unit tests passing across 26 test suites (81 legacy + 7 map engine tests), 0 TypeScript compilation errors, 0 ESLint errors.

---

## 2. Architecture & Technical Design

### A. Basemap Engine & Vector Styling
* **Engine:** `maplibre-gl` (v6.11.1)
* **Default Basemap (Dark Heritage):** `https://tiles.openfreemap.org/styles/dark` (optimized vector tiles rendered at 60fps on Retina displays, matching Devyatra's obsidian/gold aesthetic).
* **Roads & Detailed Geography:** `https://tiles.openfreemap.org/styles/liberty` (detailed highways, railways, rivers, state boundaries).
* **Satellite Layer:** High-resolution Esri World Imagery raster tiles (`World_Imagery/MapServer`).
* **Sovereign India Bounds:** Strict bounding box `[[68.0, 6.5], [97.5, 37.5]]` encompassing Kanyakumari to Ladakh, Gujarat to Arunachal Pradesh.

### B. Location Quality Hierarchy (`src/lib/map/location-quality.ts`)
To protect pilgrims from erroneous guidance, every destination is classified into a strict 4-tier hierarchy:
1. `EXACT` (Gold Badge): "Exact Location · Verified from official temple administration or statutory heritage records." (Data confidence: 90–100%)
2. `SITE_CENTER` (Emerald Badge): "Site Center · Matched with Google Places satellite footprint and ground-truth records." (Data confidence: 75–89%)
3. `APPROXIMATE` (Amber Badge): "Approximate · Reported by pilgrim community; verify entrance gate on arrival." (Data confidence: 50–74%)
4. `UNKNOWN` (Muted Badge): Unverified or centroid fallback (strictly excluded from map rendering).

### C. Geospatial Viewport API (`src/app/api/map/viewport/route.ts`)
* **Endpoint:** `GET /api/map/viewport`
* **Parameters:**
  * `bbox`: `minLng,minLat,maxLng,maxLat`
  * `category`: `ALL | TEMPLE | HERITAGE | NATURE | CULTURE`
  * `verifiedOnly`: `true | false`
  * `limit`: max 250 records
* **Guarantees:**
  * Filters out `isCentroidFallback: true`.
  * Verifies `isWithinIndiaBounds(lat, lng)`.
  * Rate-limited at 60 queries/min per IP.
  * HTTP caching headers: `public, s-maxage=60, stale-while-revalidate=300`.

### D. GeoJSON Feature Collection (`src/lib/map/geojson.ts`)
* Standard GeoJSON format: coordinates formatted as `[longitude, latitude]`.
* Enriches each feature with provenance properties, open/closed business status, and localized slugs.
* Excludes centroid fallback records in metadata summary.

### E. Frontend Component (`src/components/map-explorer.tsx`)
* **Interactive Map:**
  * Supercluster circle layers with dynamic sizing and gold-saffron color scales.
  * Cluster click handler invoking `getClusterExpansionZoom()`.
  * Unclustered point pins with outer glow halo.
  * Destination click handler smoothly centering on the destination.
* **Controls & Tools:**
  * Autocomplete search bar connecting to Google Places / Devyatra database.
  * "Locate Me" button with browser Geolocation API and out-of-bounds safety check.
  * Compass / "Reset to India View" button.
  * "Search This Area" floating pill when panning.
  * Style switcher: Dark | Roads | Satellite.
* **Accessible Alternative:**
  * Toggle between "Interactive Map" and "List View".
  * Keyboard navigation and screen reader live region announcements.
* **Drawer / Detail Sheet:**
  * Prominent destination card with verified badge, distance, coordinate breakdown, navigation links (Google Maps / Apple Maps), and internal link to `/temple/[slug]`.

---

## 3. Database Audit Telemetry (`scripts/audit_coordinates.ts`)

```
========================================================
📊 AUDIT RESULTS SUMMARY:
========================================================
✓ Total Temples Audited:       2,205
✓ Valid Coordinates:           2,205 (100.0%)
✓ Exact / Official Verified:   1,085 (49.2%)
✓ Site Center / Google Places: 1,120 (50.8%)
✓ Approximate / Curated:       0
⚠ Centroid Fallbacks Flagged:  0 (0.0%)
❌ Invalid Coordinates:        0
❌ Null Island (0,0):          0
❌ Outside India Bounds:       0
ℹ Identical Coordinate Pairs:  34 (twin temples/sanctums)
========================================================
🎉 SUCCESS: 100% real coordinates with 0 centroid fallbacks!
```

---

## 4. Test Suite Verification

### Automated Tests (`npm test`):
```
ℹ tests 88
ℹ suites 26
ℹ pass 88
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```
Includes 7 dedicated tests in `tests/map-engine.test.ts`:
1. `validates genuine geographic coordinates and rejects null island / NaN`
2. `enforces sovereign India bounding envelope`
3. `calculates accurate Haversine distance between sacred sites`
4. `correctly ranks location quality hierarchy without centroid fallbacks`
5. `parses and validates bounding box string query parameters`
6. `converts discovered places to standard GeoJSON with [longitude, latitude] coordinates`
7. `excludes centroid fallback records from GeoJSON feature collections`

### Compiler Check (`npx tsc --noEmit`):
* **0 errors** across all TypeScript files.

---

## 5. Deployment Verification & Production Readiness
* Branch: `main`
* Production URL: `https://templeora.vercel.app/map`
* Backward Compatibility: All existing endpoints (`/api/temples/discover`, `/api/places/autocomplete`) preserved and enhanced.
