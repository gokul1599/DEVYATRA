# 🇮🇳 DEVYATRA / TEMPLEORA — FINAL V2.1 ENTERPRISE ARCHITECTURE

**System Target**: National Pilgrimage Operating System  
**Version**: 2.1.0-PROD  
**Production URL**: `https://templeora.vercel.app`  

---

## 1. Architectural Summary

Devyatra V2.1 couples high-speed Next.js 16 serverless and edge computing with Neon Serverless PostgreSQL. It enforces strict separation of concerns across presentation, domain logic, data persistence, and external service gateways:

```
                              [ Pilgrim Client ]
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │    Vercel Edge Global POPs    │
                      │  - Rate Limiter (120 req/min) │
                      │  - Security & CORS Headers    │
                      │  - Edge Static Cache (ISR)    │
                      └───────────────┬───────────────┘
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │  Next.js 16 App Router Core   │
                      │  - 117 Pre-rendered Routes    │
                      │  - Serverless API Gateways    │
                      └───────────────┬───────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
    [ AI Guard & Engine ]   [ Travel & Routing ]    [ Trust & Provenance ]
    - Pacing & Dilation     - Terrain Curvature     - Version History
    - Injection Defense     - Live Weather Context  - Conflict Resolution
    - Grounded Citations    - Quiet Hours Alerts    - Temporal Schedules
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │    Neon Serverless Postgres   │
                      │  - 2,084 Verified Temples     │
                      │  - 714 LGD Districts          │
                      │  - PgBouncer Pooling          │
                      │  - 0 Centroid Fallbacks       │
                      └───────────────────────────────┘
```
