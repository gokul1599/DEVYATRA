# Devyatra

A premium AI-powered India Temple & Pilgrimage Explorer — built with Next.js (App Router), React 19, Tailwind v4.

## Features

- **Explore hierarchy** — state → district → sub-unit (mandal/taluk/tehsil) → location drill-down
- **Temple directory & filtering** — tradition, architecture, deity, badge, type
- **Temple detail pages** — history timeline, timings with verification stamps, entry fees, booking trust hints, festivals, curated nearby, JSON-LD
- **AI companion & planner** — context-scoped, never fabricates timings, prices, or booking URLs
- **Verification engine** — `VERIFIED_OFFICIAL → GOVERNMENT_SOURCE → TRUSTED_SOURCE → COMMUNITY_REPORTED → UNVERIFIED` with source attribution
- **Community reports** — report corrections; admins triage through the console
- **Auth** — scrypt-hashed accounts (file-backed), in-memory sessions, seeded admin
- **Journey** — per-device saved temples, account-linked when signed in
- **Multilingual chrome** — 12 Indian languages via cookie `tem_lang`; server prose stays English
- **Design** — dark cinematic + elegant light mode, `prefers-reduced-motion` respected

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build (includes lint + type-check)
- `npx tsc --noEmit` — type check only

## Administration & Security

Authentication is backed by PostgreSQL via Prisma with scrypt password hashing and secure HTTP-only sessions. Admin accounts are provisioned securely via database migration seeds or admin CLI scripts using environment variables (`ADMIN_INITIAL_EMAIL` and `ADMIN_INITIAL_PASSWORD`). No static default credentials are hardcoded into production builds.

## Data & Architecture

- **Database**: PostgreSQL (Neon serverless) managed via Prisma ORM (`prisma/schema.prisma`).
- **Destination Atlas**: Grounded geospatial registry (`src/lib/destinations/`) spanning sacred shrines, UNESCO monuments, caves, waterfalls, lakes, wildlife reserves, and cultural hubs across all 36 states and union territories.
- **Cartography**: MapLibre GL with sovereign geodetic boundary coordinates and vector clustering.
- **Media & Provenance**: Zero visual hallucination image resolver (`src/lib/images/resolver.ts`) attributing verified official, Wikimedia Commons, and licensed photography.
- **Routing & Travel**: OpenStreetMap/OSRM road network routing and Open-Meteo live weather integration.

## Directories

- `src/app/` — page routes and `api/` route handlers
- `src/components/` — shared UI, temple blocks, shells
- `src/lib/` — data, engine, auth, i18n, formatting