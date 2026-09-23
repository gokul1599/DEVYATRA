# 🇮🇳 DEVYATRA / TEMPLEORA — V2 SYSTEM ARCHITECTURE & ECOSYSTEM SPECIFICATION

**System**: Devyatra (Templeora) V2 Core Architecture  
**Document Version**: 2.0.0-PROD  
**Target URL**: `https://templeora.vercel.app`  
**Database**: Neon Serverless PostgreSQL with pgvector  
**Runtime**: Next.js 16 (App Router & Edge Middleware)  
**Security Tier**: Enterprise High-Assurance Gov-Grade Pilgrimage Trust  

---

## 1. Executive Vision & Architectural Tenets

Devyatra V2 represents the national pilgrimage operating system for India. Moving beyond a conventional web directory, Devyatra V2 functions as an integrated, multi-tier platform that coordinates sacred geography, real-time temple operational intelligence (IST clocks, aarti timings, crowd states), verified statutory booking portals, offline PWA navigation for high-altitude/remote terrains, and grounded, hallucination-free generative AI pilgrimage planning.

### Architectural Core Tenets
1. **Absolute Truth & Provenance (No Fabrication)**:
   Every temple, coordinate, darshan schedule, and booking URL is anchored to statutory authorities (State Endowments, ASI, Shri Mata Vaishno Devi Shrine Board, TTD, Shri Kashi Vishwanath Special Area Development Board). Centroid fallbacks are strictly prohibited (`0 centroid coordinates`).
2. **Terrain-Aware Pilgrimage Physics**:
   Routing engines do not assume Euclidean or standard highway transit. Routes apply empirical transit dilation (1.85x for Himalayan / mountain ghats, 1.45x for Western/Eastern Ghats) and enforce sanctum break buffers (midday closures 12:00 PM – 04:00 PM, senior citizen pacing).
3. **Resilient Edge & Offline-First Pilgrim Safety**:
   Pilgrims in high-altitude Himalayas (Amarnath, Kedarnath, Badrinath) or remote dense forested regions (Dandakaranya, Srisailam) often lose 4G/5G signal. V2 packages itineraries, offline coordinates, and emergency district helpline contacts into lightweight, cryptographically sealed client-side storage.
4. **Vernacular Equity**:
   Spiritual devotion across India happens in regional languages. Devyatra V2 provides seamless 12-language accessibility (`en`, `hi`, `te`, `ta`, `kn`, `ml`, `mr`, `bn`, `gu`, `or`, `pa`, `as`).

---

## 2. High-Level System Architecture Diagram

```
                     ┌──────────────────────────────────────────────┐
                     │          Global Pilgrim Clients              │
                     │  (Mobile Web / PWA / Desktop / Offline App)   │
                     └──────────────────────┬───────────────────────┘
                                            │ HTTPS / WSS / ServiceWorker
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │          Vercel Edge Global Network          │
                     │  - Edge Middleware (Rate Limiter: 120 rpm)   │
                     │  - Security Headers (HSTS, CSP, Permissions) │
                     │  - Dynamic Edge Caching / Stale-While-Reval  │
                     └──────────────────────┬───────────────────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               ▼                            ▼                            ▼
 ┌───────────────────────────┐ ┌──────────────────────────┐ ┌───────────────────────────┐
 │ Next.js 16 App Router     │ │ Serverless API Handlers  │ │ Offline Service Worker    │
 │ - React 19 Server Comp    │ │ - /api/temples           │ │ - Cache-First Static Core │
 │ - ISR / SSG 117+ Routes   │ │ - /api/ai/plan (Guard)   │ │ - Offline Journey Caching │
 │ - Client Studio (GSAP/    │ │ - /api/ai/ask (Grounded) │ │ - Background Sync Queue   │
 │   Framer Motion/Tailwind) │ │ - /api/journeys (CRUD)   │ │ - GeoJSON Local Storage   │
 └─────────────┬─────────────┘ └────────────┬─────────────┘ └───────────────────────────┘
               │                            │
               └────────────────────────────┼────────────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │        Devyatra V2 Domain Core Layer         │
                     │  - AI Feasibility Guard (Pacing & Terrain)  │
                     │  - District Depth Scoring Engine (0-100)     │
                     │  - Real-Time IST Panchang & Darshan Engine   │
                     │  - Sacred Thematic Discovery (12 Jyotirlinga)│
                     └──────────────────────┬───────────────────────┘
                                            │ Prisma ORM / pgBouncer Pool
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │       Neon Serverless PostgreSQL (AWS)       │
                     │  - 2,084 Verified Mandir Records             │
                     │  - 714 LGD Administrative Districts          │
                     │  - Point-In-Time Recovery (PITR)             │
                     │  - Zero Centroid Precision Spatial Indices   │
                     └──────────────────────────────────────────────┘
```

---

## 3. Core Subsystems & Components

### 3.1 Data Pipeline & Statutory Ingestion Engine
- **Statutory Source Registries**:
  - Archaeological Survey of India (ASI) National Monument Records
  - HR&CE Departments (Tamil Nadu, Andhra Pradesh, Telangana Endowments)
  - Statutory Shrine Boards (SMVDSB, SASB, BKTC, TTD, Kashi Vishwanath)
  - Ministry of Culture & State Tourism Boards
- **Ingestion Invariants**:
  - `coordinatePrecision = SURVEYED` (No district/tehsil centroids allowed).
  - Multi-lingual naming matrix (`name_native`, `vernacular_language_code`).
  - Source verification attribution (`sourceAuthority`, `verificationTimestamp`).
  - Idempotent execution (Secondary runs guarantee `recordsAdded === 0`).

### 3.2 AI Pilgrimage & Feasibility Guard Engine (`src/lib/ai/guard.ts`)
- **Pacing Rule Engine**:
  - Maximum daily shrine ceiling: 4 temples/day for standard adults, 2 temples/day for elderly/children.
  - Maximum daily transit ceiling: 250 km/day (mountain/ghat terrains capped at 160 km/day).
  - Mandatory 2-hour midday darshan break (12:00 PM – 02:00 PM or 01:00 PM – 03:00 PM) aligning with temple sanctum closure schedules.
- **Prompt Injection & Hallucination Guard**:
  - Strict input sanitization blocking system prompt extraction, jailbreaks, and offensive injections.
  - Mandatory factual grounding: Rejects hallucinated ticket fees, unauthorized VIP passes, and unverified darshan queues.

### 3.3 Real-Time IST Operational Intelligence Engine
- **IST Temporal Clock**: Computes Indian Standard Time (UTC+05:30) irrespective of server runtime timezone.
- **6-State Operational State Matrix**:
  - `OPEN_NOW`: Sanctum accessible for general / special darshan.
  - `CLOSING_SOON`: Within 30 minutes of scheduled sanctum closure.
  - `AFTERNOON_BREAK`: Midday pat / kapat bandh period.
  - `AARTI_IN_PROGRESS`: Special ritual period (Mangala, Sandhya, Shayan aarti).
  - `CLOSED`: Overnight closure.
  - `SEASONAL`: High-altitude Himalayan winter closure (e.g., Kedarnath, Badrinath).
- **Mathematical Panchang**:
  - Hindu solar-lunar calendar calculation yielding Tithi, Paksha, Nakshatra, and Hindu Samvat for auspicious festival alignment.

### 3.4 Sacred Thematic Discovery & SEO Engine (`src/lib/discovery/collections.ts`)
- **Curated Canonical Circuits**:
  - 12 Jyotirlinga Mahatmyam
  - Pancha Bhoota Sthalams (Element shrines of Shiva)
  - Char Dham & Chota Char Dham
  - Great Living Chola Temples (UNESCO World Heritage)
  - 51 Shakti Peethas
- **Structured Data (Schema.org)**:
  - Deep `HinduTemple` JSON-LD schemas with geo-coordinates, deity details, historical eras, opening hours specification, and statutory `sameAs` authorities.
  - Dynamic XML sitemap indexing 100% of temple pages, state indexes, and thematic circuits.

### 3.5 Mobile PWA & Offline Journey Engine (`src/lib/offline/journey-cache.ts`)
- **Offline Package Specification**:
  - Complete JSON snapshot containing day-by-day itinerary stops, GPS coordinates, emergency contact numbers (Police 112, Ambulance 108, Shrine Control Rooms), and offline notices.
  - Client-side storage via IndexedDB / Web Storage API with zero remote dependency.

---

## 4. Security & Data Protection Architecture

1. **Edge Gateway Protection**:
   - Vercel Edge Middleware enforces 120 requests/minute rate limits keyed by client IP.
   - HTTP 429 response with `Retry-After` headers on violation.
2. **HTTP Hardening**:
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: SAMEORIGIN`
   - `Referrer-Policy: origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`
3. **Anti-Scam & Pilgrim Safety Registry**:
   - Curated white-list of official booking portals.
   - Prominent red alert banners warning yatris against touts, unaccredited donation links, and black-market VIP darshan tokens.

---

## 5. Technology Matrix Summary

| Layer | Component | Specification |
|:---|:---|:---|
| **Frontend Framework** | Next.js 16 (App Router) | Turbopack, React 19, Server Components |
| **Styling & Design** | Tailwind CSS v4 + Motion | Obsidian & Saffron sacred luxury tokens |
| **Animations** | GSAP 3 + Framer Motion | Smooth cinematic hero & interactive studio |
| **Database** | Neon Serverless PostgreSQL | PgBouncer connection pooling, auto-scaling |
| **ORM & Type Safety** | Prisma 6 + TypeScript 5 | Strict zero-warning compilation |
| **PWA & Offline** | Web App Manifest + Offline Engine | Standalone display mode, offline journey snapshots |
| **AI Subsystem** | Custom Grounded Guard Pipeline | Feasibility engine, pacing, transit dilation |
| **Deployment** | Vercel Global Edge Network | Global CDN, automatic edge SSL, Brotli/gzip |
