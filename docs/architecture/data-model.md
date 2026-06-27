# Data Model

All domain types live in `src/core/types.ts`. There are four core entities —
**Organization**, **Signal**, **AccountScore**, and **Source** — plus two shared
value objects, **Provenance** and **Confidence**, that appear on almost
everything.

## Shared value objects

### Provenance

Every record carries where it came from. This is the backbone of trust and GDPR
lineage.

```ts
interface Provenance {
  sourceId: string;            // e.g. "anbi-nl"
  snapshotId?: string;         // GCS snapshot this was extracted from
  sourceUrl?: string;
  fetchedAt?: ISODate;
  extractionMethod?: 'deterministic' | 'llm';
}
```

### Confidence

Quality is tracked per record and, for organizations, per field.

```ts
interface Confidence {
  overall: number;                       // 0..1
  perField?: Record<string, number>;     // e.g. { rsin: 1.0, mission: 0.8 }
}
```

Per-field confidence drives downstream decisions: a high-confidence RSIN can be
trusted for dedup, while a low-confidence mission may be re-derived or sent to
the [review queue](firestore-schema.md#reviewqueue).

## Organization (canonical golden record)

The deduplicated, merged record for one real-world org.

```ts
interface Organization {
  canonicalId: string;         // SHA256(country::normalizedName)[0:20]
  names: string[];             // aliases in NL/EN
  type: OrgType;               // ngo | foundation | charity | association | …
  country: string;             // ISO-3166-1 alpha-2; NL first
  identifiers: { rsin?; kvk?; anbi?: boolean; websiteDomain? };
  mission?: string;
  themes?: string[];
  sizeBand?: 'micro' | 'small' | 'medium' | 'large';
  geographicScope?: string[];
  embedding?: number[];        // Gemini mission embedding (Fit input)
  mergedFrom?: string[];       // dedup history
  provenance: Provenance[];    // one per contributing source
  confidence: Confidence;
  optedOut?: boolean;          // GDPR opt-out → suppress everywhere
  createdAt: ISODate;
  updatedAt: ISODate;
}
```

Notes:
- `canonicalId` is a deterministic hash so the same org always lands on the same
  document — see [`src/core/ids.ts`](../backend/api-reference.md#core-ids).
- `provenance` is an **array** because an org can be known by multiple sources;
  the resolver unions them.
- `optedOut` is honored by the scorer (forces `score = 0`, `tier = low`) and by
  the security rules / console.

## Signal (a detected buying-intent event)

```ts
interface Signal {
  id: string;                  // SHA256(orgId::type::occurredAt::sourceId)[0:20]
  orgId: string;
  type: SignalType;
  strength: number;            // 0..1 base weight (see scoring)
  occurredAt: ISODate;         // event time → Timing decay
  detectedAt: ISODate;         // when we discovered it
  payload?: Record<string, unknown>;  // { funderId, grantId, amount, jobTitle, … }
  provenance: Provenance;
  confidence: Confidence;
}
```

### Signal types and intent weights

| `SignalType` | Meaning | Intent weight |
|---|---|---|
| `search_intent` | Explicit search behavior | 1.0 |
| `hiring_grants_role` | Hiring a grants/fundraising role | 0.9 |
| `grant_applied` | Applied for a grant | 0.85 |
| `grant_awarded` | Won a grant | 0.8 |
| `deadline_upcoming` | A relevant deadline approaches | 0.5 |
| `website_signal` | Generic website indicator | 0.3 |
| `registry_listed` | Present in a public registry (ANBI) | 0.2 |

Weights live in `SIGNAL_WEIGHTS` in `src/scoring/accountScore.ts`. See
[Scoring](scoring.md).

## AccountScore (computed, time-decayed)

```ts
interface AccountScore {
  orgId: string;
  fit: number; intent: number; timing: number; reachability: number;  // 0..1
  score: number;               // composite 0..100
  tier: 'hot' | 'warm' | 'cold_fit' | 'low';
  reasons: ScoreReason[];      // explainable factors
  contributingSignals: string[];
  computedAt: ISODate;
  modelVersion: string;        // e.g. "v0"
}

interface ScoreReason {
  factor: 'fit' | 'intent' | 'timing' | 'reachability';
  detail: string;              // "grant_awarded on 2026-01-15"
  weight: number;
  sourceId?: string;
}
```

`reasons` make every score auditable — the sales team can see *why now, why this
org*. See [Scoring](scoring.md) for tier thresholds.

## Source (a configured data feed)

```ts
interface Source {
  id: string;                  // "anbi-nl"
  name: string;
  country: string;
  acquisitionTier: 'api' | 'feed' | 'scrape' | 'internal';
  extractionMethod: 'deterministic' | 'llm';
  provider: 'http' | 'firecrawl' | 'apify' | 'grantatlas';
  signalTypes: SignalType[];
  schedule?: string;           // cron
  enabled: boolean;
  robotsPolicy?: string;
  license?: string;
  fetchConfig?: Record<string, unknown>;  // e.g. { url, format }
}
```

The canonical list is `SOURCES` in `src/sources/registry.ts`. See
[Sources → Overview](../sources/overview.md).

## Entity relationships

```
            ┌──────────────┐  provenance.sourceId   ┌──────────┐
            │   Source     │◄───────────────────────│  Signal  │
            └──────────────┘                         └────┬─────┘
                                                          │ orgId
                                                          ▼
                                ┌──────────────┐    ┌──────────────┐
                                │ AccountScore │───►│ Organization │
                                │   (orgId)    │    │ (canonicalId)│
                                └──────────────┘    └──────────────┘
```

One organization has many signals; one score is computed per organization from
its signals plus its mission embedding.
