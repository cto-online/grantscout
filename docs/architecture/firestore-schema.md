# Firestore Schema

Firestore is the canonical store and the **integration point** between the
pipeline (writer) and the console (reader/actor). Because the console talks to
Firestore directly, the [security rules](../operations/security.md) are the API
contract. Collection references are declared in `src/core/firestore.ts`.

## Collections

### `/organizations/{canonicalId}`

The golden records. Written by the pipeline (`resolver.ts`), read by the team.

```
names, type, country, identifiers
mission, themes, sizeBand, geographicScope
embedding (Gemini), mergedFrom (dedup history)
provenance: [{ sourceId, snapshotId, fetchedAt, confidence }]
confidence: { overall, perField }
optedOut: bool        // GDPR opt-out suppresses everywhere
createdAt, updatedAt
```

### `/signals/{signalId}`

Detected buying-intent events. Written by the pipeline, read by the team.

```
orgId, type, strength
occurredAt (event time), detectedAt (discovery time)
payload: { funderId, grantId, amount, jobTitle, … }
provenance: { sourceId, snapshotId, sourceUrl }
confidence: { overall }
```

### `/accountScores/{orgId}`

One score document per organization. Written by scoring, read by the team.

```
fit, intent, timing, reachability, score
tier: hot | warm | cold_fit | low
reasons: [{ factor, detail, weight, sourceId }]
contributingSignals: [signalIds]
computedAt, modelVersion
```

### `/syncLogs/{auto-id}`

One document per pipeline run — the console's **Pipeline Runs** screen.

```
sourceId | service (hubspot), timestamp (ISO string)
status: success | error | dry-run | queued | running
orgsIngested, signalsIngested, scored, queuedForReview
snapshotId, error (if any)
```

Dual-writer: the pipeline writes run results; the console may add a `queued`
document to request a manual run.

### `/sources/{id}`

Source configuration. Dual-writer: the pipeline ingests, the console toggles/edits/adds.

```
name, country, provider, extractionMethod
schedule (cron), enabled, license
fetchConfig: { url, format, … }
```

### `/reviewQueue/{id}`

Human-review items. Dual-writer: the pipeline enqueues, the console decides.

```
orgId, title, priority: high | medium | low
reason, submittedBy, createdAt
status: pending | approved | rejected
reviewedBy, reviewedAt        // set by the console
```

### `/settings/{console}`

Console-owned configuration (single doc, id `console`).

```
autoRunEnabled, emailOnFailure, debugLogging
minRelevanceScore, minFitScore
updatedAt, updatedBy
```

### `/grants/{id}`

GrantAtlas **opportunities** catalog, ingested separately from the org sensor
(`src/sources/grantatlas/ingest.ts`). Written by the pipeline, read by the team.
See [Sources → GrantAtlas grants](../sources/grantatlas-grants.md).

### `/rawSnapshots/{id}`

Reserved for snapshot metadata. **Reads are disabled** in the rules — raw bytes
live in GCS, not Firestore.

## Ownership matrix

| Collection | Pipeline writes | Console writes | Team reads |
|---|:--:|:--:|:--:|
| `organizations` | ✓ | — | ✓ |
| `signals` | ✓ | — | ✓ |
| `accountScores` | ✓ | — | ✓ |
| `grants` | ✓ | — | ✓ |
| `syncLogs` | ✓ | ✓ (queue a run) | ✓ |
| `sources` | ✓ | ✓ (toggle/edit/add) | ✓ |
| `reviewQueue` | ✓ (enqueue) | ✓ (approve/reject) | ✓ |
| `settings` | — | ✓ | ✓ |
| `rawSnapshots` | ✓ | — | ✗ (use GCS) |

"Pipeline writes" = service account (no auth uid). "Console writes/Team reads" =
verified team email. See [Security](../operations/security.md) for the exact rule
predicates.

## Timestamps

The pipeline writes ISO-8601 **strings** (e.g. `timestamp`), while some documents
use Firestore `Timestamp` objects. The console's `tsToDate()` converter
(`console/src/data/converters.ts`) normalizes `Timestamp | string | number → Date`
so screens don't have to care. See [Console → Data Layer](../console/data-layer.md).

## Indexes

Composite indexes are declared in `firestore.indexes.json` and deployed with the
rules via `firebase deploy --only firestore`. Add an index whenever you introduce
a query that combines an equality filter with an `orderBy` on a different field
(Firestore will also surface the exact index definition in an error link if one
is missing).
