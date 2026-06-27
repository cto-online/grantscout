# Project Layout

GrantScout is a single repository with two deployables: the **backend pipeline**
(`src/`, a Cloud Run job) and the **admin console** (`console/`, a static
Firebase Hosting site). They share one source of truth — Firestore — and never
call each other directly.

## Top level

```
grantscout/
├─ src/                  # backend pipeline (TypeScript, ESM, Node 20)
├─ console/              # React 19 admin console (Vite)
├─ test/                 # backend Vitest suite
├─ scripts/              # local/offline runner scripts
├─ data/                 # committed sample inputs (offline fallback)
├─ docs/                 # this documentation tree
├─ .github/workflows/    # CI + scheduled pipeline (GitHub Actions)
├─ Dockerfile            # Cloud Run container image
├─ cloudbuild.yaml       # Cloud Build config
├─ firebase.json         # Firestore rules/indexes + emulators + hosting
├─ firestore.rules       # security rules == the console's API contract
├─ firestore.indexes.json
├─ .env.example          # backend env template
└─ package.json          # root scripts + backend deps
```

## Backend — `src/`

```
src/
├─ index.ts              # CLI entry: parses --source, dispatches to sensor/ingest
├─ core/
│  ├─ config.ts          # env → typed config object
│  ├─ types.ts           # domain types (Organization, Signal, AccountScore, Source)
│  ├─ ids.ts             # deterministic hash IDs (idempotent ingest)
│  ├─ firestore.ts       # Admin SDK init + typed collection refs
│  └─ gcs.ts             # raw snapshot storage helpers
├─ pipeline/
│  ├─ sensor.ts          # orchestrates one source run (fetch→…→score)
│  ├─ normalizer.ts      # Zod schemas + per-field confidence
│  ├─ resolver.ts        # entity dedup/merge + Firestore writes
│  ├─ enrich.ts          # borrow missions from known orgs
│  ├─ enrichAnbi.ts      # enrich from live ANBI register + website scrape
│  ├─ missionScraper.ts  # fetch page text, extract doelstelling
│  ├─ providers/         # fetch layer: http, grantatlas
│  └─ extractors/        # parse layer: anbi, grantatlas, hiring, gemini
├─ scoring/
│  ├─ accountScore.ts    # the composite scoring formula
│  ├─ persist.ts         # scoreAndPersist: write scores + enqueue review
│  └─ icp.ts             # ICP seed missions (tune Fit here)
├─ sources/
│  ├─ registry.ts        # the canonical list of sources
│  ├─ anbiRegistry.ts    # live ANBI XML index + lookup
│  └─ grantatlas/        # grants opportunities catalog client/ingest
├─ orchestrator/
│  └─ hubspot.ts         # rank prospects → HubSpot payloads (dry-run/live)
└─ ai/
   └─ gemini.ts          # embeddings, cosine similarity, Fit, LLM extraction
```

The pipeline is a straight line of independently testable functions. See
[Backend → Overview](../backend/overview.md) for the module-by-module tour and
[Backend → API Reference](../backend/api-reference.md) for exported signatures.

## Console — `console/`

```
console/
├─ src/
│  ├─ main.tsx           # entry
│  ├─ App.tsx            # providers + router (route-level code splitting)
│  ├─ auth/              # Firebase auth + login (incl. emulator dev sign-in)
│  ├─ app/               # AppShell (nav) + NotFound
│  ├─ screens/           # one component per route
│  ├─ data/              # typed React Query hooks per collection + converters
│  ├─ components/        # UI primitives + states (Badge, Modal, Toast, …)
│  └─ lib/               # firebase.ts singleton, formatters, cn()
├─ scripts/seed-emulator.ts   # realistic emulator seed data
├─ vite.config.ts
└─ package.json
```

See [Console → Overview](../console/overview.md).

## Where data lives

| Concern | Home |
|---|---|
| Canonical organizations, signals, scores | Firestore collections |
| Immutable raw fetch snapshots | GCS bucket (`*-grantscout-raw`) |
| Console configuration | Firestore `settings/console` |
| Pipeline run history | Firestore `syncLogs` |
| Offline sample inputs | `data/*.tsv`, `data/*.json` |

See [Architecture → Firestore Schema](../architecture/firestore-schema.md).
