# 🇮🇳 DEVYATRA / TEMPLEORA — SEO & DISCOVERY ARCHITECTURE

**Date**: 2026-09-23  
**Domain**: `https://templeora.vercel.app`  

---

## 1. Geographic & Thematic URL Hierarchy

```
Global Root:            https://templeora.vercel.app/
Explore India:          https://templeora.vercel.app/explore
State Atlas:            https://templeora.vercel.app/explore/[state-slug]
District Directory:     https://templeora.vercel.app/explore/[state-slug]/[district-slug]
Temple Profile:         https://templeora.vercel.app/temples/[state-slug]/[temple-slug]
Thematic Collections:   https://templeora.vercel.app/collections/[collection-slug]
Sacred Circuit Plans:   https://templeora.vercel.app/plan?circuit=[circuit-id]
```

---

## 2. Structured Data (Schema.org) Enforcement

1. **`HinduTemple` Entity Schema**:
   - Injected on every canonical temple profile page.
   - Includes: `@type`, `name`, `alternateName`, `description`, `url`, `deity`, `locatedIn` (with `PostalAddress`), and `geo` (`GeoCoordinates`).
   - Links statutory devasthanam URLs via `sameAs` array for Google Knowledge Graph disambiguation.
2. **Dynamic Sitemap (`src/app/sitemap.ts`)**:
   - Pre-rendered with `force-static` for rapid crawl efficiency.
   - Integrates:
     - 14 Static Core Landing Pages (`priority: 0.7`)
     - 36 State Exploration Hubs (`priority: 0.6`)
     - Sacred Thematic Collections (Jyotirlingas, Pancha Bhoota, Char Dham, Chola Temples) (`priority: 0.8`)
     - 8 Sacred AI Pilgrimage Circuits (`priority: 0.8`)
     - Indexed Temple Profile Pages (`priority: 0.9`)
3. **Robots Directives (`src/app/robots.ts`)**:
   - Grants global search indexing while explicitly shielding internal operational and administrative endpoints (`/admin`, `/api/`).
