# 🇮🇳 DEVYATRA / TEMPLEORA — FAMOUS TEMPLES GAPS, EXPANSIONS & RESOLUTIONS

**Report Date:** 2026-09-27  
**Status:** All genuine gaps fully closed and verified.

---

## 1. OVERVIEW OF GENUINE INVENTORY GAPS

During the national famous temples audit, 7 iconic sanctuaries were identified as either **completely missing** from `prisma.temple` or possessing only minor satellite shrines without the primary sanctum. 

In previous audits, naive substring matching masked these gaps by falsely claiming 100% presence through nearby or similarly named temples (e.g., claiming *Varadaraja Perumal* was present by pointing to *Ekambareswarar*, or claiming *Kavlem Shantadurga* was present by pointing to a shrine 31 km away in Calangute).

---

## 2. DETAILED BREAKDOWN OF CLOSED GAPS

| # | Temple Name | State | District | Coordinates | Root Cause in Legacy Catalog | Canonical Resolution |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Arulmigu Varadaraja Perumal Temple** | Tamil Nadu | Kanchipuram | `12.8193, 79.7246` | Absent from initial database imports. In prior naive audit, queries for Varadaraja Perumal falsely matched Ekambareswarar Temple because both are in Kanchipuram. | Created canonical record `t-varadaraja-perumal-kanchipuram` (`TEMPLE-IND-TN-KAN-000020`) with 100% verified geodetics and HR&CE provenance. |
| 2 | **Arulmigu Kamakshi Amman Temple** | Tamil Nadu | Kanchipuram | `12.8412, 79.7032` | Initial database only had 'Adhi Kamatchiamman Temple' (a small local shrine). In prior audit, it was falsely mapped to Ekambareswarar Temple. | Created primary Shakthi Peetham record `t-kamakshi-amman-kanchipuram` (`TEMPLE-IND-TN-KAN-000021`) with Sri Kanchi Kamakshi Ambal Devasthanam provenance. |
| 3 | **Swayambhu Ganpati Temple, Ganpatipule** | Maharashtra | Ratnagiri | `17.1458, 73.2667` | Completely omitted from previous Western India imports. The entire Konkan coast iconic Ganesha pilgrimage was absent. | Created canonical record `t-swayambhu-ganpati-ganpatipule` (`TEMPLE-IND-MH-RAT-000020`) with MTDC and Sansthan provenance. |
| 4 | **Bhadrakali Temple, Warangal** | Telangana | Warangal / Hanamkonda | `17.9944, 79.5858` | Kakatiya Dynasty 7th-century Shakthi temple on Bhadrakali Lake was missing from Telangana imports. Naive audit fell back to Bhadrakali in Bemetara (Chhattisgarh). | Created canonical record `t-bhadrakali-warangal` (`TEMPLE-IND-TS-WAR-000020`) with Telangana Endowments provenance. |
| 5 | **Prem Mandir (Temple of Divine Love)** | Uttar Pradesh | Mathura / Vrindavan | `27.5722, 77.6744` | Modern 54-acre Italian white Carrara marble spiritual landmark was absent. Naive search failed or matched Banke Bihari. | Created canonical record `t-prem-mandir-vrindavan` (`TEMPLE-IND-UP-MAT-000020`) with JKP provenance. |
| 6 | **Kaal Bhairav Temple (Kotwal of Varanasi)** | Uttar Pradesh | Varanasi | `25.3183, 83.0142` | The Supreme Spiritual Magistrate of Kashi was absent as an independent sanctuary; naive queries picked temples in Assam or Ujjain. | Created canonical record `t-kaal-bhairav-varanasi` (`TEMPLE-IND-UP-VAR-000020`) with Varanasi District Administration provenance. |
| 7 | **Shri Shantadurga Temple, Kavlem** | Goa | South Goa | `15.3622, 73.9856` | Database only contained 'Shantadurga Kalangutkarin Temple' in North Goa (31 km away), not the famous primary 1738 CE Maratha-era temple in Kavlem, Ponda. | Created canonical record `t-shantadurga-kavlem-ponda` (`TEMPLE-IND-GA-SOU-000020`) with Shri Shantadurga Saunsthan provenance. |

---

## 3. SEEDING ARTIFACTS & INTEGRATION

All 7 sanctuaries were ingested via `scripts/ingest/seed_missing_canonical_temples.ts` with:
- Dual-table upsert into Neon PostgreSQL (`prisma.temple`) with sovereign foreign keys linking to validated `State` and `District` records.
- Insertion into static national destination registry (`src/lib/destinations/research-expanded-temples.ts`).
- 100% verified non-null GPS coordinates, official provenance URLs, and native names.
