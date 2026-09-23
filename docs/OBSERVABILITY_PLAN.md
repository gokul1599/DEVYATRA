# 🇮🇳 DEVYATRA / TEMPLEORA — V2 OBSERVABILITY, TELEMETRY & RUNBOOK PLAN

**System Target**: Devyatra (Templeora) Production Platform  
**Target URL**: `https://templeora.vercel.app`  
**Observability Pillars**: Metrics, Distributed Tracing, Structured Logging, Synthetic Uptime, AI Telemetry  
**SLA Guarantee**: 99.95% Availability  

---

## 1. Observability Architecture Overview

The Devyatra V2 observability framework ensures complete operational visibility across the entire pilgrim request lifecycle: from browser interaction in remote Himalayan shrines to edge routing, serverless execution, AI guardrail evaluation, and database transaction completion.

```
 Pilgrim Browser (Mobile / Desktop)
   │
   ├─► Core Web Vitals & Real User Monitoring (LCP, INP, CLS)
   ├─► Client Sentry Error Boundary (Hydration, JS Crashes)
   │
   ▼
 Vercel Edge Network
   │
   ├─► Edge Request Log (Status 2xx/4xx/5xx, Rate Limit Triggers)
   ├─► TTFB & Cache Hit Ratio Telemetry
   │
   ▼
 Serverless Next.js API & Guard Layer
   │
   ├─► Structured JSON Logs (Pino / OpenTelemetry compatible)
   ├─► AI Feasibility Guard Tracing (Pacing adjustments, Sanitization)
   │
   ▼
 Neon PostgreSQL Engine
   │
   ├─► PgBouncer Connection Metrics
   ├─► Slow Query Logging (Threshold > 50ms)
   └─► Auto-Scale Compute Unit Telemetry
```

---

## 2. Core Web Vitals & Performance Telemetry (SLO / SLA)

Devyatra enforces strict Core Web Vitals budgets to guarantee instantaneous responsiveness on low-bandwidth 3G/4G networks common in pilgrimage hill corridors.

| Metric | Google "Good" Threshold | Devyatra V2 Budget Target | Measurement Method |
|:---|:---:|:---:|:---|
| **Largest Contentful Paint (LCP)** | < 2.5s | **< 1.8s** | Vercel Speed Insights / RUM |
| **Interaction to Next Paint (INP)** | < 200ms | **< 120ms** | Chrome Web Vitals SDK |
| **Cumulative Layout Shift (CLS)** | < 0.10 | **< 0.02** | RUM telemetry (Zero layout jump) |
| **First Contentful Paint (FCP)** | < 1.8s | **< 0.9s** | Edge cached pre-render |
| **Time to First Byte (TTFB)** | < 800ms | **< 180ms** | Vercel Mumbai Edge POP |

---

## 3. Application Logging & Structured Events

All server-side logs output JSON payloads with consistent correlation IDs (`requestId`, `clientIpHash`, `timestamp`, `environment`).

### Key Log Schemas
```json
{
  "timestamp": "2026-09-23T10:15:00.000Z",
  "level": "info",
  "service": "devyatra-ai-guard",
  "requestId": "req_8f7b2c91a0",
  "event": "FEASIBILITY_EVALUATION",
  "input": {
    "totalTemples": 6,
    "totalDays": 1,
    "hasElderly": true
  },
  "guardResult": {
    "feasible": false,
    "violations": [
      "TEMPLE_OVERLOAD_ELDERLY: 6 temples requested for 1 day with senior pilgrims (limit: 2)",
      "TRANSIT_DISTANCE_EXCEEDED: Estimated 280km exceeds senior buffer (limit: 140km)"
    ],
    "autoAdjusted": true
  }
}
```

---

## 4. AI Guardrail & Safety Telemetry

Because Devyatra coordinates sacred religious journeys, hallucination or malicious prompt manipulation carries serious real-world risk (e.g. stranding senior citizens in high-altitude terrain after temple doors have closed).

### Tracked AI Metrics
1. **Prompt Sanitization Triggers**:
   - Detection of system prompt leaking attempts, jailbreaks, or SQL/script injections.
   - Any sanitization event logs an `ai_security_alert` and returns sanitized, grounded responses.
2. **Terrain Dilation Activation**:
   - Frequency of mountain curve dilation factors applied (1.85x for Himalayas, 1.45x for Ghats).
3. **Midday Sanctum Buffer Enforcement**:
   - Counter tracking how many user requests attempted to schedule sanctum visits between 12:30 PM and 03:30 PM and were safely rerouted to resting / annadhanam breaks.

---

## 5. Alerting Matrix & Severity Levels

| Alert Name | Condition | Severity | Notification Channel | Auto-Remediation |
|:---|:---|:---:|:---:|:---|
| **HighErrorRate5xx** | > 1.0% of requests return 5xx over 3 mins | **P1 (Critical)** | PagerDuty / SMS | Rollback deployment |
| **DatabasePoolExhaustion** | PgBouncer active pool > 85% capacity | **P1 (Critical)** | PagerDuty / Slack | Auto-scale compute unit |
| **SlowQuerySpike** | > 15 queries/min taking > 100ms | **P2 (Major)** | Slack `#devyatra-alerts` | Log slow query fingerprint |
| **RateLimitSpike** | > 1,000 HTTP 429s in 5 minutes | **P2 (Major)** | Slack `#devyatra-security` | Blacklist rogue subnet |
| **EdgeCacheHitDrop** | Cache hit ratio drops below 80% | **P3 (Minor)** | Email digest | Purge & warm static cache |

---

## 6. Incident Response Runbook

### Incident Scenario 1: Sudden Traffic Spike Causing Latency
1. **Diagnosis**: Check Vercel Analytics and Neon Console for CPU / compute unit ceiling.
2. **Action**:
   - Temporarily increase Neon compute units max limit to 16 CU.
   - Verify Edge caching headers are active (`s-maxage=86400`).
   - If AI upstream is bottlenecked, toggle graceful fallback to canonical pre-calculated circuits in `src/lib/discovery/collections.ts`.

### Incident Scenario 2: Broken Statutory External Link
1. **Diagnosis**: Pilgrim reports a broken booking URL or outdated aarti timing.
2. **Action**:
   - Query temple by slug: `npx tsx scripts/inspect_temple.ts <slug>`.
   - Update official trust portal in `src/lib/registry.ts`.
   - Re-run verification suite: `node scripts/test.mjs`.
   - Invalidate specific ISR cache path: `/api/revalidate?path=/temples/<state>/<slug>`.
