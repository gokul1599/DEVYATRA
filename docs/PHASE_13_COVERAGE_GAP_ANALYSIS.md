# 🇮🇳 DEVYATRA / TEMPLEORA — PHASE 13 COVERAGE GAP ANALYSIS
## 917 Official LGD District Baseline & Expansion Strategy

**Execution Date**: September 22, 2026  
**Current Production Database**: 1,816 Temples  
**National District Baseline**: **465 / 917 Official LGD Districts (50.71%)**  
**Phase 13 Target Milestone**: **>= 551 / 917 Official LGD Districts (60.09%)**  
**Required Net District Expansion**: **+86 New Represented Districts**  
**Zero Centroid Invariant**: 100% Maintained (0 Centroid Fallbacks)  

---

## 1. National Coverage Census Across All 36 States & Union Territories

The Local Government Directory (LGD) maintained by the Ministry of Panchayati Raj defines 917 official administrative districts across India. The table below documents the live status in Neon PostgreSQL:

| Code | State / UT Name | Official Districts | Represented | Unrepresented Gap | Coverage % | Verified Temples | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| `HP` | Himachal Pradesh | 12 | 12 | **0** | **100%** | 59 | `indexed` |
| `GA` | Goa | 5 | 5 | **0** | **100%** | 21 | `indexed` |
| `CH` | Chandigarh | 1 | 1 | **0** | **100%** | 1 | `indexed` |
| `DH` | Dadra & Nagar Haveli and Daman & Diu | 1 | 1 | **0** | **100%** | 1 | `indexed` |
| `LD` | Lakshadweep | 1 | 1 | **0** | **100%** | 1 | `indexed` |
| `KL` | Kerala | 21 | 20 | **1** | **95%** | 156 | `indexed` |
| `UK` | Uttarakhand | 17 | 15 | **2** | **88%** | 57 | `indexed` |
| `WB` | West Bengal | 31 | 25 | **6** | **81%** | 109 | `indexed` |
| `AP` | Andhra Pradesh | 34 | 25 | **9** | **74%** | 82 | `partially_indexed` |
| `TN` | Tamil Nadu | 46 | 34 | **12** | **74%** | 183 | `partially_indexed` |
| `GJ` | Gujarat | 40 | 29 | **11** | **73%** | 94 | `partially_indexed` |
| `RJ` | Rajasthan | 41 | 30 | **11** | **73%** | 122 | `partially_indexed` |
| `PY` | Puducherry | 7 | 5 | **2** | **71%** | 15 | `partially_indexed` |
| `MH` | Maharashtra | 46 | 31 | **15** | **67%** | 168 | `partially_indexed` |
| `HR` | Haryana | 31 | 20 | **11** | **65%** | 37 | `partially_indexed` |
| `KA` | Karnataka | 46 | 30 | **16** | **65%** | 167 | `partially_indexed` |
| `OD` | Odisha | 35 | 22 | **13** | **63%** | 108 | `partially_indexed` |
| `BR` | Bihar | 44 | 22 | **22** | **50%** | 51 | `partially_indexed` |
| `AN` | Andaman & Nicobar | 4 | 2 | **2** | **50%** | 2 | `partially_indexed` |
| `LA` | Ladakh | 2 | 1 | **1** | **50%** | 1 | `partially_indexed` |
| `TR` | Tripura | 11 | 5 | **6** | **45%** | 8 | `partially_indexed` |
| `PB` | Punjab | 27 | 12 | **15** | **44%** | 16 | `partially_indexed` |
| `DL` | Delhi | 16 | 7 | **9** | **44%** | 14 | `partially_indexed` |
| `AS` | Assam | 38 | 15 | **23** | **39%** | 54 | `expansion_in_progress` |
| `SK` | Sikkim | 8 | 3 | **5** | **38%** | 4 | `expansion_in_progress` |
| `MP` | Madhya Pradesh | 55 | 19 | **36** | **35%** | 72 | `expansion_in_progress` |
| `UP` | Uttar Pradesh | 82 | 27 | **55** | **33%** | 84 | `expansion_in_progress` |
| `JH` | Jharkhand | 31 | 10 | **21** | **32%** | 20 | `expansion_in_progress` |
| `TS` | Telangana | 38 | 11 | **27** | **29%** | 47 | `expansion_in_progress` |
| `MN` | Manipur | 19 | 5 | **14** | **26%** | 6 | `expansion_in_progress` |
| `JK` | Jammu & Kashmir | 24 | 6 | **18** | **25%** | 28 | `expansion_in_progress` |
| `CG` | Chhattisgarh | 36 | 8 | **28** | **22%** | 21 | `expansion_in_progress` |
| `ML` | Meghalaya | 12 | 2 | **10** | **17%** | 2 | `expansion_in_progress` |
| `MZ` | Mizoram | 11 | 1 | **10** | **9%** | 1 | `expansion_in_progress` |
| `AR` | Arunachal Pradesh | 25 | 2 | **23** | **8%** | 3 | `expansion_in_progress` |
| `NL` | Nagaland | 16 | 1 | **15** | **6%** | 1 | `expansion_in_progress` |
| `DN` | Dadra & Nagar Haveli (UT) | 3 | 0 | **3** | **0%** | 0 | `expansion_in_progress` |
| **TOTAL** | **PAN-INDIA** | **917** | **465** | **452** | **50.71%** | **1,816** | **ALL 36 ACTIVE** |

---

## 2. Phase 13 Queue Analysis & Strategic Selection

### A. Core Roadmap Queue Potential
The roadmap specifies 5 target expansion regions:
1. **Chhattisgarh (`CG`)**: 28 unrepresented districts (Total: 36, Rep: 8, Cov: 22%)
2. **Jharkhand (`JH`)**: 21 unrepresented districts (Total: 31, Rep: 10, Cov: 32%)
3. **Jammu & Kashmir (`JK`)**: 18 unrepresented districts (Total: 24, Rep: 6, Cov: 25%)
4. **Ladakh (`LA`)**: 1 unrepresented district (Total: 2, Rep: 1, Cov: 50%) — Kargil
5. **Goa (`GA`)**: 0 unrepresented districts (Total: 5, Rep: 5, Cov: 100%) — Depth & Trust Enrichment
6. **Telangana (`TS`)**: 27 unrepresented districts (Total: 38, Rep: 11, Cov: 29%)

### B. Mathematical Yield Towards the 60% Milestone
- Baseline: **465 / 917 (50.71%)**
- 60% Milestone Requirement: **551 / 917 (+86 districts)**
- Net potential new districts from CG + JH + JK + LA + TS:
  `28 + 21 + 18 + 1 + 27 = 95 unrepresented districts`
- **Result**: Ingesting authoritative, verified shrines across these 5 primary gap states can unlock up to **95 new districts**, lifting total represented districts to **~555 – 560 / 917 (60.5% – 61.1%)**, decisively and honestly surpassing the 60% National District Milestone.
- **Goa Strategy**: Ingesting Goa's premier Kadamba and Konkani heritage temples (Mangueshi, Shanta Durga, Tambdi Surla) enriches catalog depth and architectural diversity without inflating district counts.

---

## 3. Unrepresented District Targets by Candidate State

### 1. Chhattisgarh (`CG`) — 28 Unrepresented Districts
- Baloda Bazar (Giroudpuri Dham)
- Balrampur (Tatapani Shiva Temple)
- Bastar (Chitrakote Shiva & Jagdalpur Danteshwari)
- Bemetara (Bhadrakali Temple)
- Bijapur (Bhairamgarh Temple)
- Dhamtari (Sihawa Shringi Rishi Ashram & Karneshwar)
- Gariaband (Rajim Rajiv Lochan Temple & Kuleshwar Mahadev)
- Gaurella Pendra Marwahi (Jaleshwar Mahadev)
- Janjgir Champa (Chandrahasini Devi & Shivrinarayan)
- Jashpur (Kotebira & Danpuri)
- Kabirdham (Bhoramdeo Temple Complex — ASI)
- Kanker (Kankali Mandir)
- Khairgarh Chhuikhadan (Mandhata Shiva Temple)
- Kondagaon (Alor Lingeshwar Mahadev)
- Korba (Sarvamangala Temple & Kosgai Devi)
- Koriya (Chirmiri Jagannath Mandir)
- Mahasamund (Sirpur Lakshman Brick Temple — ASI)
- Manendragarh (Amritdhara Shiva Temple)
- Mohla Manpur (Shiv Mandir Mohla)
- Mungeli (Setganga Shriram Janki)
- Narayanpur (Gadiya Mountain Cave Shrines)
- Raigarh (Pahar Mandir & Chandrahasini border)
- Sakti (Adbhar Ashtabhuji Mandir)
- Sarangarh Bilaigarh (Bilaigarh Jagannath)
- Sukma (Dornapal Shiva Temple)
- Surajpur (Kudargarh Maa Bagheshwari)
- Surguja (Mahamaya Temple Ambikapur)
- Vishrampur (Vishrampur Shiv Mandir)

### 2. Jharkhand (`JH`) — 21 Unrepresented Districts
- Bokaro (Luguburu Ghantabari Dharamgarh)
- Chatra (Bhadrakali Temple Itkhori)
- Dhanbad (Shakti Mandir & Lilori Sthan)
- Dumka (Basukinath Dham & Maluti Terracotta Temples)
- East Singhbhum (Rankini Mandir Jadugoda & Bhuvaneshwari Temple Jamshedpur)
- Garhwa (Bansidhar Temple Nagar Untari)
- Giridih (Parasnath Shikharji Sacred Tirth & Jharkhandi Dham)
- Godda (Maa Yogini Dham Pathergama)
- Hazaribagh (Narsingh Sthan & Silwar Mandir)
- Jamtara (Maa Chanchala Devi Temple)
- Khunti (Panchghagh Shiva Sthal & Ulihatu)
- Koderma (Dhwajadhari Dham & Chanchala Devi)
- Latehar (Maa Ugra Tara Nagar Untari / Chandwa)
- Lohardaga (Akhileshwar Dham & Khakparta Shiva)
- Pakur (Nityakali Mandir)
- Palamu (Palamau Fort Shiva Temple & Medininagar)
- Ramgarh (Maa Chhinnamastika Temple Rajrappa)
- Sahebganj (Bindudham & Koteshwar Nath)
- Seraikela Kharsawan (Maa Paudi Devi)
- Simdega (Ramrekha Dham)
- West Singhbhum (Benisagar Archaeological Complex — ASI)

### 3. Jammu & Kashmir (`JK`) — 18 Unrepresented Districts
- Anantnag (Holy Cave Shrine of Shri Amarnathji & Martand Sun Temple — ASI)
- Bandipora (Sharda Devi Sthal border & Kaloosa Shiva)
- Baramulla (Buniyar Shiva Temple & Datta Mandir — ASI)
- Budgam (Charar-e-Sharief historical cultural site)
- Doda (Gupt Ganga Temple Bhaderwah)
- Ganderbal (Mata Kheer Bhawani Tulmulla)
- Kathua (Jasrota Kali Temple & Sukrala Mata)
- Kishtwar (Sarthal Devi Mandir & Machail Mata)
- Kulgam (Kulgam Mahadev Temple)
- Kupwara (Mata Bhadrakali Temple Teetwal)
- Poonch (Budha Amarnath Temple Mandi)
- Pulwama (Avantiswami Temple Complex — ASI)
- Rajouri (Mangla Devi Mandir & Sunderbani)
- Ramban (Chanderkote Shiva & Neelkanth)
- Samba (Purmandal & Utterbehni "Chhota Kashi")
- Shopian (Kapal Mochan Shopian)
- Srinagar (Shankaracharya Temple Jyeshtheshwara & Sharika Devi Hari Parbat)
- Udhampur (Sudh Mahadev & Krimchi Temple Complex — ASI)

### 4. Ladakh (`LA`) — 1 Unrepresented District
- Kargil (Dras Bhimbet & Mulbekh Maitreya Rock Carving — ASI)

### 5. Telangana (`TS`) — 27 Unrepresented Districts
- Adilabad (Jainath Suryanarayana Swamy)
- Bhadradri Kothagudem (Bhadrachalam Sri Sita Ramachandra Swamy)
- Hanamkonda (Thousand Pillar Temple & Bhadrakali — ASI)
- Jagtial (Dharmapuri Sri Lakshmi Narasimha Swamy)
- Jangaon (Palakurthi Somanatha & Kolanupaka)
- Jayashankar Bhupalpally (Kaleshwaram Mukteshwara Swamy)
- Jogulamba Gadwal (Alampur Jogulamba 5th Shakti Peetha & Navabrahma — ASI)
- Kamareddy (Biknoor Siddha Rameshwara)
- Karimnagar (Kondagattu Sri Anjaneya Swamy)
- Khammam (Kambhammettu Narasimha Swamy)
- Kumuram Bheem Asifabad (Gangapur Shiva Temple)
- Mahabubabad (Kuravi Veerabhadra Swamy)
- Mahabubnagar (Manyamkonda Venkateswara Swamy)
- Mancherial (Gudem Gutta Satyanarayana Swamy)
- Medak (Edupayala Vana Durga Bhavani)
- Medchal-Malkajgiri (Keesaragutta Sri Ramalingeswara Swamy)
- Mulugu (Ramappa Temple Rudreshwara — UNESCO World Heritage)
- Nagarkurnool (Uma Maheshwaram & Srisailam North Gateway)
- Nalgonda (Chaya Someswara Swamy Panagal)
- Narayanpet (Ghanpur Venkateswara)
- Nirmal (Basar Gnana Saraswati Temple)
- Nizamabad (Dichpally Ramalayam & Neela Kanteshwara)
- Peddapalli (Dhulikatta Stupa & Shiva shrines)
- Rajanna Sircilla (Vemulawada Sri Raja Rajeshwara Swamy)
- Ranga Reddy (Chilkur Balaji & Karmanghat Hanuman)
- Sangareddy (Kethaki Sangameshwara Swamy Jharasangam)
- Siddipet (Komuravelli Mallanna Swamy)
- Suryapet (Phanigiri & Chittepu Venkateswara)
- Vikarabad (Anantha Padmanabha Swamy Temple Ananthagiri)
- Wanaparthy (Rangapur Sri Ranganayaka Swamy)
- Warangal (Warangal Fort Swayambhu Shiva — ASI)
- Yadadri Bhuvanagiri (Yadagirigutta Sri Lakshmi Narasimha Swamy)

---

## 4. Invariant & Governance Protocols
1. **Zero Centroid Fallbacks**: Every candidate record must possess rooftop-level, surveyed GPS coordinates verified against official gazetteers, trust websites, or satellite verification.
2. **Statutory Provenance**: Every imported record must be linked to official trust boards (e.g., TSTDC/Telangana Endowments, SMVDSB, SASB, Baidyanath Trust, Danteshwari Trust, ASI).
3. **Deterministic Idempotency**: Each importer must run twice sequentially, proving `recordsAdded === 0` on the second run.
