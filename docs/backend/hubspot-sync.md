# HubSpot Sync

The orchestrator (`src/orchestrator/hubspot.ts`) is the activation step: it ranks
scored prospects and upserts them to HubSpot as companies, so the sales team sees
GrantScout's output in the CRM they already live in.

## Safety: dry-run by default

Sync is **off unless explicitly enabled** ([ADR-0003](../architecture/decisions/0003-dry-run-hubspot.md)).
Live upserts require **both**:

- `HUBSPOT_ACCESS_TOKEN` set (a private-app token), and
- `HUBSPOT_SYNC_ENABLED=true`.

In dry-run mode the orchestrator builds and logs the exact payloads it would send,
performing no writes. Dry-run records are logged with `service: hubspot`,
`status: dry-run` and appear in **Pipeline Runs**.

## Functions

```ts
toHubSpotProspect(org, score): HubSpotProspect      // map domain → CRM payload
rankProspects(prospects, topN): HubSpotProspect[]   // sort by tier then score, take top N
syncProspectsToHubSpot(...)                         // orchestrate dry-run/live
upsertCompanies(payloads): Promise<number>          // live HubSpot upserts
```

## Ranking

`rankProspects` orders by **tier** (`hot` → `warm` → `cold_fit` → `low`) then by
composite **score**, and takes the top *N* (default 100). Tune the cutoff to send
more or fewer prospects per run.

## Payload mapping

`toHubSpotProspect` flattens an org + its score into HubSpot company properties:
the score components (Fit/Intent/Timing/Reachability + composite), tier, RSIN,
source, and timestamp. The explainable `reasons` travel along so a salesperson
can see *why* a company surfaced.

> **Property setup (one-time, in HubSpot):** create a "GrantScout Score" company
> property (and any component fields you map) before enabling live sync, so
> upserts land on real fields. See the sales-integration handoff in the
> [roadmap / project status](../reference/project-status.md).

## Enabling live sync

1. Create the HubSpot private app + token; grant company write scope.
2. Set `HUBSPOT_ACCESS_TOKEN` and `HUBSPOT_SYNC_ENABLED=true` on the Cloud Run
   job (or local env).
3. Run once and **review the dry-run payload first** if switching from dry-run.
4. Confirm companies upserted as expected; watch the sync run record.

```bash
# inspect the latest dry-run payload from logs
gcloud logging read 'resource.type=cloud_run_job AND jsonPayload.service=hubspot' \
  --limit=1 --format=json | jq '.[] | select(.jsonPayload.status=="dry-run")'
```

## Tuning

| Want to change… | Where |
|---|---|
| How many prospects sync | `topN` in `rankProspects` (called from the sync flow) |
| Which properties are written | `toHubSpotProspect` |
| Live vs dry-run | `HUBSPOT_SYNC_ENABLED` env |

See [Operations → Operations Runbook](../operations/operations.md) for the
dry-run review and live-enable procedures.
