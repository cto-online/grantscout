# Scoring

The Account Score answers one question for the sales team: *which organizations
should we talk to, and why now?* It is a composite of four axes — **Fit**,
**Intent**, **Timing**, and **Reachability** — implemented in
`src/scoring/accountScore.ts` (`computeAccountScore`).

## The formula

```
raw   = 0.40 × Fit  +  0.30 × Intent  +  0.20 × Timing  +  0.10 × Reachability
score = round(raw × 100)            // 0..100   (0 if opted out)
```

Each axis is in `[0, 1]`. The weights bias toward **Fit** (does this org look
like a GrantMaster customer?) and **Intent** (are they showing buying signals?),
which together guard against false positives.

## The four axes

### Fit — mission ↔ ICP similarity (weight 0.40)

Cosine similarity between the organization's mission embedding and the centroid
of GrantMaster's **Ideal Customer Profile** seed missions
(`src/scoring/icp.ts`). Computed in `src/ai/gemini.ts`:

- `embedMission(mission)` — real `gemini-embedding-001` (768-dim) when
  `GEMINI_API_KEY` is set, otherwise a deterministic keyword-based mock.
- `computeICPCentroid(seedMissions)` — mean of the seed embeddings.
- `computeFitScore(orgMission, centroid)` — cosine similarity, clamped to `[0,1]`.

Tune Fit by editing the ICP seed missions — no other code changes needed — then
re-score with `npx tsx scripts/rescore.ts`. See
[Backend → API Reference](../backend/api-reference.md#ai-gemini).

### Intent — strongest active signal (weight 0.30)

The **max-weighted** active signal (not a sum — avoids double-counting bursts):

```
intent = max over signals of ( SIGNAL_WEIGHTS[type] × signal.confidence.overall )
```

`SIGNAL_WEIGHTS`:

| Type | Weight |
|---|---|
| `search_intent` | 1.0 |
| `hiring_grants_role` | 0.9 |
| `grant_applied` | 0.85 |
| `grant_awarded` | 0.8 |
| `deadline_upcoming` | 0.5 |
| `website_signal` | 0.3 |
| `registry_listed` | 0.2 |

### Timing — recency decay (weight 0.20)

Exponential decay with a **30-day half-life**, taken over signals whose weight is
material (`w ≥ 0.5`):

```
timingDecay(occurredAt) = 0.5 ^ (ageDays / 30)
```

A grant won yesterday contributes far more timing than one from a year ago. The
strongest qualifying signal sets the Timing axis and adds a `timing` reason.

### Reachability — ethical channel availability (weight 0.10)

Can we reach the right person on a compliant channel? Currently a default of
`0.8` for assumed-GDPR-compliant orgs. Roadmap: improve from website analysis and
contact verification. It is the lowest-weighted axis by design — a placeholder
that should never dominate.

## Tiers

`tierOf(score, fit)` assigns a tier used for ranking and HubSpot sync:

| Tier | Condition |
|---|---|
| `hot` | `score ≥ 70` |
| `warm` | `score ≥ 45` |
| `cold_fit` | `fit ≥ 0.6` (good fit, no recent intent yet) |
| `low` | otherwise |

`cold_fit` is deliberate: an org that strongly matches the ICP but has no recent
signal is still worth nurturing, even if its composite score is modest.

## Explainability

Every score carries `reasons: ScoreReason[]`, e.g.:

```
{ factor: 'fit',    detail: 'ICP similarity 0.72',          weight: 0.72 }
{ factor: 'intent', detail: 'Top signal weight 0.80',       weight: 0.80 }
{ factor: 'timing', detail: 'grant_awarded on 2026-01-15',  weight: 0.61, sourceId: 'grantatlas-awardees' }
```

These flow through to the console's **Scoring Results** screen and into the
HubSpot payload, so the score is never a black box.

## Opt-out short-circuit

If `org.optedOut` is true, the scorer breaks out of the signal loop, forces
`score = 0` and `tier = 'low'`. Combined with the security rules and console
suppression, this enforces the GDPR opt-out everywhere. See
[Compliance → GDPR](../compliance/gdpr.md).

## Worked example

```
Fit          = 0.72   (mission close to ICP centroid)
Intent       = 0.80   (grant_awarded, confidence 1.0)
Timing       = 0.61   (awarded ~21 days ago → 0.5^(21/30))
Reachability = 0.80   (default)

raw   = 0.40·0.72 + 0.30·0.80 + 0.20·0.61 + 0.10·0.80 = 0.288 + 0.240 + 0.122 + 0.080 = 0.730
score = 73  → tier "hot"
```

## Persistence

Scoring runs **inline in the sensor** via `scoreAndPersist` (`scoring/persist.ts`):
it writes `/accountScores/{orgId}` for every resolved org and enqueues
low-confidence orgs (`confidence < 0.6`) into `/reviewQueue`. The step is
non-fatal — a scoring error never fails the ingest. Re-score everything offline
with `scripts/rescore.ts` after changing weights or the ICP.

## Where to tune

| Want to change… | Edit |
|---|---|
| Axis weights / tier thresholds | `src/scoring/accountScore.ts` |
| Signal intent weights | `SIGNAL_WEIGHTS` in `accountScore.ts` |
| Timing half-life | `timingDecay()` in `accountScore.ts` |
| What "good fit" means | `ICP_SEED_MISSIONS` in `src/scoring/icp.ts` |
| Review threshold | `needsReview` / `reviewPriorityFor` in `scoring/persist.ts` |
