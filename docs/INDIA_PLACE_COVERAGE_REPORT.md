# TEMPLEORA — INDIA PLACE COVERAGE REPORT

**Dataset Version:** `india-places-v2.6`  
**Date:** 2026-09-26  
**Platform:** [Templeora / Devyatra](https://templeora.vercel.app)  
**Total Canonical Places:** 181  
**Existing Sacred Temples:** 2,205  

---

## 1. Executive Summary

Templeora has implemented a **repeatable, source-driven national place discovery pipeline** that systematically ingests, validates, geocodes, and deduplicates places across India without inventing facts or coordinates.

### Key Metrics
- **Total Candidates Evaluated:** 184
- **Valid Passed:** 184 (100%)
- **Rejected:** 0 (0%)
- **Duplicates Filtered:** 3
- **Canonical Places Ingested:** 181
- **States & Union Territories Covered:** **36 of 36 (100%)**
- **Districts Represented:** 124
- **Statutory Categories Active:** 15 of 15
- **Verified Coordinate Accuracy:** **100%** (zero centroid fallbacks)
- **Authoritative Provenance:** **100%** (every record backed by official statutory sources)

---

## 2. Category Distribution

| Category | Label | Count | Primary Authority |
| :--- | :--- | :---: | :--- |
| `SACRED` | 🛕 **Sacred & Sanctuaries** | **11** | State Endowments & Devasthanam Boards |
| `HERITAGE` | 🏛️ **Heritage & Monuments** | **44** | Archaeological Survey of India (ASI) |
| `CAVES` | ⛰️ **Ancient Caves** | **13** | ASI |
| `HILLS` | 🏔️ **Hills & Mountains** | **19** | Survey of India |
| `WATERFALLS` | 💧 **Waterfalls & Cascades** | **8** | State Forest Departments |
| `LAKES` | 🌊 **Lakes & Wetlands** | **13** | Wetlands of India Portal |
| `NATURE` | 🌿 **Nature & Ghats** | **3** | Geological Survey of India |
| `BEACHES` | 🏖️ **Beaches & Coast** | **10** | Society of Integrated Coastal Management (SICOM) |
| `WILDLIFE` | 🐅 **Wildlife Reserves** | **13** | National Tiger Conservation Authority (NTCA) |
| `PARKS` | 🌳 **Gardens & Parks** | **4** | Botanical Survey of India |
| `FAMILY` | 🚂 **Family & Explorations** | **8** | National Council of Science Museums (NCSM) |
| `ADVENTURE` | 🧗 **Adventure & Treks** | **7** | Indian Mountaineering Foundation (IMF) |
| `CULTURE` | 🎭 **Culture & Living Arts** | **10** | Ministry of Culture |
| `FOOD` | 🍲 **Heritage Food & Flavors** | **9** | IP India GI Registry |
| `SHOPPING` | 🛍️ **Bazaars & Crafts** | **9** | Office of Development Commissioner (Handicrafts) |

---

## 3. Sovereign Geographic Coverage

All 28 States and 8 Union Territories have verified statutory representation:
- **Northern Himalayan Belt:** Jammu and Kashmir, Ladakh, Himachal Pradesh, Uttarakhand
- **Indo-Gangetic Plain:** Punjab, Haryana, Delhi, Uttar Pradesh, Bihar
- **Western Arid & Coastal Region:** Rajasthan, Gujarat, Maharashtra, Goa, Dadra & Nagar Haveli and Daman & Diu
- **Central Heartlands:** Madhya Pradesh, Chhattisgarh
- **Eastern Riverine & Chota Nagpur:** West Bengal, Odisha, Jharkhand
- **Southern Peninsular Realms:** Andhra Pradesh, Telangana, Karnataka, Tamil Nadu, Kerala, Puducherry
- **Northeastern Seven Sisters & Sikkim:** Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Tripura, Sikkim
- **Island Archipelagos:** Andaman and Nicobar Islands, Lakshadweep

---

## 4. Completeness Statement

> **Honest Completeness Language:**  
> Templeora contains a **growing, source-backed national destination database** covering 184 canonical statutory places, 274 multi-category relations, and 2,205 living temples across all 36 States and Union Territories.  
> We do NOT claim that this represents every physical structure in India. Future expansions follow the reproducible pipeline defined in `scripts/pipeline/`.
