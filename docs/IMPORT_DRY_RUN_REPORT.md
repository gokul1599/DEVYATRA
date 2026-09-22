# 🇮🇳 DEVYATRA / TEMPLEORA — PHASE 9B DRY-RUN QUALITY REPORT

**Execution Timestamp:** 2026-09-22T08:21:55Z  
**Environment:** Neon Serverless PostgreSQL  
**Parser Engine:** Standardized State Expansion Importer Framework (v1.0.0)  
**Verification Mode:** Dry-Run Quality Gate (Simulated Execution)

---

## 1. Executive Summary

A comprehensive multi-state dry-run was executed across all 6 implemented authoritative state ingestion engines. The objective was to test the quality gates, deduplication engine, spatial proximity calculations, LGD district hierarchy mapping, and transaction logging without modifying production data.

### Overall Results

| State Engine | Official Source Body | Records Evaluated | New Validated Candidates | Duplicates Detected | Rejected Records | Ingestion Errors | Execution Time |
|---|---|---|---|---|---|---|---|
| **Tamil Nadu** (`TN`) | TN HR&CE Department & Tourism | 5 | 1 | 4 | 0 | 0 | 14,321 ms |
| **Karnataka** (`KA`) | Karnataka Muzrai Dept & KSTDC | 5 | 0 | 5 | 0 | 0 | 8,406 ms |
| **Andhra Pradesh** (`AP`) | AP Endowments Dept & TTD | 5 | 2 | 3 | 0 | 0 | 9,107 ms |
| **Kerala** (`KL`) | Travancore & Cochin Devaswom | 5 | 2 | 3 | 0 | 0 | 9,468 ms |
| **Maharashtra** (`MH`) | MTDC & Temple Sansthan Trusts | 5 | 1 | 4 | 0 | 0 | 8,591 ms |
| **Rajasthan** (`RJ`) | Rajasthan Devasthan & Tourism | 5 | 3 | 2 | 0 | 0 | 9,723 ms |
| **TOTAL** | **6 Official State Authorities** | **30** | **9 (30.0%)** | **21 (70.0%)** | **0 (0.0%)** | **0** | **59,616 ms** |

---

## 2. Deduplication & Matching Breakdown

The spatial deduplication engine (< 500m bounding proximity, Jaro-Winkler string distance >= 0.70) and official record ID matching successfully identified 21 duplicate matches among the existing 1,655 temple database:

### A. Tamil Nadu (4 matches, 1 new)
* **Match 1:** `Brihadisvara Temple` matched existing `Brihadeeswarar Temple` (`IN-TN-THA-000109`) — Spatial: 12m, Sim: 93.3%
* **Match 2:** `Sri Ranganathaswamy Temple` matched existing `Sri Ranganathaswamy Temple Srirangam` (`IN-TN-TIR-000003`) — Spatial: 35m, Sim: 85.7%
* **Match 3:** `Meenakshi Amman Temple Madurai` matched existing `Meenakshi Amman Temple` (`IN-TN-MAD-000110`) — Spatial: 42m, Sim: 86.7%
* **Match 4:** `Ramanathaswamy Temple` matched existing `Ramanathaswamy Temple` (`IN-TN-RAM-000001`) — Spatial: 12m, Sim: 100.0%
* **New Candidate:** `Annamalaiyar Temple Tiruvannamalai` (`TEMPLE-IND-TN-TIR-000003`, District: Tiruvannamalai)

### B. Karnataka (5 matches, 0 new)
* **Match 1:** `Chamundeshwari Temple` matched existing `Chamundeshwari Temple` (`IN-KA-MYS-000108`) — Spatial: 59m, Sim: 100.0%
* **Match 2:** `Kollur Mookambika Temple` matched existing `Kollur Mookambika Temple` (`IN-KA-UDU-000129`) — Spatial: 170m, Sim: 100.0%
* **Match 3:** `Virupaksha Temple Hampi` matched existing `Virupaksha Temple` (`IN-KA-KAR-000180`) — Spatial: 148m, Sim: 94.8%
* **Match 4:** `Chennakeshava Temple Belur` matched existing `Chennakeshava Temple` (`IN-KA-HAS-000147`) — Spatial: 111m, Sim: 95.4%
* **Match 5:** `Mahabaleshwar Temple Gokarna` matched existing `Mahabaleshwar Temple` (`IN-KA-KRI-000159`) — Spatial: 209m, Sim: 94.3%

### C. Andhra Pradesh (3 matches, 2 new)
* **Match 1:** `Sri Venkateswara Swamy Temple` matched existing `Sri Venkateswara Swamy Temple` (`IN-AP-TPT-000001`) — Exact officialRecordId match: `AP-ENDOW-TTD-001`
* **Match 2:** `Sri Durga Malleswara Swamy Varla Devasthanam` matched existing (`IN-AP-NTR-000005`) — Spatial: 327m, Sim: 100.0%
* **Match 3:** `Sri Kalahasteeswara Temple` matched existing (`IN-AP-TPT-000003`) — Spatial: 11m, Sim: 100.0%
* **New Candidate 1:** `Sri Bhramaramba Mallikarjuna Swamy Temple` (`TEMPLE-IND-AP-NAN-000005`, District: Nandyal)
* **New Candidate 2:** `Varaha Lakshmi Narasimha Temple Simhachalam` (`TEMPLE-IND-AP-VIS-000004`, District: Visakhapatnam)

### D. Kerala (3 matches, 2 new)
* **Match 1:** `Sree Padmanabhaswamy Temple` matched existing (`IN-KL-TVM-000001`) — Spatial: 22m, Sim: 100.0%
* **Match 2:** `Guruvayur Sri Krishna Temple` matched existing (`IN-KL-TCR-000002`) — Spatial: 135m, Sim: 93.5%
* **Match 3:** `Vadakkunnathan Temple Thrissur` matched existing (`IN-KL-KER-000219`) — Spatial: 82m, Sim: 94.0%
* **New Candidate 1:** `Sabarimala Sree Dharma Sastha Temple` (`TEMPLE-IND-KL-PAT-000007`, District: Pathanamthitta)
* **New Candidate 2:** `Chottanikkara Bhagavathy Temple` (`TEMPLE-IND-KL-ERN-000008`, District: Ernakulam)

### E. Maharashtra (4 matches, 1 new)
* **Match 1:** `Shri Saibaba Sansthan Temple Shirdi` matched existing (`IN-MH-AHM-000001`) — Spatial: 0m, Sim: 96.7%
* **Match 2:** `Trimbakeshwar Shiva Temple` matched existing (`IN-MH-NSK-000002`) — Spatial: 45m, Sim: 71.0%
* **Match 3:** `Shri Siddhivinayak Ganapati Mandir` matched existing (`IN-MH-MUM-000003`) — Spatial: 48m, Sim: 80.9%
* **Match 4:** `Grishneshwar Jyotirlinga Temple` matched existing (`IN-MH-MAN-000191`) — Spatial: 24m, Sim: 76.6%
* **New Candidate:** `Mahalakshmi Temple Kolhapur` (`TEMPLE-IND-MH-KOL-000001`, District: Kolhapur)

### F. Rajasthan (2 matches, 3 new)
* **Match 1:** `Jagatpita Brahma Mandir Pushkar` matched existing (`IN-RJ-AJM-000001`) — Spatial: 493m, Sim: 100.0%
* **Match 2:** `Karni Mata Temple Deshnoke` matched existing (`IN-RJ-RAJ-000128`) — Spatial: 98m, Sim: 93.1%
* **New Candidate 1:** `Shrinathji Temple Nathdwara` (`TEMPLE-IND-RJ-RAJ-000003`, District: Rajsamand)
* **New Candidate 2:** `Dilwara Jain Temples Mount Abu` (`TEMPLE-IND-RJ-SIR-000003`, District: Sirohi)
* **New Candidate 3:** `Shri Eklingji Temple Kailashpuri` (`TEMPLE-IND-RJ-UDA-000016`, District: Udaipur)

---

## 3. Data Integrity & Quality Verification

* **Centroid Coordinates Detected:** 0
* **Coordinates Out-of-India Bounds:** 0
* **District LGD Mapping Failures:** 0
* **Synthesized Place IDs:** 0
* **Prisma ImportJob Telemetry Created:** 6 Jobs (`cmucemipv0000acfftqk5hd7r`, `cmucemw6b000088ffirhh1yd7`, `cmucen4ij0000psff1xjo3btn`, `cmucenebn0000l0ffdkezubnf`, `cmucennqc0000e0ffdpcgy1s6`, `cmucenwfm0000vkff0ef3rmws`)

---

## 4. Phase 9C Readiness Decision

The dry-run gate has completed with **100% pass rate**.
As required by the engineering specification, we will proceed with **Andhra Pradesh first** for production ingestion, verify its numbers and idempotency, and review quality metrics before performing any subsequent state ingestion.
