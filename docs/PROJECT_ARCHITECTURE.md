# 🏛️ DEVYATRA — PLATFORM TECHNICAL ARCHITECTURE SPECIFICATION

**Document Reference**: `docs/PROJECT_ARCHITECTURE.md`  
**System**: Devyatra (formerly Templeora) — Pan-India Temple Discovery, Directory, GIS Map & AI Pilgrimage Platform  
**Operating Principle**: $$\text{DATA ACCURACY} > \text{RECORD COUNT}$$  
**Author**: Principal Software Architect & Full-Stack Systems Team  
**Status**: Active Engineering Baseline  

---

## 1. System Overview & Architectural Topology

Devyatra is engineered as an enterprise-grade, geospatial-first, multilingual discovery and pilgrimage planning system. The architecture guarantees deterministic factual truth for every temple, darshan timing, booking channel, and geographic position.

### High-Level Topology Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           PILGRIM CLIENTS                                 │
│  [Desktop Browser]       [Mobile Responsive]        [Third-Party APIs]   │
└─────────────────────┬───────────────────────────────────────┬─────────────┘
                      │                                       │
                      ▼                                       ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                        EDGE ROUTING & CDN (VERCEL)                        │
│   - Global Edge Caching (stale-while-revalidate)                          │
│   - SSL Termination & Strict Transport Security (HSTS)                    │
│   - Header sanitization & CORS protection                                 │
└─────────────────────┬───────────────────────────────────────┬─────────────┘
                      │                                       │
                      ▼                                       ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                   APPLICATION RUNTIME (NEXT.JS 16)                        │
│                                                                           │
│  ┌──────────────────────────────┐       ┌──────────────────────────────┐  │
│  │   React 19 Server Components │       │   Public REST API (/api/v1/) │  │
│  │   - Dynamic SSR Pages        │       │   - /temples & /temples/:id  │  │
│  │   - Incremental Static Regen │       │   - /temples/nearby (Geo)    │  │
│  │   - Vernacular i18n (12 lang)│       │   - /hierarchy/:state        │  │
│  └──────────────┬───────────────┘       │   - /ai/temple-context/:id   │  │
│                 │                       │   - /submissions (Intake)    │  │
│                 ▼                       └──────────────┬───────────────┘  │
│  ┌─────────────────────────────────────────────────────▼───────────────┐  │
│  │                      CORE APPLICATION SERVICES                      │  │
│  │  ┌────────────────────────┐  ┌───────────────────────────────────┐  │  │
│  │  │ Deterministic AI Engine│  │ Probabilistic Deduplication Engine│  │  │
│  │  │ - Zod Validation       │  │ - Token Jaro-Winkler Similarity   │  │  │
│  │  │ - Strict Fact RAG      │  │ - Haversine Surface Proximity     │  │  │
│  │  │ - Refusal Contracts    │  │ - Administrative Boundary Lock    │  │  │
│  │  └────────────────────────┘  └───────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┬───────────────┘  │
└────────────────────────────────────────────────────────┼──────────────────┘
                                                         │
                                                         ▼
┌───────────────────────────────────────────────────────────────────────────┐
│               DATA PERSISTENCE & CACHING LAYER (NEON)                     │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ Prisma ORM 7 + @prisma/adapter-pg Connection Pooler                 │  │
│  │ - Parameterized SQL queries (Zero SQL Injection Risk)               │  │
│  │ - Multi-zone Read Replica Support & Automated Scale-to-Zero         │  │
│  └─────────────────────────────────┬───────────────────────────────────┘  │
│                                    ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ PostgreSQL Database (Neon Serverless AWS us-east-2)                 │  │
│  │ - 14 Normalized Relational Models                                  │  │
│  │ - Composite B-Tree & Spatial Coordinates Indexing                   │  │
│  │ - Cascade Deletion & Row-Level Audit Trail                          │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack Breakdown

| Architectural Tier | Selected Technology | Technical Rationale & Contract |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3.5 (App Router, Turbopack) | Server Components isolate database secrets from client; dynamic streaming rendering. |
| **UI Runtime** | React 19.2.8 | Concurrent rendering, native actions, zero client-side bundle bloat for static copy. |
| **Styling** | Tailwind CSS v4 | Zero-runtime CSS variables, high-contrast dark obsidian/ivory temple theme. |
| **Icons & Visuals** | Lucide React | Clean, scalable vector symbology with zero external font dependencies. |
| **Language** | TypeScript 5.0 (Strict Mode) | Full type safety across API boundaries, schema models, and GIS geometry. |
| **ORM** | Prisma 7.10.0 (`@prisma/client`) | Strictly typed schema, automated migrations, declarative relations. |
| **Driver Adapter** | `@prisma/adapter-pg` (node-pg 8.23) | Native WebSocket / TLS connection pooler optimized for serverless edge runtimes. |
| **Database** | Neon Serverless PostgreSQL | ACID compliance, point-in-time recovery, horizontal read scaling, US-East AWS. |
| **Validation** | Zod 4.6.5 | Runtime schema enforcement on API payloads, AI inputs, and external imports. |
| **Testing** | Node.js Test Runner (`node:test` + `tsx`) | Zero-dependency, sub-second native ESM test execution. |
| **Hosting & CDN** | Vercel Edge Platform | Global low-latency CDN, TLS termination, automated preview branches. |

---

## 3. The 6-Level Geographic Administrative Hierarchy

To eliminate geographic ambiguities, every temple is anchored to India's official administrative taxonomy:

$$\text{India (Country: IN)} \longrightarrow \text{State / UT} \longrightarrow \text{District} \longrightarrow \text{Administrative Unit (Taluk/Tehsil/Mandal)} \longrightarrow \text{Locality (Village/Town)} \longrightarrow \text{Temple}$$

### Hierarchy Level Specifications

```
Level 0: Country
  └── Code: "IN", ISO3: "IND", Name: "India"
       │
Level 1: State / Union Territory (36 + 1 Entities)
  └── Codes: AP, AR, AS, BR, CG, GA, GJ, HR, HP, JH, KA, KL, MP, MH, MN, ML, MZ, NL, OD, PB, RJ, SK, TN, TS, TR, UP, UK, WB, AN, CH, DN, DD, DL, JK, LA, LD, PY
  └── Attributes: adminUnitTerm ("Tehsil" | "Taluk" | "Mandal" | "Sub-Division")
       │
Level 2: District (~780 National Districts, 383 Currently Catalogued)
  └── Attributes: name, slug, officialCode (Census / LGD code), stateId
       │
Level 3: Administrative Unit (Sub-District)
  └── Attributes: name, slug, type ("Tehsil" | "Taluk" | "Mandal" | "Circle" | "Block"), districtId
       │
Level 4: Locality (Settlement Level)
  └── Attributes: name, type ("village" | "town" | "city" | "hamlet"), adminUnitId
       │
Level 5: Temple (Physical Shrine / Monument)
  └── Primary Key: id (e.g., "IN-AP-TPT-000001")
  └── Permanent Identifier: identifier (e.g., "TEMPLE-IND-AP-TIR-000001")
  └── Geodetic Coordinates: latitude, longitude (WGS84)
  └── Fallback Quarantine Flag: isCentroidFallback (Boolean)
```

---

## 4. Production API Architecture (`/api/v1/`)

All v1 endpoints return a standardized JSON envelope with deterministic status codes, pagination metadata, and ISO timestamps.

### Envelope Standard

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1648,
    "totalPages": 83
  },
  "timestamp": "2026-09-21T17:35:00.000Z"
}
```

### Core API Endpoints

1. **`GET /api/v1/temples`**
   - **Query Parameters**:
     - `state`: State code (`TN`, `AP`) or slug (`tamil-nadu`)
     - `district`: District slug or name
     - `deity`: Substring match on `mainDeity` or token search on `deities[]`
     - `tradition`: Match on `tradition[]` (e.g., `Shaivism`, `Vaishnavism`)
     - `verifiedOnly`: Boolean, filters to `VERIFIED_OFFICIAL` or `VERIFIED_TRUST`
     - `onlineBooking`: Boolean, filters to temples with verified online booking
     - `includeCentroid`: Boolean (default `false`), quarantees centroid fallback records
     - `page`, `limit`: Integer pagination controls
   - **Default Behavior**: Centroid fallback coordinates are **excluded by default** to ensure map and navigation queries only receive authentic geocoded points.

2. **`GET /api/v1/temples/:id`**
   - **Parameters**: `id` accepts UUID, permanent identifier (`TEMPLE-IND-...`), or slug.
   - **Hydration**: Returns full relational tree: Administrative parents, timings, bookings, festivals, darshan options, nearby places, vernacular translations, provenance sources, and historical audit trail.

3. **`GET /api/v1/temples/nearby`**
   - **Query Parameters**: `lat` (float), `lng` (float), `radiusKm` (1–100 km, default 25), `limit` (1–50, default 20).
   - **Spatial Algorithm**: Haversine distance formula with bounding-box pre-filtering. Automatically excludes `isCentroidFallback: true` records to prevent phantom proximity alerts.

4. **`GET /api/v1/hierarchy/states/:state/districts`**
   - **Parameters**: `state` code or slug.
   - **Aggregation**: Returns all catalogued districts with active temple counts, administrative unit counts, and official codes.

5. **`GET /api/v1/ai/temple-context/:id`**
   - **Grounding Endpoint**: Returns strictly verified facts formatted for Retrieval-Augmented Generation (RAG). Segregates confirmed attributes from unverified fields and provides explicit grounding instructions to prevent LLM hallucinations.

6. **`POST /api/v1/submissions`**
   - **Crowdsourced Intake**: Ingests community contributions. Enforces strict India coordinate bounding box ($6.0^\circ\text{N} \le \text{lat} \le 37.5^\circ\text{N}$, $68.0^\circ\text{E} \le \text{lng} \le 97.5^\circ\text{E}$). Executes real-time duplicate evaluation against nearby existing temples before admission to the review queue.

---

## 5. Geospatial Architecture & Coordinate Integrity

### Coordinate System
All spatial data is stored in decimal degrees using the **World Geodetic System 1984 (WGS 84 / EPSG:4326)** standard.

### Geographic Bounds of India
Every coordinate ingested or submitted must satisfy:
$$\text{Latitude} \in [6.0000^\circ\text{N}, 37.5000^\circ\text{N}]$$
$$\text{Longitude} \in [68.0000^\circ\text{E}, 97.5000^\circ\text{E}]$$

### Centroid Quarantine Strategy
Temples lacking surveyed rooftop or gate coordinates that were historically assigned the national centroid (`20.5937, 78.9629`) or state/district geometric centroids:
1. Are flagged with `isCentroidFallback = true`.
2. Carry `dataConfidence <= 75`.
3. Are omitted from `/api/v1/temples/nearby` spatial radius calculations.
4. Render on user maps with an explicit warning banner:  
   *“Approximate Administrative Location — Rooftop survey pending.”*

---

## 6. AI System Architecture & RAG Grounding Guardrails

The Devyatra AI companion and itinerary planner operate under strict deterministic grounding contracts:

```
                  USER PROMPT: "What are the morning darshan timings?"
                                         │
                                         ▼
                         RETRIEVAL: GET /api/v1/ai/temple-context/:id
                                         │
                                         ▼
                 ┌───────────────────────────────────────────────┐
                 │          STRICT GROUNDING EVALUATION          │
                 │                                               │
                 │ IF timing.verificationStatus == "VERIFIED":   │
                 │    Return verified slot schedule & source     │
                 │                                               │
                 │ ELSE:                                         │
                 │    Trigger REFUSAL CONTRACT                   │
                 │    "Darshan timings for this temple are not   │
                 │     officially verified. Please consult local │
                 │     devasthanam trust counter directly."      │
                 └───────────────────────┬───────────────────────┘
                                         │
                                         ▼
                              DETERMINISTIC ANSWER
```

### Fact vs. Traditional Belief Isolation
In accordance with archaeological and epigraphical integrity:
- **Documented History**: Reserved strictly for verifiable inscriptions, dynasty records, architectural style, and gazetteer entries.
- **Traditional Beliefs (Sthala Purana)**: Explicitly tagged and presented as traditional faith:  
  *“(Traditional devotional belief — not verified by archaeological documentation).”*

---

## 7. Security Architecture

1. **SQL Injection Defense**: 100% of database access is mediated through Prisma ORM using typed query builders and parameterized SQL bindings. Raw SQL queries are strictly prohibited.
2. **Cross-Site Scripting (XSS)**: React 19 auto-escapes all JSX outputs. User markdown is sanitized using deterministic token parsing.
3. **Cross-Origin Resource Sharing (CORS)**: Public REST `/api/v1/` routes expose controlled `Access-Control-Allow-Origin: *` headers for read operations. Mutation endpoints (`/api/v1/submissions`) enforce CSRF tokens and rate-limiting.
4. **Environment Isolation**: Production credentials (`DATABASE_URL`, `GOOGLE_MAPS_API_KEY`) are encrypted in Vercel Secret Management and prohibited from client-side bundles via `server-only` guards.
