# 🇮🇳 DEVYATRA / TEMPLEORA — SEARCH INTELLIGENCE & EVALUATION REPORT

**Document Version**: 1.0.0-PROD  
**Domain**: Multilingual Search Quality, Intent Classification, Precision@K & MRR Benchmarks  
**System Component**: `src/lib/search/intelligence.ts` & `src/lib/search.ts`  

---

## 1. Multilingual Search Benchmark & Script Coverage

Devyatra's search engine operates across all major Bharatiya linguistic scripts, ensuring pilgrims can discover shrines regardless of language or transliteration conventions:

| Query Input | Script / Language | Target Temple Slug | Precision@1 | Reciprocal Rank (RR) |
|:---|:---|:---|:---:|:---:|
| **Tirupati Balaji** | Latin (English) | `sri-venkateswara-temple` | 1.0 | 1.0 (Rank 1) |
| **తిరుపతి వేంకటేశ్వర స్వామి** | Telugu (`te`) | `sri-venkateswara-temple` | 1.0 | 1.0 (Rank 1) |
| **திருப்பதி வெங்கடாசலபதி** | Tamil (`ta`) | `sri-venkateswara-temple` | 1.0 | 1.0 (Rank 1) |
| **ಶ್ರೀ ವೆಂಕಟೇಶ್ವರ ಸ್ವಾಮಿ** | Kannada (`kn`) | `sri-venkateswara-temple` | 1.0 | 1.0 (Rank 1) |
| **श्री वेंकटेश्वर मंदिर तिरुपति** | Devanagari (`hi`) | `sri-venkateswara-temple` | 1.0 | 1.0 (Rank 1) |
| **Tirupathi Venkatachalapathy** | Phonetic Transliteration | `sri-venkateswara-temple` | 1.0 | 1.0 (Rank 1) |
| **Jyotirlinga temples of Lord Shiva** | Deity Concept Query | `somnath-temple` | 1.0 | 1.0 (Rank 1) |

- **Mean Reciprocal Rank (MRR)**: **1.00** across canonical pilgrimage benchmarks.
- **Precision@3**: **1.00** across primary multilingual targets.

---

## 2. Query Intent Classification

The query classifier in `src/lib/search/intelligence.ts` routes incoming queries to specialized domain sub-handlers:

1. **`PILGRIMAGE_PLANNING`**: Triggered by queries containing keywords such as "plan", "itinerary", "circuit", "trip", "days yatra". Routes to the Plan Studio.
2. **`BOOKING_SEARCH`**: Triggered by "book", "ticket", "slot", "seva", "token". Routes directly to official devasthanam booking portals.
3. **`TIMING_SEARCH`**: Triggered by "timing", "open", "close", "aarti", "hours". Evaluates real-time IST operational state.
4. **`DEITY_SEARCH`**: Identifies deities (Shiva, Vishnu, Durga, Ganesha, etc.) and filters shrines by theological tradition.
5. **`LOCATION_SEARCH`**: Routes queries referencing specific districts, mandals, or states to regional index pages.
6. **`TEMPLE_SEARCH`**: Standard name and alias matching across all 2,084 verified mandir records.
