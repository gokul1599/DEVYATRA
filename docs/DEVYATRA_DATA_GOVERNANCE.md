# 🇮🇳 DEVYATRA / TEMPLEORA — DATA GOVERNANCE & INTEGRITY MANIFESTO

**Document Version**: 2.1.0-PROD  
**Domain**: Provenance Standards, Geo-Precision & Multi-Source Conflict Resolution  

---

## 1. Zero Centroid Fallback Invariant

Devyatra explicitly rejects synthetic geocoding shortcuts:
- **Rule**: No district, tehsil, or pin code centroid coordinates are permitted in the production catalog.
- **Enforcement**: Continuous automated assertions in `scripts/verify_phase6.ts` and `scripts/verify_phase20.ts` fail builds if `isCentroidFallback: true` or duplicate centroids are discovered.
- **Current Verified Status**: **0 centroid fallbacks across 2,084 temple records (100% surveyed coordinates).**

---

## 2. Multi-Tier Provenance Hierarchy

When sources contradict, Devyatra enforces the statutory hierarchy defined in `src/lib/trust/provenance.ts`:
1. `OFFICIAL_TEMPLE_AUTHORITY` (Priority: 100)
2. `GOVERNMENT_ENDOWMENT` (Priority: 85)
3. `OFFICIAL_TOURISM` (Priority: 70)
4. `ASI_HERITAGE_AUTHORITY` (Priority: 65)
5. `RELIABLE_SECONDARY` (Priority: 40)
6. `GOOGLE_DISCOVERY` (Priority: 25)
7. `COMMUNITY_USER` (Priority: 10)

Disputes with priority differentials < 20 are queued for manual administrative review.
