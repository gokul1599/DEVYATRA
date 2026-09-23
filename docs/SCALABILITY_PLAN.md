# 🇮🇳 DEVYATRA / TEMPLEORA — V2 SCALABILITY & HIGH-LOAD ENGINEERING PLAN

**Target Scale**: 10,000,000+ Annual Pilgrims & Festival Spikes (Mahashivratri, Navratri, Diwali, Kumbh Mela)  
**System Target**: `https://templeora.vercel.app`  
**Database**: Neon Serverless PostgreSQL with PgBouncer  
**Edge CDN**: Vercel Global Edge Network (South Asia Mumbai/Chennai Edge POPs)  

---

## 1. Scale Characteristics & Festival Traffic Profiles

Spiritual pilgrimage platforms experience extreme traffic non-linearity. While daily baseline traffic is steady (~25,000 daily active yatris), major sacred occasions create sudden 20x to 50x demand surges:

| Sacred Festival / Event | Traffic Surge Factor | Concurrent Active Yatris | Critical Subsystems Under Stress |
|:---|:---:|:---:|:---|
| **Mahashivratri** | 35x | ~450,000 concurrent | 12 Jyotirlinga pages, live aarti streams, darshan queue status |
| **Chaitra / Sharad Navratri** | 20x | ~300,000 concurrent | 51 Shakti Peethas, live panchang muhurtas |
| **Kumbh Mela / Magh Mela** | 50x | ~750,000 concurrent | Offline caching, sacred ghat coordinates, emergency helpline directory |
| **Janmashtami / Vaikuntha Ekadashi** | 25x | ~350,000 concurrent | Vaishnava Divya Desams, Tirupati live slot booking links |
| **Char Dham Yatra Opening (Akshaya Tritiya)**| 30x | ~400,000 concurrent | AI terrain routing, weather & road pass status, high-altitude buffers |

---

## 2. Multi-Tier Scalability Architecture

```
                                  [ 10M+ Pilgrims / Festival Spikes ]
                                                 │
                                                 ▼
                             ┌───────────────────────────────────────┐
                             │    Vercel Global Edge Network (CDN)   │
                             │  - Mumbai (bom1), Chennai, Delhi POPs │
                             │  - Edge Middleware IP Rate Limiting   │
                             │  - Static Asset Edge Caching (Cache-Control)
                             └───────────────────┬───────────────────┘
                                                 │
                                ┌────────────────┴────────────────┐
                                ▼                                 ▼
                     [ 95% Cache Hit: ISR/SSG ]        [ 5% Cache Miss / Dynamic API ]
                     - Static Temple Pages (2,084)     - /api/ai/plan
                     - State / District Indexes        - /api/ai/ask
                     - Sacred Thematic Collections     - /api/journeys CRUD
                                                                  │
                                                                  ▼
                                                      ┌───────────────────────┐
                                                      │ Vercel Serverless     │
                                                      │ Execution Environment │
                                                      │ (Concurrency: 1,000+) │
                                                      └───────────┬───────────┘
                                                                  │
                                                                  ▼
                                                      ┌───────────────────────┐
                                                      │ Neon PgBouncer Pool   │
                                                      │ Max 10,000 connections│
                                                      └───────────┬───────────┘
                                                                  │
                                                                  ▼
                                                      ┌───────────────────────┐
                                                      │ Neon Serverless PG    │
                                                      │ Auto-scale 0.25→8 CU  │
                                                      │ (Storage auto-expand) │
                                                      └───────────────────────┘
```

---

## 3. Database Scaling & Connection Optimization

### 3.1 Serverless Auto-Scaling Compute (Neon)
- **Dynamic Compute Scaling**: Configured with automatic scaling from baseline `0.25 CU` (Compute Units) up to `8.0 CU` during high-concurrency festival spikes.
- **Scale-Up Threshold**: Scales in < 3 seconds when CPU utilization exceeds 75% or active transactions exceed 500 concurrent threads.
- **Cold-Start Elimination**: Minimum compute set to 0.5 CU during festival windows to prevent compute suspension.

### 3.2 PgBouncer Connection Management
- Serverless Node.js lambdas can quickly exhaust database connection pools during concurrency spikes.
- Devyatra routes all application queries through Neon's managed **PgBouncer** connection pool (`DATABASE_URL` with `?sslmode=require&pgbouncer=true`).
- Pooling mode: `Transaction Pooling`, enabling thousands of concurrent client requests to share a tightly controlled set of database worker processes.

### 3.3 Spatial & Relational Indexing Strategy
To guarantee database query latencies remain under **15ms** for 99% of requests:
- **B-Tree Indices**:
  - `Temple(slug)` UNIQUE
  - `Temple(state, district)`
  - `Temple(tradition, deity)`
  - `Temple(isVerified, qualityScore)`
- **Composite Spatial Indices**:
  - `CREATE INDEX idx_temple_coords ON "Temple" (latitude, longitude);`
- **Partial Fast-Filter Indices**:
  - `CREATE INDEX idx_temple_featured ON "Temple" (id) WHERE "isVerified" = true;`

---

## 4. Edge Caching & Incremental Static Regeneration (ISR)

### 4.1 Tiered Cache Policy
1. **Static Temple Detail Pages (`/temples/[state]/[slug]`)**:
   - Pre-rendered at build time (117+ static shell routes).
   - `revalidate: 86400` (24 hours ISR).
   - Stale-While-Revalidate headers: `Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800`.
   - Result: 98%+ of temple page requests are served directly from the Edge memory cache without executing serverless code or database queries.
2. **Directory & Exploration Queries (`/explore`, `/temples`)**:
   - `s-maxage=3600, stale-while-revalidate=86400`.
   - Paginated API responses cached with query fingerprint hashing.
3. **AI Generation Endpoints (`/api/ai/plan`, `/api/ai/ask`)**:
   - Non-cacheable dynamic POST requests.
   - Enforce rate-limiting: 20 AI requests / minute / IP.
   - AI response prompt deduplication caching via in-memory LRU for identical request signatures.

---

## 5. Performance Latency SLA Benchmarks

| Transaction Type | Target p50 Latency | Target p95 Latency | Target p99 Latency |
|:---|:---:|:---:|:---:|
| **Static Temple Page Load (Edge)** | < 35 ms | < 80 ms | < 150 ms |
| **Directory Search & Filter** | < 45 ms | < 110 ms | < 220 ms |
| **Live IST Darshan Status Calculation** | < 5 ms | < 12 ms | < 25 ms |
| **Grounded AI Itinerary Generation** | < 1,800 ms | < 3,200 ms | < 4,500 ms |
| **Offline Journey Snapshot Download** | < 120 ms | < 250 ms | < 400 ms |

---

## 6. Disaster & Congestion Control

1. **Graceful Degradation Mode**:
   - If AI upstream latency exceeds 5.0 seconds, fallback to pre-computed deterministic canonical sacred circuits instantly without returning an error.
2. **Dynamic Request Throttling**:
   - Edge middleware detects high-frequency scraping bots and applies progressive backoff (HTTP 429).
3. **Emergency Read-Only Mode**:
   - During catastrophic cloud provider outages, an edge service-worker falls back to static JSON snapshots stored at the edge, ensuring pilgrims can always read temple timings and emergency contacts.
