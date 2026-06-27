# Monitoring & Alerting

What "healthy" looks like, how to see it, and how to get paged when it isn't.

## Signals of health

| Metric | Target | Source |
|---|---|---|
| Run status | `success` | `syncLogs` / Pipeline Runs |
| Ingestion latency | < 5 min (fetch → Firestore) | Cloud Run job duration |
| Coverage | ~3K+ ANBI weekly, 500+ awardees daily | `orgsIngested` in `syncLogs` |
| Low-confidence rate | trends, not spikes | `queuedForReview` in `syncLogs` |
| HubSpot sync | success; dry-run reviewed before live | `service: hubspot` logs |

## Where to look

1. **Console → Pipeline Runs** — fastest human-readable view (live, per-run).
2. **Cloud Logging** — structured logs from each Cloud Run job.
3. **Cloud Monitoring** — dashboards + alert policies.

## Useful log queries

```bash
# failed sensor runs
gcloud logging read 'resource.type=cloud_run_job AND severity=ERROR' --limit=10

# per-source ingestion counts
gcloud logging read 'resource.type=cloud_run_job AND jsonPayload.sourceId=anbi-nl' \
  --limit=10 --format='table(timestamp,jsonPayload.orgsIngested,jsonPayload.signalsIngested)'

# HubSpot dry-run payloads
gcloud logging read 'resource.type=cloud_run_job AND jsonPayload.service=hubspot' --limit=5
```

## Alert policies

```bash
# sensor failure
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="GrantScout Sensor Failure" \
  --condition="resource.type=cloud_run_job AND metric.type=run.googleapis.com/job_execution_count AND metric.labels.result_type=failure"

# high error rate
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="GrantScout High Error Rate" \
  --condition="resource.type=cloud_run_job AND metric.type=logging.googleapis.com/log_entry_count AND severity=ERROR"
```

## Recommended alerts

- **Run failure** — any sensor exits non-zero (it writes a `status: error`
  `syncLogs` doc and exits non-zero).
- **No successful run in 25h** for a daily source (detects silent scheduler
  failures).
- **Coverage drop** — `orgsIngested` falls well below the rolling average (source
  outage or schema change; the run may be on sample fallback).
- **Budget threshold** — see [Cost Model](cost-model.md).

## Observability hooks already in code

- Every stage logs with a `[sensor]` prefix and counts.
- Each run writes a `syncLogs` document (success or error) — the canonical record
  for both the console and log-based metrics.
- The scoring sub-step logs `scored` and `queuedForReview` counts.
