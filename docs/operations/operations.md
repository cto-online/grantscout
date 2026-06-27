# Operations Runbook

Day-2 operations for the running pipeline: monitoring, common tasks, disaster
recovery, and troubleshooting. For first-time setup see [Deployment](deployment.md).

## System overview

GrantScout is a scheduled data pipeline running as serverless Cloud Run jobs
triggered by Cloud Scheduler (or the [Actions pipeline](ci-cd.md)). Each run:
fetch → snapshot (GCS) → extract → normalize → resolve → enrich → write Firestore
→ score → optional HubSpot sync → write a `syncLogs` record.

## Daily schedule

| Source | Cadence (UTC) |
|---|---|
| ANBI | Weekly, Monday 03:00 |
| GrantAtlas awardees | Daily 04:00 |
| GrantAtlas grants | Daily 04:00 (Actions) |
| Hiring | Daily 05:00 (when enabled) |

## Monitoring at a glance

- **Console → Pipeline Runs** is the first place to look: per-run status and
  counts, live.
- Key metrics: ingestion latency (target < 5 min), coverage (orgs/day),
  low-confidence rate (→ review queue), HubSpot sync success.

Log queries:

```bash
# failed runs
gcloud logging read 'resource.type=cloud_run_job AND severity=ERROR' --limit=10

# ANBI ingestion metrics
gcloud logging read 'resource.type=cloud_run_job AND jsonPayload.sourceId=anbi-nl' \
  --limit=10 --format='table(timestamp,jsonPayload.orgsIngested,jsonPayload.signalsIngested)'
```

See [Monitoring & Alerting](monitoring.md) for alert policies.

## Common tasks

### Run a sensor manually

```bash
gcloud run jobs execute grantscout-anbi-sensor --region=us-central1 --wait
```

Or from the console: **Pipeline Runs → Trigger run** writes a `queued` `syncLogs`
doc the backend picks up.

### Review the HubSpot dry-run before going live

```bash
gcloud logging read 'resource.type=cloud_run_job AND jsonPayload.service=hubspot' \
  --limit=1 --format=json | jq '.[] | select(.jsonPayload.status=="dry-run")'
```

Then enable live sync deliberately by setting `HUBSPOT_SYNC_ENABLED=true` on the
job. See [HubSpot Sync](../backend/hubspot-sync.md).

### Re-score after tuning weights or the ICP

```bash
npx tsx scripts/rescore.ts          # recomputes all accountScores
```

### Firestore backup

```bash
gcloud firestore export gs://PROJECT-grantscout-backups/daily-$(date +%Y%m%d)
```

## Disaster recovery

### Restore from backup

```bash
gsutil ls gs://PROJECT-grantscout-backups/
gcloud firestore import gs://PROJECT-grantscout-backups/daily-YYYYMMDD/
```

### Replay a snapshot

Raw fetch snapshots live in GCS (7-day retention). Re-extraction from a stored
snapshot is the intended replay path; a dedicated replay command is a TODO.

### Reset & reseed (caution)

Delete data, then re-run every sensor:

```bash
gcloud run jobs execute grantscout-anbi-sensor --wait
gcloud run jobs execute grantscout-grantatlas-sensor --wait
gcloud run jobs execute grantscout-hiring-sensor --wait
```

## Performance tuning

| Knob | Where |
|---|---|
| Prospects synced per run | `topN` in `rankProspects` (`src/orchestrator/hubspot.ts`) |
| Tier thresholds | `tierOf` in `src/scoring/accountScore.ts` |
| Timing half-life | `timingDecay` in `accountScore.ts` |
| Intent weights | `SIGNAL_WEIGHTS` in `accountScore.ts` |
| Embedding cache | in-memory today; Redis is a documented future option |

## Compliance operations

- Honor opt-outs: orgs with `optedOut=true` are suppressed by the scorer and
  rules. Audit periodically.
- Raw snapshots auto-delete after 7 days (GCS lifecycle) — data minimization.
- Provenance on every record provides the GDPR audit trail. See
  [Compliance → GDPR](../compliance/gdpr.md).

## Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| Firestore quota exceeded | Too many writes | Batch writes, reduce frequency |
| Gemini API errors | Rate limit / quota | Check quota, back off |
| Sensor timeout | Large dataset | Increase Cloud Run timeout (up to 3600s) |
| HubSpot sync fails | Invalid credentials | Verify `HUBSPOT_ACCESS_TOKEN` |
| Low coverage | Source API down | Check source, retry; sample fallback may be in use |
| High error rate | Schema mismatch | Re-validate extractor vs. source format |
