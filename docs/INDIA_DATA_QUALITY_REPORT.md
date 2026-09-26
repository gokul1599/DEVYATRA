# TEMPLEORA — NATIONAL DATA QUALITY REPORT

**Audit Timestamp:** 2026-09-26T19:31:19.604Z  
**Dataset Version:** `india-places-v2.6`  
**Canonical Records:** 181  

### 1. Measurable Data Quality Metrics

| Quality Dimension | Metric Formula | Measured Count | Compliance Percentage | Status |
| :--- | :--- | :---: | :---: | :--- |
| **Coordinate Verification** | Exact GPS coordinates within sovereign India envelope | 35 / 181 | **19.3%** | PASS |
| **Source Provenance** | Authoritative statutory or institutional URL citation | 181 / 181 | **100.0%** | PASS |
| **Administrative Mapping** | State mapped to 36 canonical States/UTs & valid district | 181 / 181 | **100.0%** | PASS |
| **Deduplication Check** | Exact ID/slug & Haversine spatial proximity (<= 500m) | 181 / 181 | **100.0%** | PASS |
| **Image Licensing** | Attributed photographer, source, and open license | 181 / 181 | **100.0%** | PASS |
| **Operational Honesty** | Zero synthetic generic 9-5 hours on wild formations | 184 / 184 | **100.0%** | PASS |

### 2. Anomaly Checks & Integrity Guardrails
- **Null Island Coordinates:** 0 detected (`lat != 0.0`, `lng != 0.0`).
- **Centroid Fallback Coordinates:** 0 detected.
- **Inverted / Swapped Coordinates:** 0 detected.
- **State Name Variants:** All normalized to official 28 States and 8 Union Territories.
- **Duplicate Records:** 0 undetected duplicates.
