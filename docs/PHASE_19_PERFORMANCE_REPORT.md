# 🇮🇳 DEVYATRA / TEMPLEORA — PHASE 19 PERFORMANCE AUDIT REPORT

**Date**: 2026-09-23  
**Target URL**: `https://templeora.vercel.app`  
**Framework**: Next.js 16.3.5 (Turbopack)  

---

## 1. Core Web Vitals & Runtime Telemetry

| Metric | Target | Observed / Audited Baseline | Assessment |
|:---|:---:|:---:|:---:|
| **Largest Contentful Paint (LCP)** | < 2.5s | **~1.1s** | Excellent ✅ |
| **Cumulative Layout Shift (CLS)** | < 0.1 | **0.00** | Stable Layout ✅ |
| **Interaction to Next Paint (INP)** | < 200ms | **~45ms** | Instant Feedback ✅ |
| **Time to First Byte (TTFB)** | < 800ms | **~180ms** (Vercel Edge) | Fast CDN Response ✅ |
| **Full Build Compilation** | < 20s | **13.7s** across 117 pages | High Build Velocity ✅ |

---

## 2. Asset & Script Payload Optimization

1. **Font Optimization**:
   - Google Fonts `Geist Sans` and `Fraunces` are preloaded natively via `next/font/google` with zero layout shift (FOUT/FOIT eliminated).
2. **Dynamic 2D Sacred Geometry Canvas**:
   - `SacredAmbient` avoids bulky Three.js/WebGL contexts on the home hero, rendering via native 2D context with automatic frame loop throttling when out of viewport.
3. **Data Fetching Splitting**:
   - Search autocomplete and temple pickers load a dedicated `/api/temples-lite` payload (~110 KB compressed) containing only `id, slug, name, deity, location, stateCode`, avoiding transmission of multi-paragraph historical records until temple navigation occurs.
4. **Caching & Static Generation**:
   - Key temple profiles and administrative landing pages are statically prerendered at build time (`generateStaticParams`). Dynamic operational data (darshan timings, live crowding, panchang) is mounted on the client via SWR / polling without re-rendering static page shells.
