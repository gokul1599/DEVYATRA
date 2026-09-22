# 🗺️ DEVYATRA — TECHNICAL IMPLEMENTATION & NATIONWIDE EXPANSION ROADMAP

**Document Reference**: `docs/IMPLEMENTATION_ROADMAP.md`  
**Standard**: Milestone-Driven, Test-Verified, Zero-Fabrication Ingestion  
**Author**: Principal Software Architect & Full-Stack Systems Team  
**Status**: Active Engineering Roadmap  

---

## 1. Roadmap Architecture Overview

The Devyatra platform roadmap is organized into six disciplined phases to ensure structural integrity, verified data accuracy, and horizontal scalability.

```
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Architectural Baseline & Forensic Audit            [COMPLETED]│
│ - Zero-redundancy single repo at C:\gokul coding\devyatra              │
│ - Forensic audit & machine-readable reports in data/audit/             │
│ - P0 sanitization: 1,323 fake Place IDs nulled, 7 centroids quarantined│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: Relational Schema Modernization & Ingestion        [COMPLETED]│
│ - Prisma 7 schema with Multilingual, Provenance & Audit models         │
│ - Synchronized with Neon PostgreSQL Serverless                         │
│ - Ingested 1,655 temples, 37 states, 917 districts, 6,620 sources      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: Production REST API Suite & AI Grounding           [COMPLETED]│
│ - 6 production endpoints under /api/v1/                                │
│ - Haversine proximity search excluding centroid fallbacks              │
│ - AI Grounding context endpoint & deterministic refusal contracts     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: Probabilistic Deduplication & Background Workers   [COMPLETED]│
│ - Token-aware Jaro-Winkler + Haversine deduplication engine            │
│ - 18 candidate duplicate pairs detected in data/audit/                 │
│ - Automated URL health check & duplicate scanner workers               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 5: Production Deployment & Acceptance Verification    [COMPLETED]│
│ - Live on Vercel at https://templeora.vercel.app                       │
│ - 81/81 unit tests passing · 0 TypeScript errors · 0 ESLint warnings   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 6: Nationwide District Coverage & Curation Operations   [ACTIVE] │
│ - Official Google Places API verification worker                       │
│ - Field survey geocoding of 7 quarantined centroids                    │
│ - Administrative expansion across 780 national districts               │
│ - Crowdsourced user submission curation UI                             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase-by-Phase Execution Details

### Phase 1: Forensic Audit & Workspace Consolidation (COMPLETED)
- Consolidated all code and data into `C:\gokul coding\devyatra`.
- Removed legacy unlinked directories.
- Identified and generated machine-readable audit reports:
  - `p0_centroid_fallbacks.json`: 7 records quarantined.
  - `p0_synthetic_place_ids.json`: 1,323 fake Place IDs nulled.
  - `p0_boilerplate_festivals.json`: 1,608 boilerplate entries flagged.
  - `p0_bare_monument_names.json`: 4 ASI monuments titled `"Temple"` disambiguated.
  - `state_district_coverage_gap.json`: Comprehensive state gap matrix.

### Phase 2: Relational Schema & Neon PostgreSQL Ingestion (COMPLETED)
- Upgraded `prisma/schema.prisma` with:
  - `TempleTranslation`: Vernacular script coverage across 12 Indian languages.
  - `TempleSource`: Multi-source institutional provenance citations.
  - `AuditResult`: Row-level persistent audit trail.
  - `UserSubmission`: Crowdsourced review queue.
- Executed concurrent batch ingestion:
  - **1,655 Temples** ingested into Neon PostgreSQL.
  - **37 States/UTs** (including Telangana TS/TG canonical mapping).
  - **917 Districts** catalogued.
  - **1,655 Multilingual Translations** seeded.
  - **6,620 Provenance Sources** linked.
  - **6,604 Audit Log Entries** persisted.

### Phase 3: Production REST `/api/v1/` Suite (COMPLETED)
- Built high-performance production endpoints:
  - `GET /api/v1/temples`: Filtered and paginated search (excluding centroid fallbacks by default).
  - `GET /api/v1/temples/:id`: Fully hydrated temple record with full relational tree.
  - `GET /api/v1/temples/nearby`: Spatial Haversine search (excluding centroid fallbacks).
  - `GET /api/v1/hierarchy/states/:state/districts`: Administrative catalog with temple metrics.
  - `GET /api/v1/ai/temple-context/:id`: Strict RAG grounding context endpoint.
  - `POST /api/v1/submissions`: Crowdsourced intake enforcing India coordinate bounds and running real-time duplicate checks.
- Enforced strict refusal contracts in AI companion (`src/lib/ai/engine.ts`).

### Phase 4: Probabilistic Deduplication & Automated Workers (COMPLETED)
- Implemented `src/lib/importer/deduplicate.ts` with Jaro-Winkler and Haversine algorithms.
- Created `scripts/workers/check-urls.ts` for periodic HTTP 200 health checks.
- Created `scripts/workers/scan-duplicates.ts`, generating `data/audit/detected_duplicates.json` (18 candidate pairs flagged).
- Covered with unit tests in `tests/deduplicate.test.ts`.

### Phase 5: Quality Assurance & Live Vercel Deployment (COMPLETED)
- 81/81 automated tests passing (`node scripts/test.mjs`).
- Clean TypeScript type-checking (`npx tsc --noEmit` exited code 0).
- Zero ESLint warnings (`npx eslint . --max-warnings=0` exited code 0).
- All 119 Next.js pages and API routes compiled and optimized (`npm run build` exited code 0).
- Live deployment aliased to **[https://templeora.vercel.app](https://templeora.vercel.app)**.

---

## 3. Phase 6: Recommended Next Implementation Tasks

### 3.1 Real Google Places Lookup Worker
- Implement a rate-limited background worker (`scripts/workers/lookup-google-places.ts`) using the official `GOOGLE_MAPS_API_KEY`.
- Process the 1,323 temples with `googlePlaceVerificationStatus: "PENDING_LOOKUP"` using Google Places Text Search (New) with exact name, district, and coordinates.
- Only write authentic Google Place IDs (`ChIJ...`) returned directly by Google's API. Never invent or fake IDs.

### 3.2 Field Geocoding of 7 Centroid Fallback Temples
- Research exact physical coordinates for the 7 quarantined centroid records:
  - `IN-AP-AND-000103`: Ashta Someswaras
  - `IN-RJ-TON-000519`: Yupa Pillars in Bichpuria Temple (ASI N-RJ-111)
  - `IN-RJ-DHO-000521`: Jogni-Jogna Temple (ASI N-RJ-152)
  - `IN-UP-BUL-000503`: Masonry tank and ancient temple, Dankaur (ASI N-UP-A126)
  - `IN-UP-BUL-000504`: Ahirpura mound, Indor (ASI N-UP-A127)
  - `IN-UP-BUL-000505`: Kundanpura mound, Indor (ASI N-UP-A128)
  - `IN-WB-PUR-000520`: Group of 12 temples, Kalna (ASI N-WB-54)
- Once exact surveyed coordinates are verified, clear `isCentroidFallback = false` and update coordinates in the database.

### 3.3 Geographic Coverage Expansion
- Ingest India's Local Government Directory (LGD) authoritative dataset to expand catalogued districts from 383 to all ~780 official districts across India.
- Ingest authentic State Endowments Board gazetteers for under-represented states (e.g. Bihar, Odisha, Madhya Pradesh, Kerala, Assam).

### 3.4 Admin Curation Portal Enhancement
- Build interactive administrative review UI at `/admin/submissions` allowing admins to approve, reject, or request changes on `UserSubmission` records with one click.
- Build interactive duplicate merger tool at `/admin/duplicates` allowing admins to review the 18 flagged candidate pairs and merge or mark distinct.
