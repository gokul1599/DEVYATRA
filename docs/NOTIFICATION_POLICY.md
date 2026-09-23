# 🇮🇳 DEVYATRA / TEMPLEORA — NOTIFICATION & PRIVACY POLICY

**Document Version**: 1.0.0-PROD  
**Domain**: Multi-Channel Dispatch, Explicit Opt-In, Quiet Hours & Anti-Spam Governance  
**System Component**: `src/lib/notifications/engine.ts`  

---

## 1. Respect for Pilgrim Peace (Zero Spam Commitment)

Pilgrimage is an internal spiritual discipline. Devyatra adheres to strict ethical communication principles:
1. **No Assumed Consent**: All push and email notification channels require explicit user opt-in per category.
2. **Zero Marketing Spam**: Marketing consent defaults to `false`. Commercial promotional broadcasts are forbidden.
3. **Verified Triggers Only**: Notifications are triggered solely by verified statutory events (e.g. official TTD slot booking opening, temple closure circulars, saved journey alerts).

---

## 2. Notification Categories

| Category | Default State | Description | Urgency Tier |
|:---|:---:|:---|:---:|
| **festival_update** | Opt-In | Major religious festivals, Brahmotsavam schedules, and Rath Yatras | NORMAL |
| **timing_change** | Opt-In | Official temple circulars modifying sanctum opening/closing hours | NORMAL |
| **booking_update** | Opt-In | Release of official special darshan or seva quotas by temple boards | NORMAL |
| **temporary_closure** | Opt-In | Unplanned sanctum closures, solar eclipse closures, or repairs | HIGH |
| **journey_reminder** | Opt-In | 24-hour reminder before scheduled itinerary stops | NORMAL |
| **weather_emergency** | System Critical | Flash flood warnings, landslides, or civil alerts near pilgrim routes | EMERGENCY |

---

## 3. Strict Quiet Hours Enforcement

Devyatra recognizes that nighttime rest and early morning sadhana must not be disrupted by digital alerts.

- **Configurable Window**: Users specify their active timezone and preferred quiet hours (default: `22:00` to `06:00`).
- **Suppression Mechanism**: Any non-emergency notification scheduled to fire during quiet hours is queued and held until quiet hours conclude.
- **Emergency Exception**: Only `EMERGENCY` notifications (natural disaster warnings, critical highway closures) bypass quiet hours.
