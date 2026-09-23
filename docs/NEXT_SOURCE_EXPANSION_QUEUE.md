# 🇮🇳 DEVYATRA / TEMPLEORA — NEXT SOURCE EXPANSION QUEUE

**Date**: 2026-09-23  
**Priority Hierarchy**: Government > Endowment Boards > Temple Authorities > State Tourism GIS > ASI Monuments  

---

## 1. Statutory Importer Expansion Queue

| Queue Order | Source Organization | Jurisdiction | Target Coverage Benefit |
|:---:|:---|:---|:---|
| **1** | **Odisha Shree Jagannatha Temple Administration & Endowment Commission** | Odisha (30 districts) | Coastal & Western Odisha temple records with sevayat customs |
| **2** | **Maharashtra Devasthan Management Committee (Western Maharashtra)** | Kolhapur, Sangli, Satara | Mahalaxmi, Jyotiba, and historic Sahyadri shrines |
| **3** | **Rajasthan Devasthan Department** | Rajasthan (50 districts) | Shekhawati, Marwar, and Mewar ancient temples |
| **4** | **Assam Kamakhya Debutter Board & Satra Directorate** | Assam & Lower Brahmaputra | Kamrup, Majuli Vaishnavite Satras, and ancient shrines |
| **5** | **Bihar Religious Trust Board (BRTB)** | Bihar (38 districts) | Mithila, Magadh, and historic Pataliputra shrines |
| **6** | **Gujarat Pavitra Yatradham Vikas Board (GPYVB)** | Saurashtra & Kutch | Ambaji, Somnath, Dwarka, and coastal circuits |

---

## 2. Ingestion Integrity Requirements

Every expansion batch must satisfy:
1. **Idempotency**: Existing IDs and slug aliases must never mutate on re-import.
2. **Coordinate Quality**: No district centroid fallbacks; coordinates must resolve to actual entrance or sanctum footprints.
3. **Language Verification**: Native Indic scripts must be verified against ISO 639-1 standards.
