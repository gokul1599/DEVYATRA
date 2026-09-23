# 🇮🇳 DEVYATRA / TEMPLEORA — USER FEEDBACK & VERIFICATION WORKFLOW

**Document Version**: 1.0.0-PROD  
**Domain**: Yatri Feedback Collection, Moderation Queue & Statutory Truth Pipeline  
**System Component**: `src/lib/analytics/engine.ts`  

---

## 1. Ground Truth Invariant: No Direct Overwrites

A crowdsourced user submission—even when submitted with good intent—may reflect local myth, hearsay, or obsolete information.

```text
CRITICAL DATA INVARIANT:
User submissions NEVER directly overwrite production database rows.
```

Every user feedback submission must pass through our formal 6-stage moderation pipeline before any database modification is published.

---

## 2. Six-Stage Moderation Lifecycle

```text
 1. REPORT_RECEIVED
        ↓  (Ingested from temple detail or journey page)
 2. MODERATION_QUEUE
        ↓  (Assigned to regional temple verification editor)
 3. SOURCE_CHECK_IN_PROGRESS
        ↓  (Cross-referenced against Gazetteers, ASI records, Devasthanam circulars)
 4. CORRECTION_PROPOSED
        ↓  (Field delta formulated with statutory citation)
 5. STATUTORY_VERIFIED
        ↓  (Editor attaches primary authority citation URL / circular number)
 6. PUBLISHED_TO_PRODUCTION
        (Field updated in Neon PostgreSQL; version history entry recorded in temple_field_history)
```

---

## 3. Feedback Reasons & Categorization

Pilgrims and researchers can submit reports for the following concrete reasons:

1. `WRONG_TEMPLE_NAME`: Spelling discrepancy or vernacular orthography error.
2. `WRONG_LOCATION`: Surveyed GPS coordinate inaccuracy (flagged for rooftop geo-audit).
3. `WRONG_TIMING`: Darshan, pat bandh, or aarti timing update.
4. `WRONG_BOOKING`: Broken, expired, or counterfeit booking link reported.
5. `INCORRECT_HISTORY`: Conflation of documented epigraphy with oral lore.
6. `INCORRECT_FESTIVAL`: Outdated lunar date or festival calendar label.
7. `INCORRECT_IMAGE`: Visual asset not depicting the correct sanctum or deity.
8. `DUPLICATE_TEMPLE`: Two entries for the same shrine (merged into single complex).
9. `BROKEN_LINK`: 404 error on external trust authority reference.
10. `OTHER`: General editorial observation.
