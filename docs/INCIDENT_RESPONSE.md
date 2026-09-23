# 🇮🇳 DEVYATRA / TEMPLEORA — INCIDENT RESPONSE PLAN (SECOP-IR-01)

**Document Version**: 1.0.0-PROD  
**Domain**: Operational Security, Site Reliability & Pilgrim Trust Protection  
**Classification**: Public Engineering Policy  

---

## 1. Incident Severity Tiers

| Severity | Definition | Response SLA | Escalation Target |
|:---|:---|:---:|:---|
| **P1 - Critical** | Production outage; database corruption; active security breach; compromised admin account | **< 15 minutes** | Lead Architect, SRE Lead, PagerDuty Call |
| **P2 - Major** | Core feature degradation (AI planner failure, search index unavailable, booking redirects 5xx) | **< 45 minutes** | Engineering Lead, Slack `#devyatra-ops` |
| **P3 - Minor** | Localized styling defect; single temple detail broken; non-critical telemetry latency | **< 4 hours** | Duty Developer |
| **P4 - Low** | Minor typo; suggested amenity update; non-blocking community report | Next Sprint | Backlog Triage |

---

## 2. Six-Phase Response Lifecycle

```text
1. DETECTION ──► Automated Health Checks (Vercel / Sentry / Neon) or Pilgrim Report
2. CONTAINMENT ──► Edge rate limiting, API token revocation, or read-only mode toggle
3. ERADICATION ──► Revert flawed commit, patch vulnerable dependency, or purge cache
4. RECOVERY ──► Verify PITR branch or redeploy; execute verification test suites
5. VERIFICATION ──► Validate 5 Invariant Gates (2,084 shrines, 0 centroids, 714 districts)
6. POSTMORTEM ──► Publish blameless RCA (Root Cause Analysis) within 48 hours
```

---

## 3. Emergency Kill-Switches

1. **AI Subsystem Pause**: Set `AI_FEATURE_DISABLED="true"` in Vercel Environment Variables to gracefully downgrade AI requests to pre-calculated canonical circuits.
2. **Read-Only Mode**: Set `DATABASE_READ_ONLY="true"` to prevent write operations during active database migrations or security investigations.
