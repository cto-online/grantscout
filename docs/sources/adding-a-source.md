# Adding a Source

This is the extension path most contributors will hit. A source is glue between
a **provider** (fetch bytes) and an **extractor** (bytes → orgs + signals), plus
a registry entry. The pipeline handles everything else (snapshot, normalize,
resolve, enrich, score, log) for free.

## 1. Register the source

Add an entry to `SOURCES` in `src/sources/registry.ts`:

```ts
{
  id: 'my-source',
  name: 'Human-readable name',
  country: 'NL',
  acquisitionTier: 'feed',          // api | feed | scrape | internal
  extractionMethod: 'deterministic', // or 'llm'
  provider: 'http',                  // http | grantatlas | firecrawl | apify
  signalTypes: ['registry_listed'],  // must be valid SignalType values
  schedule: '0 6 * * *',             // cron (for the scheduler)
  enabled: false,                    // start disabled until proven
  license: 'open data',
  fetchConfig: { url: 'https://…', format: 'json' },
}
```

Keep new sources `enabled: false` until they're validated end-to-end.

## 2. Provide a fetch path

If you can reuse `http` (any URL or `file://`), you're done — `fetchHttp` returns
the bytes. Otherwise add a provider branch in `src/pipeline/sensor.ts` and a
module under `src/pipeline/providers/`:

```ts
} else if (source.provider === 'myprovider') {
  const { fetchMyProvider } = await import('./providers/myprovider.js');
  rawData = await fetchMyProvider(source);
}
```

A provider's only contract: return a `Buffer`. Prefer a **committed sample
fallback** (read from `data/`) when credentials are unset, so the source stays
offline-runnable — this is how every existing source behaves.

## 3. Write an extractor

Add a module under `src/pipeline/extractors/` and wire it in the `extract` stage
of `sensor.ts` (keyed by `source.id` within the matching `extractionMethod`
branch):

```ts
export function extractMySource(raw: Buffer, snapshotId: string) {
  const orgs: any[] = [];
  const signals: any[] = [];
  // parse raw → push raw org/signal objects with provenance + confidence
  return { orgs, signals };
}
```

Requirements for what you emit:

- Each org needs a stable identity input (RSIN or normalized name + country) so
  `src/core/ids.ts` can hash a `canonicalId`. The resolver merges duplicates.
- Stamp **provenance** (`{ sourceId, snapshotId, … }`) and **confidence** on
  every record — the normalizer enforces ranges, but you set the values.
- Use only declared `SignalType` values and set a sensible `occurredAt` (it drives
  Timing decay).

LLM extractors return a Promise and typically call helpers in `src/ai/gemini.ts`
(e.g. `extractStructured`). Keep a deterministic mock path for offline runs.

## 4. Normalize is automatic

`normalizeOrg` / `normalizeSignal` validate your raw objects against
`OrgSchema` / `SignalSchema`. Invalid records are dropped with a warning, not a
crash. If you add fields, extend the Zod schemas in `src/pipeline/normalizer.ts`.

## 5. Test it

Add a Vitest file under `test/` mirroring the existing extractor tests
(`anbi.test.ts`, `grantatlas.test.ts`, `hiring.test.ts`): feed sample bytes,
assert the orgs/signals, confidence, and dedup behavior. Add a sample input under
`data/` so the test (and offline runs) need no network.

```bash
npm test
npm run pipeline:once -- --source my-source
```

## 6. Schedule it (deploy)

Once enabled and proven, create a Cloud Run job + Cloud Scheduler trigger (see
[Deployment](../operations/deployment.md)), or add the id to the scheduled
[GitHub Actions pipeline](../operations/ci-cd.md).

## Checklist

- [ ] Registry entry added (`enabled: false` initially)
- [ ] Provider returns a `Buffer` (with sample fallback)
- [ ] Extractor emits orgs + signals with provenance + confidence
- [ ] Zod schemas extended if new fields
- [ ] Sample input committed under `data/`
- [ ] Vitest coverage added
- [ ] Ran end-to-end via `pipeline:once`
- [ ] Scheduled (Cloud Scheduler or Actions) when ready
