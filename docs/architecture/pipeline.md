# Pipeline

A **sensor** is one end-to-end run of the pipeline for a single source. The
orchestration lives in `src/pipeline/sensor.ts` (`runSensor(source)`); the CLI
entry point `src/index.ts` parses `--source <id>` and dispatches to it. Each
stage is a small, independently testable function.

```
Fetch → Capture (GCS) → Extract → Normalize → Resolve → Enrich → Write → Score → Log
```

## Stage 1 — Fetch (provider)

`runSensor` selects a provider by `source.provider`:

| Provider | Module | Behavior |
|---|---|---|
| `http` | `pipeline/providers/http.ts` | `fetchHttp(url)` downloads bytes (supports `file://` for samples). |
| `grantatlas` | `pipeline/providers/grantatlas.ts` | `fetchGrantAtlasAwardees(source)` reads the awardee API, or the committed sample if unconfigured. |
| `firecrawl` | _not yet implemented_ | Hiring source is wired but the scrape provider is a stub. |

Output: a `Buffer` of raw bytes.

## Stage 2 — Capture (GCS)

`storeSnapshot(sourceId, data)` writes an **immutable, timestamped** snapshot to
`gs://<PROJECT>-grantscout-raw/raw/<sourceId>/<ISO timestamp>.bin` and returns a
`snapshotId`. Snapshots are the audit trail and the basis for replay; a lifecycle
policy deletes them after 7 days.

## Stage 3 — Extract

Dispatched by `source.extractionMethod` and `source.id`:

| Source | Extractor | Output |
|---|---|---|
| `anbi-nl` | `extractAnbi` | Organizations + `registry_listed` signals |
| `grantatlas-awardees` | `extractGrantAtlasAwardees` | Organizations + `grant_awarded`/`grant_applied` signals |
| `hiring-nl` | `extractHiringSignals` (LLM) | Organizations + `hiring_grants_role` signals |

Deterministic extractors parse TSV/JSON into raw org/signal objects. The LLM
extractor (Gemini) reads job-posting text and pulls out the org name and role
match. See [Sources](../sources/overview.md).

## Stage 4 — Normalize

`normalizeOrg` / `normalizeSignal` (`pipeline/normalizer.ts`) validate each raw
object against a **Zod** schema (`OrgSchema`, `SignalSchema`):

- Type checks: country is ISO-2, confidence in `0..1`, enum values valid.
- Per-field confidence is attached (e.g. RSIN 1.0, mission 0.8).
- Invalid records are dropped with a logged error rather than crashing the run.

This stage guarantees that everything downstream is well-typed and confidence-stamped.

## Stage 5 — Resolve (entity dedup)

`resolveOrganizations(orgs)` (`pipeline/resolver.ts`) collapses duplicates into
canonical golden records:

1. Group by **RSIN** (highest-confidence identifier) → merge names, latest
   mission, union of identifiers and provenance.
2. Then group by **normalizedName + country** to catch spelling variations and
   name changes.

`deduplicateSignals(signals)` removes exact duplicate events (same hash id).
Output: a `Map<canonicalId, Organization>` plus a deduped signal array.

## Stage 6 — Enrich missions

Awardee orgs often arrive without a mission, which would peg Fit at the 0.3
fallback. Two cheap enrichment passes run before writing:

1. `enrichMissions` — **borrow** a mission from an already-known org with the
   same name key (in-memory, free).
2. `enrichFromAnbiRegistry` — look the org up in the live ANBI register and
   scrape its website's *doelstelling* (mission) for any still missing.

See [Backend → Enrichment](../backend/enrichment.md).

## Stage 7 — Write, Score, Log

1. **Write** — `writeOrganizationsAndSignals` upserts the resolved orgs and
   deduped signals to Firestore (batched, idempotent by id).
2. **Score** — `scoreAndPersist` computes an `AccountScore` per org and writes
   `/accountScores/{orgId}`; low-confidence orgs (`confidence < 0.6`) are
   enqueued into `/reviewQueue`. **This step is non-fatal**: a scoring error is
   caught and logged, never failing the ingest.
3. **Log** — a `syncLogs` document records the run: `sourceId`, `timestamp`,
   `orgsIngested`, `signalsIngested`, `scored`, `queuedForReview`, `snapshotId`,
   and `status` (`success`/`error`). This is exactly what the console's
   **Pipeline Runs** screen reads.

## Determinism & retry-safety

```
Same input  ─►  same hash IDs  ─►  same Firestore documents
```

Because organization and signal IDs are content hashes (`src/core/ids.ts`),
re-running a sensor is safe: writes upsert onto the same documents, so partial
failures can simply be retried. See [ADR-0002](decisions/0002-deterministic-ids.md).

## Error handling

`runSensor` wraps the whole flow in try/catch. On failure it writes a `syncLogs`
document with `status: 'error'` and the error string, then re-throws so the
Cloud Run job exits non-zero (surfacing the failure to monitoring). The scoring
sub-step is additionally guarded so it can never fail an otherwise-good ingest.

## Sequence at a glance

```
runSensor(source)
  ├─ fetch bytes (provider)
  ├─ storeSnapshot → snapshotId
  ├─ extract → orgsRaw, signalsRaw
  ├─ normalize → drop invalid
  ├─ resolve → Map<canonicalId, Organization>, deduped signals
  ├─ enrichMissions → enrichFromAnbiRegistry
  ├─ writeOrganizationsAndSignals
  ├─ scoreAndPersist (non-fatal)
  └─ syncLogs.add({ status })
```
