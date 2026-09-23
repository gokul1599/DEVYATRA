# 🇮🇳 DEVYATRA / TEMPLEORA — SECURITY OPERATIONS & HARDENING (SEC-2.0)

**Document Version**: 2.0.0-PROD  
**Domain**: Application Security, Cryptographic Controls, Rate Limiting & Auth  

---

## 1. Security Architecture Matrix

| Security Layer | Hardening Mechanism | Implementation Detail |
|:---|:---|:---|
| **Edge Gateway** | Vercel Edge Middleware | IP-based rate limiting (120 req/min) returning HTTP 429 |
| **Transport Security** | HSTS Preload | `max-age=63072000; includeSubDomains; preload` |
| **Content Security** | Strict CSP & Framing | `X-Frame-Options: SAMEORIGIN`, `nosniff`, `origin-when-cross-origin` |
| **Authentication** | Argon2 / bcrypt Hashing | Salted hashes for administrative credentials; secure HttpOnly cookies |
| **AI Defense** | Regex Input Sanitization | Blocks system prompt leaks, persona takeovers, and HTML injections |
| **Data Protection** | Zero Centroid Invariant | Blocks programmatic centroid imports from entering the primary dataset |

---

## 2. Secrets & Vulnerability Management

1. **Secret Scanning**: Continuous CI scans verify zero API keys or database connection strings exist in git commits.
2. **Dependency Auditing**: `npm audit` and Dependabot alerts ensure zero high/critical vulnerabilities in third-party packages.
3. **Least Privilege (RBAC)**: Public routes operate via read-only anonymous database pools; mutation endpoints require verified administrative tokens.
