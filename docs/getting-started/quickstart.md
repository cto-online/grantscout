# Quickstart

Two things to run: the **backend pipeline** (ingests + scores organizations) and
the **admin console** (the team's window onto the data). Neither needs cloud
credentials for local work.

## 1. Run the pipeline on sample data (offline)

The fastest end-to-end check uses the committed sample files in `data/`:

```bash
npx tsx scripts/test-pipeline.ts
```

This runs **extract → normalize → resolve → score** in memory and prints the
resolved organizations with their Account Scores and explainable reasons — no
Firestore, no Gemini key required.

To exercise a single source through the real sensor entry point:

```bash
npm run pipeline:once -- --source anbi-nl
```

With no `GCP_PROJECT_ID`/credentials, Firestore writes are skipped with a warning
(the sensor still fetches, extracts, normalizes, resolves, and scores). Available
source ids: `anbi-nl`, `grantatlas-awardees`, `hiring-nl`, and the separate
`grantatlas-grants` opportunities ingest. See [Sources](../sources/overview.md).

## 2. Run the admin console against the emulator

The console reads and writes Firestore **directly** via the Firebase Web SDK, so
local QA uses the Firebase Emulator Suite seeded with realistic data. From the
repo root, in three terminals (or background the first two):

```bash
npm run emulators        # Auth (9099) + Firestore (8080) + Emulator UI (4000)
npm run emulators:seed   # seed sources, runs, orgs, scores, review queue, settings
npm run dev:console      # Vite dev server on http://localhost:5173
```

Make sure `console/.env` has `VITE_USE_EMULATOR=true`, then open
`http://localhost:5173` and click **Dev sign-in** — no Google account needed.
The Emulator UI at `http://localhost:4000` lets you inspect the seeded data.

See [Console → Local Development](../console/local-development.md) for the full
emulator workflow.

## 3. Run the tests

```bash
npm test            # backend Vitest suite
npm run typecheck   # type-check backend
cd console && npm test   # console Vitest suite (jsdom)
```

## What just happened?

```
data/anbi-sample.tsv ─► extractAnbi ─► normalize (Zod) ─► resolve (dedup)
                                                              │
                                            enrich missions (borrow + ANBI/web)
                                                              │
                                              computeAccountScore (Fit×Intent×Timing×Reach)
                                                              │
                                        (with creds) Firestore: organizations · signals · accountScores
```

Read [Architecture → Pipeline](../architecture/pipeline.md) for a stage-by-stage
explanation, or [Architecture → Scoring](../architecture/scoring.md) for how the
score is computed.

## Next steps

- Wire real credentials → [Configuration](configuration.md)
- Add a data source → [Adding a Source](../sources/adding-a-source.md)
- Ship it → [Deployment](../operations/deployment.md)
