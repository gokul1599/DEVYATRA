# 🇮🇳 DEVYATRA / TEMPLEORA — PHASE 13 DRY RUN AUDIT REPORT

**Date:** September 22, 2026  
**Auditor:** DevYatra Automated Ingestion Engine & Quality Assurance Suite  
**Scope:** Phase 13 Multi-State Dry Run Validation (Chhattisgarh, Jharkhand, Jammu & Kashmir, Ladakh, Goa, Telangana)  
**Target:** Validate candidate temple records against Neon PostgreSQL baseline without modifying production data.

---

## 1. Executive Summary

Phase 13 expands DevYatra coverage across 6 high-priority states/UTs to surpass the **60.0% National District Milestone** (>= 551 / 917 LGD districts) from a baseline of **465 districts (50.71%)**.

Every candidate temple record was subjected to strict data quality gates:
1. **Mandatory Fields**: Name, Local Name, State Code, District Name, Locality, Coordinates, Deity, Tradition, Source.
2. **Geographic Bounds**: Latitude [6.0, 38.0], Longitude [68.0, 98.0].
3. **Centroid Proximity Guard**: Distance > 25 km from known state/national centroids (0 fallback coordinates permitted).
4. **Deduplication Engine**: Dual spatial proximity (< 500m) and Jaro-Winkler string similarity (>= 85%).
5. **Statutory Provenance**: Official state endowment departments, temple trusts, district administrations, and ASI.

---

## 2. Dry Run Results by State

| State / UT | Total Candidate Records | Projected Additions | Duplicates Caught | Rejections | Centroid Fallbacks | Dry Run Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Chhattisgarh (CG)** | 31 | 29 | 2 (Danteshwari, Rajiv Lochan) | 0 | 0 | ✅ PASSED |
| **Jharkhand (JH)** | 24 | 22 | 2 (Baidyanath, Jagannath Ranchi) | 0 | 0 | ✅ PASSED |
| **Jammu & Kashmir (JK)** | 24 | 20 | 4 (Vaishno Devi, Martand, Purmandal, Avantiswami) | 0 | 0 | ✅ PASSED |
| **Ladakh (LA)** | 3 | 3 | 0 | 0 | 0 | ✅ PASSED |
| **Goa (GA)** | 8 | 7 | 1 (Tambdi Surla) | 0 | 0 | ✅ PASSED |
| **Telangana (TS)** | 32 | 29 | 3 (Ramappa, Bhadrachalam, Chilkur Balaji) | 0 | 0 | ✅ PASSED |
| **TOTAL** | **122** | **110** | **12** | **0** | **0** | ✅ **ALL PASSED** |

---

## 3. Deduplication Highlights

### Chhattisgarh (`CG`)
- **Maa Danteshwari Temple Dantewada**: Spatial distance 281m, Name similarity 100.0% -> Correctly identified as duplicate of `IN-CG-DTW-000001`.
- **Rajiv Lochan Temple Rajim**: Spatial distance 369m, Name similarity 95.2% -> Correctly identified as duplicate of `IN-CG-CHH-000119`.
- **Net Additions**: 29 unique temples across 28 previously unrepresented Chhattisgarh districts.

### Jharkhand (`JH`)
- **Baba Baidyanath Jyotirlinga Temple Deoghar**: Spatial distance 30m, Name similarity 100.0% -> Correctly identified as duplicate of `IN-JH-DEO-000001`.
- **Jagannath Temple Ranchi**: Spatial distance 216m, Name similarity 93.9% -> Correctly identified as duplicate of `IN-JH-PUR-000106`.
- **Net Additions**: 22 unique temples across 21 previously unrepresented Jharkhand districts (including Dumka, Ramgarh, Bokaro, Dhanbad, Giridih, Hazaribagh, East Singhbhum, West Singhbhum, Garhwa, Godda, Jamtara, Khunti, Koderma, Latehar, Lohardaga, Pakur, Palamu, Sahebganj, Seraikela Kharsawan, Simdega, Chatra).

### Jammu & Kashmir (`JK`)
- **Shri Mata Vaishno Devi Shrine Katra**: Exact `officialRecordId` match `JK-SMVD-REA-001` -> Correctly identified as duplicate of `IN-JK-REA-000001`.
- **Martand Sun Temple Complex**: Spatial distance 67m, Name similarity 93.8% -> Correctly identified as duplicate of `IN-JK-JAM-000117`.
- **Purmandal & Utterbehni Temple Complex**: Spatial distance 159m, Name similarity 84.9% -> Correctly identified as duplicate of `IN-JK-JAM-000119`.
- **Avantiswami Temple Complex**: Spatial distance 224m, Name similarity 93.8% -> Correctly identified as duplicate of `IN-JK-JAM-000106`.
- **Net Additions**: 20 unique temples across 18 unrepresented districts (including Anantnag, Srinagar, Ganderbal, Udhampur, Kathua, Kishtwar, Doda, Poonch, Baramulla, Kupwara, Rajouri, Ramban, Bandipora, Budgam, Kulgam, Shopian).

### Ladakh (`LA`)
- **Deduplication**: 0 duplicates found.
- **Net Additions**: 3 unique temples, fully covering the previously unrepresented district of **Kargil** (`Mulbekh Chamba Rock Cut Monolith`, `Dras Bhimbet Pandava Stone Monoliths`) and **Leh** (`Thiksey Monastery Maitreya Temple`).

### Goa (`GA`)
- **Mahadev Temple Tambdi Surla**: Spatial distance 459m, Name similarity 90.4% -> Correctly identified as duplicate of `IN-GA-GOA-000105`.
- **Net Additions**: 7 premier Devasthan temples across North Goa and South Goa (including Shri Manguesh Temple Priol, Shri Shanta Durga Temple Kavlem, Shri Mahalsa Narayani Temple Mardol, Shri Ramnathi Temple Bandora, Shri Damodar Temple Zambaulim, Shri Saptakoteshwar Temple Narve, Shri Kamakshi Temple Shiroda) enriching Goa's statutory Devasthan coverage.

### Telangana (`TS`)
- **Ramappa Temple Rudreshwara**: Spatial distance 156m, Name similarity 95.3% -> Correctly identified as duplicate of `IN-TG-MLG-000003`.
- **Bhadrachalam Sri Sita Ramachandra Swamy Temple**: Spatial distance 11m, Name similarity 74.4% -> Correctly identified as duplicate of `IN-TG-BDK-000002`.
- **Chilkur Balaji Temple Osman Sagar**: Spatial distance 237m, Name similarity 90.3% -> Correctly identified as duplicate of `IN-TS-NTR-000110`.
- **Net Additions**: 29 unique temples across 27 previously unrepresented Telangana districts (including Yadadri Bhuvanagiri, Hanumakonda, Rajanna Sircilla, Nirmal, Gadwal Jogulamba, Jagtial, Jayashankar Bhupalpally, Karimnagar, Medak, Mahabubnagar, Nizamabad, Nalgonda, Khammam, Sangareddy, Siddipet, Suryapet, Vikarabad, Wanaparthy, Warangal, Adilabad, Jangaon, Kamareddy, Kumuram Bheem Asifabad, Mahaboobabad, Mancherial, Medchal-Malkajgiri, Nagarkurnool, Narayanpet, Peddapalli).
