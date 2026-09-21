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

## Default admin

```
admin@devyatra.dev / Devyatra@2026
```

## Data

Temples live as in-memory typed seed modules under `src/data/` (no DB yet).
Runtime state (users, sessions, reports) is file-backed in `.data/`.

- Types: `src/lib/types.ts`
- Registry + routing helpers: `src/lib/registry.ts`
- Search: `src/lib/search.ts`
- AI planner/companion: `src/lib/ai/engine.ts`
- Auth: `src/lib/auth.ts`
- Reports: `src/lib/reports.ts`

See `docs/data-import.md` for the ingestion pipeline, and `prisma/schema.prisma`
for the target relational model that the in-memory layer will eventually back.

## Directories

- `src/app/` — page routes and `api/` route handlers
- `src/components/` — shared UI, temple blocks, shells
- `src/lib/` — data, engine, auth, i18n, formatting