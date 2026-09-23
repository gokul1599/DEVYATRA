# 🇮🇳 DEVYATRA / TEMPLEORA — TRAVEL INTELLIGENCE ARCHITECTURE

**Document Version**: 1.0.0-PROD  
**Domain**: Multi-Modal Routing, Terrain Curvature Dilation, Live Weather Context & Disruption Handling  
**System Component**: `src/lib/travel/intelligence.ts`  

---

## 1. Grounded Pilgrimage Physics vs. Euclidean Distance

Standard navigation APIs frequently miscalculate rural and high-altitude pilgrimage journeys across the Indian subcontinent:
1. **The Straight-Line Fallacy**:
   Two shrines may be separated by 30 km straight-line distance, but separated by a deep river valley or high mountain pass requiring 90 km of hairpin mountain road travel.
2. **Terrain Curvature Multipliers**:
   Devyatra incorporates empirical terrain dilation factors validated across thousands of real-world pilgrim journeys:
   - **High Himalayan Corridor (`1.85x`)**: Accounts for single-lane mountain roads, landslide slowdowns, and continuous hairpin curves (e.g. Haridwar to Badrinath/Kedarnath).
   - **Ghat Pass Corridor (`1.45x`)**: Accounts for steep mountain passes across the Western Ghats (e.g. Charmadi, Shiradi) and Eastern Ghats (e.g. Srisailam).
   - **Coastal & Urban Corridors (`1.25x`)**: Accounts for river delta crossings, coastal ferries, and sacred city traffic bottlenecks.
   - **Plains Highway (`1.15x`)**: Standard National / State Highway road network.

---

## 2. Speed Profiles & Transit Ceilings

To protect pilgrims—especially elderly travelers and families with young children—the travel intelligence engine applies realistic speed profiles:

| Travel Mode | Plains / Expressway | Ghat Pass | High Himalayas | Maximum Safe Daily Ceiling |
|:---|:---:|:---:|:---:|:---:|
| **Walking / Pada Yatra** | 4.5 km/h | 3.5 km/h | 2.5 km/h | **25 km/day** |
| **Bicycle** | 25 km/h | 16 km/h | 10 km/h | **60 km/day** |
| **Cab / Private Car** | 60 km/h | 40 km/h | 30 km/h | **250 km/day** (Mountain: 160 km/day) |
| **Public Transport (RTC Bus)** | 45 km/h | 30 km/h | 22 km/h | **200 km/day** |

---

## 3. Live Weather & Temporal Disruption Integration

The Weather Provider abstraction tracks:
- Ambient temperature (°C)
- Precipitation probability (%)
- Atmospheric conditions (`CLEAR`, `RAIN`, `THUNDERSTORM`, `HEAVY_MIST`, `SNOW`)
- Real-time sunrise and sunset times (crucial for evening aarti and mountain pass curfew timings)
- Data freshness flags: distinctly labeling data as `LIVE`, `FORECAST`, or `LAST_UPDATED`. Old data is never disguised as real-time.
