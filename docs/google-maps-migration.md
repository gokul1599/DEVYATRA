# Migrating from Google Maps JS to Places API (New)

Both features are active side by side. The maps UI is a self-drawn canvas that talks to our own API; the only Google surface used in the browser is the image proxy (`/api/places/photo`). No Google Maps JavaScript SDK is loaded client-side.

## Why this shape

- **Server-only key.** `GOOGLE_MAPS_API_KEY` lives in `.env.local` / Vercel env and never reaches the browser. Every Places call happens in `src/lib/google/client.ts`.
- **Cache + degraded mode.** Repeated searches hit `.data/google-cache.json` (TTL-based, `SEARCH_CACHE_TTL_MS`, default 6h; details TTL 7d). If the network/API fails, the engine returns verified records + honest copy (`DISCOVERY_NOTE`) instead of inventing "every temple".
- **Cost control.** Text searches are diversified into ≤ `MAX_QUERIES_PER_DISCOVERY` (4) query strings with deity cues; radius expansion only when results are thin; `searchText` returns `pageSize=20`. Field masks are explicit lists, never `*`.

## Why Nearby Search uses `includedTypes: ["hindu_temple","tourist_attraction"]`

Google's Nearby Search (New) rejects unknown type tokens. `jain_temple`, `gurdwara`, `temple`, and `place_of_worship` are **not valid** `includedTypes` values (verified live: 400 "not a valid value"). The valid filters are `hindu_temple`, `church`, `mosque`, `synagogue`, `tourist_attraction`. We exclude non-Hindu worship in `isOtherWorship()` so churches/mosques entered via `tourist_attraction` don't leak into results.

## Why `PLACES_BASE` needs the trailing slash

`searchText`/`nearby` are path-overloaded (`places:searchText`, `:placeId`, `:placeId/photos/…`). Missing trailing slash produced a 404 on `places:searchText`. `PLACES_BASE` is `https://places.googleapis.com/v1/`.

## Attribution

"Powered by Google" is rendered wherever live results appear (`GoogleAttribution`), as required by the Google Maps Platform ToS, including the attribution link in the map footer and in the discovery/detail surface.

## Known quality quirk

Google occasionally classifies a **town** as `hindu_temple` (e.g. "Belur, Karnataka" surfaced under `hindu_temple`). We keep it for now; the admin console exposes `certainty` and `source` per item so flagged rows can be filtered or promoted later.

## Running the admin-only discovery console

`GET /api/admin/discover?q=<query>` or `?lat=&lng=&radius=` (admin session cookie), backed by `src/components/discover-console.tsx` in the admin area. Use it to audit what a spot yields before promoting any place into the verified directory.

## Tests

`npm test` (via `scripts/test.mjs`) injects the `react-server` condition so the `server-only`-guarded google modules load under node:test — this is required for `tests/google-engine.test.ts`, which stubs `globalThis.fetch` and exercises `discoverTemples` with mocked Places payloads (diversified queries, near-duplicate merging, non-temple filtering, radius expansion, degraded fallback).

A `tsx -e` one-liner silently drops top-level await (outputs nothing) — always use a script file, and if the script touches `server-only` modules run it with `NODE_OPTIONS=--conditions=react-server`.