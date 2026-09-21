# Data pipeline

Devyatra separates *listing* (curated, in-memory seed modules) from *live data*
(map overlays, business records, corrections) so nothing unstable ever reaches pilgrims.

## Verification statuses

Every factual claim carries a status:

| Status                  | Meaning                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| `VERIFIED_OFFICIAL`     | Confirmed by the temple administration / governing trust directly |
| `GOVERNMENT_SOURCE`     | Reconciled against a government or statutory publication         |
| `TRUSTED_SOURCE`        | Cross-checked against reputable third-party documentation        |
| `COMMUNITY_REPORTED`    | Reported by pilgrims; awaiting official confirmation             |
| `UNVERIFIED`            | Pending verification — treated as provisional                    |

`VERIFY_LABEL` / `VERIFY_COLOR` in `src/lib/format.ts` drive the UI stamps.

## The ingestion pipeline

1. **Community report** — pilgrims submit via `/report` → `POST /api/reports`
   → appended to `.data/reports.json` with status `open`.
2. **Triage** — an editor reconstructs the claim against the stated source
   (official notice board, trust website, government order).
3. **Reconcile** — if the source is authoritative, the correction updates the
   listing AND bumps its verification status (`TRUSTED_SOURCE → GOVERNMENT_SOURCE → VERIFIED_OFFICIAL`).
4. **Publish** — the change lands in the seed/DB with source attribution.
5. **Audit** — `/verify` lists every listing's provenance; `/admin` (role: `admin`)
   triages the open queue via `PATCH /api/admin/reports`.

## Adding a temple by hand (seed modules)

Temples are typed TS modules under `src/data/`:

- `states.ts` — states with `code`, `slug`, `subUnitTerm`, districts, sub-units, locations
- `temples-core.ts`, `temples-extra-1.ts`, `temples-extra-2.ts` — temple records
- `nearby.ts` — `NEARBY` map keyed by temple id
- `registry.ts` — assembles `TEMPLES`, resolves hierarchy, routes (`templeUrl`), `nearbyFor`

A temple record must satisfy `Temple` in `src/lib/types.ts`. Key fields:

- `stateCode`, `districtSlug`, `subunitSlug?`, `locationSlug`
- `timings.slots` + `verification` object (status, source `{ authority, org, title, url }`, `note`)
- `entryFee` + `booking` (`bookingMode`, `bookingUrl`, `verification`)
- `badges: string[]` of `TempleBadge` union values

**Rules that are enforced by trust, not code:**
- Never invent a timing, price, or festival date.
- `booking.bookingUrl` only when securely confirmed on the official domain.
- Always attach `source` with an org name.
- Untrusted data → mark `UNVERIFIED` rather than omitting it silently.

## Live data (deferred providers)

- **Maps / business data** — doorway restaurants, stays, pharmacies within 2 km.
  Imported by admins as validated JSON batches via `POST /api/admin/feed`
  (`{ source, places: [{ templeId, kind, name, distanceKm, ... }] }`). Rows are
  validated against the kind whitelist and the registry, de-duplicated by
  `templeId + name`, and stored in `.data/feeds.json`. They surface on `/nearby`
  with a “live” tag before any map overlay hookup.
- **Weather** — `weatherNote` in the planner intentionally returns `null`
  until a provider is wired; the UI renders the chip only when present.
- **Booking widgets** — reserve `widget` for trusted embed sources; never fake.

## Target relational schema

`prisma/schema.prisma` captures the relational model (sqlite) that the in-memory
layer should migrate into once a DB is adopted. Fields like `slots`, `verification`,
`badges` are stored as JSON strings there.

## Runtime state files (`.data/`)

- `users.json` — accounts (scrypt-hashed), seeded admin `admin@devyatra.dev`
- `sessions` — in-memory only (lost on restart)
- `saved.json` — per-user saved temple lists (`GET/POST /api/saved`)
- `feeds.json` — live business-data feed state (source, updatedAt, places)
- `reports.json` — correction queue

Everything under `.data/` is git-ignored.