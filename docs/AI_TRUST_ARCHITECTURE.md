# 🇮🇳 DEVYATRA / TEMPLEORA — AI TRUST ARCHITECTURE

**Date**: 2026-09-23  
**Framework**: Grounded Context Engineering + Zod Contract Enforcement  

---

## 1. Grounded Intelligence Flow

```
                      USER QUERY / PILGRIMAGE INTENT
                                    │
                                    ▼
                      Prompt Sanitization & Injection Guard
                        (src/lib/ai/guard.ts)
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                    Valid Input          Malicious / Override
                         │                     │
                         ▼                     ▼
             Geographic & Temple Resolution  Refusal / Safety Handshake
             (IDs, Slugs, Coordinates)
                         │
                         ▼
             Live Telemetry & Provenance Ingestion
             (IST Status, Devasthanam Portals, Panchang)
                         │
                         ▼
             Itinerary Feasibility Guard
             (Terrain Dilation, Max Daily Temples, Elderly Buffers)
                         │
                         ▼
             Zod Schema Validation (ItinerarySchema)
                         │
                         ▼
             Explanatory Output with Source Citations
```

---

## 2. Hard Anti-Fabrication Principles

1. **Refusal Over Hallucination**:
   - When a temple lacks verified darshan timings, the system returns `ai_not_verified` rather than generating plausible opening hours.
2. **Provenance Citations**:
   - Every factual claim returned by `askCompanion` links to its source entity (e.g. `Tirumala Tirupati Devasthanams`, `Curated nearby data`, `HR&CE official directory`).
3. **Terrain Dilation vs Straight-Line Geometry**:
   - Transit durations account for terrain factors (1.85x in high mountains, 1.4x in ghat roads), preventing unachievable mountain travel plans.
4. **Impossible Schedule Detection**:
   - Flagging itineraries with excessive temples (>3/day for standard yatris, >2/day for elderly/children) or impossible walking legs (>25 km/day).
