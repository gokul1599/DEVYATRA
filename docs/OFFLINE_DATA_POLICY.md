# 🇮🇳 DEVYATRA / TEMPLEORA — OFFLINE DATA & PRIVACY POLICY

**Date**: 2026-09-23  

---

## 1. Offline Snapshot Principles

1. **Explicit Data Timestamping**:
   - Every offline package stored on a device must visibly declare:
     ```text
     Offline Pilgrim Snapshot saved on YYYY-MM-DD.
     Timings & darshan slots are verified as of save date.
     Connect to network for live IST telemetry.
     ```
   - The application never pretends offline cached timing slots represent live crowd telemetry.
2. **Security & Sensitive Data Privacy**:
   - Passwords, session cookies, and authentication tokens are **never** persisted in unencrypted client-side localStorage.
   - Only non-sensitive itinerary coordinates, emergency phone numbers, and official temple timings are cached offline.
3. **Storage Quota & Eviction**:
   - Offline journey snapshots are capped at 25 journeys per client device to prevent unbounded localStorage expansion.
