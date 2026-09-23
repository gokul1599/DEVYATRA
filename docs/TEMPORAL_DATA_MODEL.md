# 🇮🇳 DEVYATRA / TEMPLEORA — TEMPORAL DATA MODEL SPECIFICATION

**Document Version**: 1.0.0-PROD  
**Domain**: Temporal Sacred Schedules, Festivals, Closures & Historical Precedence  
**System Component**: `src/lib/trust/provenance.ts`  

---

## 1. Overview & Problem Definition

Standard travel directories model opening hours as static daily numbers (e.g. `06:00 - 21:00`). In living Bharatiya temples, operational schedules are deeply temporal and dynamic:
- **Seasonal Shifts**: Himalayan shrines (Kedarnath, Badrinath, Gangotri, Yamunotri) close completely during winter months (Bhai Dooj to Akshaya Tritiya).
- **Festival Windows**: During major festivals (Mahashivratri, Brahmotsavam, Vaikuntha Ekadashi), sanctums operate continuously for 24–48 hours with special darshan queues.
- **Astronomic / Ritual Closures**: Solar/Lunar eclipses (Grahan) mandate complete temple closure and subsequent shuddhi snanam rituals.
- **Maintenance / Jeernodharana**: Ancient stone shrines periodically undergo sanctum consecration (Kumbhabhishekam) where public darshan is restricted to temporary balalayam altars.

Devyatra's Temporal Data Model answers two fundamental pilgrim questions without ambiguity:
1. **"What is valid today?"**
2. **"What was valid previously or scheduled in the future?"**

---

## 2. Temporal Category Taxonomy

| Category | Priority | Operational Behavior | Example Scenario |
|:---|:---:|:---|:---|
| **EMERGENCY** | 100 (Highest) | Overrides all schedules; temple closed or access blocked | Landslide on Badrinath highway; flood alert |
| **SPECIAL_CLOSURE**| 80 | Sanctum closed for specific hours or days | Solar eclipse (Grahan); VIP security sanitization |
| **TEMPORARY** | 60 | Non-standard interim arrangement | Sanctum renovation; Balalayam darshan |
| **FESTIVAL** | 40 | Extended darshan hours, special token queues | Tirumala Brahmotsavam; Kashi Mahashivratri |
| **SEASONAL** | 20 | Long-range calendar opening/closing periods | Chota Char Dham winter closure (Nov – April) |
| **REGULAR** | 10 (Lowest) | Baseline daily morning & evening puja schedule | Standard weekday darshan (06:00 – 12:30, 16:30 – 21:00) |

---

## 3. Precedence & Resolution Algorithm

When evaluating a target date (e.g. `2026-10-24`), the engine evaluates all active temporal records intersecting that date:
```text
Intersecting Records = { r ∈ TemporalRecords | r.startDate <= TargetDate <= r.endDate }
```
If multiple records match, the one with the highest precedence category governs:
```text
ActiveRecord = max_by(IntersectingRecords, r => Precedence[r.category])
```
If no record matches, the regular baseline schedule is marked as active.

---

## 4. Schema Definition

```typescript
export interface TemporalRecord {
  id: string;
  templeId: string;
  category: TemporalCategory;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  openingTime?: string; // HH:mm
  closingTime?: string; // HH:mm
  isOpen: boolean;
  darshanAvailable: boolean;
  specialRulesNote?: string;
  sourceAuthority: string;
  verifiedAt: string;
}
```
