# 🇮🇳 DEVYATRA / TEMPLEORA — SOURCE CONFLICT RESOLUTION POLICY

**Document Version**: 1.0.0-PROD  
**Domain**: Multi-Source Contradiction Handling & Authority Precedence  
**System Component**: `src/lib/trust/provenance.ts`  

---

## 1. The Multi-Source Contradiction Challenge

When cataloging thousands of ancient and active shrines across India, different data sources frequently present conflicting facts:
- **Example A (Timings)**: Google Places indicates opening at `06:00 AM`, whereas the Official Devasthanam Board circular indicates `05:30 AM`.
- **Example B (Deity / Tradition)**: A regional travel blog claims a shrine is a Shakti Peetha, whereas ASI archaeological survey gazetteers record it as an early medieval Shaiva rock-cut sanctum.

Devyatra **strictly prohibits silent overwriting** of conflicting claims. Every dispute creates a formal `SourceConflict` event and resolves according to an immutable authority hierarchy.

---

## 2. Statutory Authority Hierarchy

| Tier | Priority Score | Authority Category | Scope & Examples |
|:---|:---:|:---|:---|
| **Tier 1** | **100** | Official Temple Authority | Statutory Shrine Boards: TTD, SMVDSB, Kashi Vishwanath Board, Somnath Trust |
| **Tier 2** | **85** | Government Endowments | State Endowments Departments: Tamil Nadu HR&CE, Andhra Pradesh Endowments |
| **Tier 3** | **70** | Official Tourism Boards | Ministry of Tourism (Incredible India), Gujarat Tourism, KSTDC |
| **Tier 4** | **65** | ASI & Heritage Bodies | Archaeological Survey of India (ASI), National Monuments Authority (NMA) |
| **Tier 5** | **40** | Reliable Secondary Sources | Epigraphia Indica, District Gazetteers, Peer-reviewed Academic Press |
| **Tier 6** | **25** | Google / Discovery APIs | Google Maps API, Discovered Places Web Crawls |
| **Tier 7** | **10** | Community Crowdsourcing | Yatri submissions, pilgrim feedback reports |

---

## 3. Automated vs. Manual Resolution Mechanics

### Case 1: Decisive Priority Differential (Δ Priority ≥ 20)
- When Source A is in Tier 1 (`100`) and Source B is in Tier 6 (`25`), the differential is `75 ≥ 20`.
- **Action**: Automated resolution. The engine adopts Source A's value (`RESOLVED_BY_HIERARCHY`), records the rationale, and updates field version history without human delay.

### Case 2: Ambiguous or Close Tiers (Δ Priority < 20)
- When two government sources disagree (e.g. State Tourism claims one timing, District Administration claims another), the differential is `< 15`.
- **Action**: The conflict is marked `NEEDS_MANUAL_REVIEW`. The system presents the dispute in the Admin Command Center and retains the existing verified value until an administrator verifies the primary gazette notification.
