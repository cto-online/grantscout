# Backend Overview

The backend (`src/`) is the GrantScout pipeline: a Node 20, TypeScript (ESM)
program that runs as a Cloud Run job. It has no long-running server — each
invocation runs one source and exits. Entry point: `src/index.ts`.

## Module map

```
src/
├─ index.ts          CLI: parse --source, dispatch to sensor or grants ingest
├─ core/             cross-cutting plumbing
│  ├─ config.ts      env → typed `config` object (safe defaults)
│  ├─ types.ts       domain types (Organization, Signal, AccountScore, Source)
│  ├─ ids.ts         deterministic hash IDs (organizationId, signalId)
│  ├─ firestore.ts   Admin SDK init + typed `collections` refs
│  └─ gcs.ts         raw snapshot storage (bucket, storeRawSnapshot, getRawSnapshot)
├─ pipeline/         the sensor flow
│  ├─ sensor.ts      runSensor(source): fetch→capture→extract→normalize→resolve→enrich→write→score→log
│  ├─ normalizer.ts  Zod schemas + per-field confidence
│  ├─ resolver.ts    dedup/merge + Firestore writes
│  ├─ enrich.ts      borrow missions from known orgs
│  ├─ enrichAnbi.ts  enrich from live ANBI register + website
│  ├─ missionScraper.ts  fetch page text, extract doelstelling
│  ├─ providers/     fetch layer: http, grantatlas
│  └─ extractors/    parse layer: anbi, grantatlas, hiring, gemini
├─ scoring/
│  ├─ accountScore.ts  computeAccountScore (the formula)
│  ├─ persist.ts       scoreAndPersist + needsReview + reviewPriorityFor
│  └─ icp.ts           ICP_SEED_MISSIONS (tune Fit)
├─ sources/
│  ├─ registry.ts      SOURCES list
│  ├─ anbiRegistry.ts  live ANBI XML index + lookup
│  └─ grantatlas/      grants opportunities catalog (client, grants, ingest)
├─ orchestrator/
│  └─ hubspot.ts       rank prospects → HubSpot payloads (dry-run/live)
└─ ai/
   └─ gemini.ts        embeddings, cosine similarity, Fit, LLM extraction
```

## Design principles

- **Pure, composable stages.** Each pipeline step is a function with explicit
  inputs/outputs and its own test. `runSensor` is the only orchestrator.
- **Deterministic by default.** Hash IDs + upserts → idempotent, retry-safe runs
  ([ADR-0002](../architecture/decisions/0002-deterministic-ids.md)).
- **Degrade, don't crash.** Missing creds downgrade a feature (sample data, mock
  embedder, dry-run) rather than failing. See [Configuration](../getting-started/configuration.md).
- **Provenance + confidence everywhere.** Every record records where it came from
  and how much to trust it.
- **Secondary work is non-fatal.** Scoring is wrapped so it can never fail an
  otherwise-successful ingest.

## Runtime shape

```
node dist/index.js --source <id>        # production (compiled)
npx tsx src/index.ts --source <id>      # dev (no build step)
```

`firestore.ts` initializes the Admin SDK lazily and **tolerates absence**: in a
test script without credentials it logs a warning and leaves `collections`
undefined, so offline scripts can import pipeline modules freely.

## Key files to read first

1. `src/core/types.ts` — the vocabulary of the whole system.
2. `src/pipeline/sensor.ts` — the spine; everything hangs off it.
3. `src/scoring/accountScore.ts` — the product's core logic.
4. `src/sources/registry.ts` — what runs and how it's configured.

Continue with the [API Reference](api-reference.md).
