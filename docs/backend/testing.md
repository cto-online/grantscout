# Backend Testing

The backend uses **Vitest**. Tests are pure and offline — they exercise the
deterministic pipeline stages with sample data, no cloud credentials required.

## Run

```bash
npm test            # run once
npm run test:watch  # watch mode
npm run typecheck   # tsc --noEmit (a second safety net)
npm run lint        # eslint src test
```

## Suite layout

Tests live in `test/` and mirror the modules they cover:

| File | Covers |
|---|---|
| `accountScore.test.ts` | Scoring formula, tiering, opt-out short-circuit |
| `embeddings.test.ts` | Cosine similarity, ICP centroid, Fit scoring |
| `anbi.test.ts` | ANBI TSV parsing, per-field confidence |
| `anbi-registry.test.ts` | Live ANBI XML index + lookup |
| `grantatlas.test.ts` | Awardee extraction + grant signals |
| `grantatlas-provider.test.ts` | Awardee provider + sample fallback |
| `grants.test.ts` | Grants catalog projection (`projectGrant`) |
| `hiring.test.ts` | Job-posting LLM extraction + dedup |
| `normalizer.test.ts` | Zod validation, error handling |
| `resolver.test.ts` | Dedup, merging, provenance union |
| `enrich.test.ts` | Mission borrowing |
| `persist.test.ts` | `scoreAndPersist`, review enqueue thresholds |
| `hubspot.test.ts` | Ranking, payload mapping, tiering |

## What good coverage looks like here

- **Determinism:** same input → same orgs/signals/ids. Assert exact ids where it
  matters (idempotency is a feature).
- **Confidence:** assert per-field confidence is set as expected; it gates the
  review queue.
- **Dedup/merge:** feed the same org from two "sources" and assert one merged
  record with unioned provenance.
- **Scoring edges:** opted-out org → score 0 / tier low; stale signal → low
  Timing; max-weighted (not summed) intent.

## Adding tests

When you add an extractor or source, add a sibling test plus a sample input under
`data/`. Keep tests offline: stub network/LLM paths or rely on the mock embedder
(`embedMission` is deterministic without a key).

## Offline runner scripts (manual checks)

Not tests, but useful for eyeballing behavior end-to-end:

```bash
npx tsx scripts/test-anbi.ts       # ANBI extract→normalize→resolve→score, printed
npx tsx scripts/test-pipeline.ts   # full pipeline on sample data
npx tsx scripts/rescore.ts         # re-score all orgs (after tuning weights/ICP)
```

## CI

The [`ci` workflow](../operations/ci-cd.md) runs `npm ci --include=dev`,
`npm run typecheck`, and `npm test` on every push and pull request. Keep the suite
green — it's the gate before the scheduled production pipeline runs.

## Console tests

The console has its own Vitest + Testing Library suite (jsdom). Run it from
`console/`:

```bash
cd console && npm test
```

Covered today: data converters (`tsToDate`) and tone/format helpers. See
[Console → Data Layer](../console/data-layer.md).
