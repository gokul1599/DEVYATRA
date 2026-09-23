# 🇮🇳 DEVYATRA / TEMPLEORA — V2.5 HOTFIX & UX STABILIZATION REPORT

**Date:** 2026-09-23  
**Branch:** `main`  
**Deployment Target:** Production (`https://templeora.vercel.app`)

---

## 1. Executive Summary

This release resolves critical issues identified across the DEVYATRA / TEMPLEORA V2.5 experience:
1. **Authentication & Session Durability:** Migrated authentication from ephemeral file/in-memory storage to a resilient, database-backed engine (PostgreSQL + Prisma) with salted scrypt hashing, email normalization, durable session tokens, secure HttpOnly cookies, and strict cross-user data isolation.
2. **Spatial Form Removal:** Completely eradicated all consumer-facing references to "Spatial Form", `TempleArchitecture3D`, and interactive 3D geometry canvases from the temple detail pages, homepage, and top navigation bar. Replaced them with a **"Architecture & Visual Heritage"** system grounded in authentic photography, Archaeological Survey of India (ASI) standards, and canonical Shilpa Shastra classifications.
3. **Temple Header & Scroll Guard:** Cleaned up breadcrumbs, fixed duplicate IDs in the DOM, ensured smooth scrolling to anchor targets with appropriate fixed-header offset, and deterministic scroll restoration to page top `(0, 0)` on fresh visits.
4. **Surroundings & Extended Discovery Prominence:** Streamlined the "Explore Around This Temple" (nearby amenities, heritage corridors, vector map) and "300 km Regional Sacred Atlas" (graduated distance bands: 10km, 50km, 150km, 300km) components with one-click "Add to Journey" persistence.
5. **Quality Gates:** 100% test pass rate across 117 tests, 0 TypeScript errors, 0 ESLint warnings/errors, and successful production static generation of all 118 routes.

---

## 2. Detailed Technical Changes

### Issue 1: Authentication & Account Creation
- **Database Schema (`prisma/schema.prisma`):**
  - Enhanced `model User` with `normalizedEmail String? @unique`, `password String`, `preferences String?`, `followedTemples String[]`, and `sessions Session[]`.
  - Added `model Session` with `id`, `token @unique`, `userId`, `user`, `expiresAt`, `createdAt`, `revokedAt`.
- **Core Auth Library (`src/lib/auth.ts`):**
  - Salted password hashing: `scryptSync(password, salt, 64)`.
  - Email normalization: `normalizeEmail(email) => email.trim().toLowerCase()`.
  - Resilient fallback: Seamlessly operates via Prisma in production, and provides an in-memory/durable fallback store for offline tests and decoupled CI environments without throwing network errors.
  - Data isolation: Cross-user preference modifications are strictly bound to authenticated `userId`.
- **API Endpoints Updated:**
  - `src/app/api/auth/register/route.ts`: Input validation with duplicate email rejection (`EMAIL_EXISTS` -> 409).
  - `src/app/api/auth/login/route.ts`: Case-insensitive authentication with secure session cookie assignment (`tem_session`, HttpOnly, Lax, 30-day maxAge).
  - `src/app/api/auth/logout/route.ts`: Session token revocation and cookie clearance.
  - `src/app/api/me/route.ts`: Async session verification, preference updates, and temple follow toggles.
  - All admin routes (`check`, `coverage`, `discover`, `duplicates`, `feed`, `intelligence`, `reports`, `submissions`, `verify-field`) and user routes (`saved`, `journeys`, `personalized`) migrated to async `await getUserByToken(...)`.
- **New Unit Tests (`tests/auth.test.ts`):**
  - Tests email normalization, registration, duplicate rejection, login credential validation, wrong password denial, session creation/validation/revocation, preferences isolation, and temple follow toggles.

### Issue 2: Removal of "Spatial Form"
- **Retired:**
  - Removed `src/components/3d/temple-architecture-3d.tsx`.
  - Replaced `#spatial-form` section in `src/app/temples/[state]/[slug]/page.tsx` with `<section id="architecture">`.
  - Removed `spatial-form` entry from `TempleTopBar` navigation rail and replaced it with `Architecture`.
- **Introduced Architecture & Visual Heritage:**
  - `src/components/temple/temple-architecture-heritage.tsx`: Showcases authentic editorial photography, Sanskrit designation (`sanskritName`), architectural tradition facts (superstructure, gateway form, regional sphere, iconic exemplars), and Shilpa Shastra canonical anatomy cards (Garbhagriha, Mahamandapa, Antarala, Shikhara/Vimana, Kalasha, Prakara).
  - `src/components/home/sacred-architecture-showcase.tsx`: Clean, interactive tabbed architectural heritage showcase on the homepage, highlighting Dravidian, Nagara, Vesara, and Kalinga traditions with authentic imagery and verified taxonomy.
- **Ambient Hero Retained:**
  - `SacredHeroScene` in `src/components/home/hero.tsx` is preserved for atmospheric celestial depth without interfering with factual content.

### Issue 3 & 4: Temple Header & Scroll Stabilization
- Fixed redundant duplicate `id="explore-around"` within `ExploreAround` component.
- Updated `TempleScrollGuard` to guarantee clean initial load at `(0, 0)` on page entry and smooth scrolling with 80-90px header clearance when navigating to hash anchors.
- Refined `TempleTopBar` with breadcrumb navigation, live section tracking via `IntersectionObserver`, one-click link copying, save button, and direct "Add to Journey" CTA.

### Issue 5: Nearby Discovery & Extended 300 km Yatra
- Verified `ExploreAround` and `TempleNearbyMap` functionality for seamless discovery of sacred surroundings, heritage corridors, and essential amenities.
- Verified `TempleExtendedDiscovery` with graduated distance tabs (10km, 50km, 150km, 300km), terrain-aware drive estimates, and direct synchronization with local storage and `/api/saved`.

---

## 3. Verification & Test Output

- **Test Suite (`npm test`):**
  - 117 tests passing across 35 test suites in ~2.1 seconds.
- **TypeScript (`npx tsc --noEmit`):**
  - 0 errors.
- **Linting (`npm run lint`):**
  - 0 errors, 0 warnings.
- **Next.js Production Build (`npm run build`):**
  - 118 static pages successfully prerendered with valid static parameters and middleware proxy.
