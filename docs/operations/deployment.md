# Deployment

GrantScout deploys as **Cloud Run jobs** (one per source) triggered by **Cloud
Scheduler**, plus a static **Firebase Hosting** site for the console. This guide
covers the GCP backend; for the console see
[Console → Local Development](../console/local-development.md) (deploy section).

## Prerequisites

- GCP project with Firestore, GCS, and Cloud Run enabled
- A service account with Firestore + GCS write permissions
- `gcloud` CLI configured; Docker for local image builds

## Environment

Create `.env` from `.env.example` and fill production values. The essentials:

```bash
GCP_PROJECT_ID=your-project-id
FIRESTORE_DATABASE_ID=(default)
GCS_RAW_BUCKET=grantscout-raw
GEMINI_API_KEY=…
GRANTATLAS_READ_API_URL=…           # awardees API (optional; sample fallback)
GRANTATLAS_FB_API_KEY=…             # grants catalog (optional; sample fallback)
GRANTATLAS_PROJECT_ID=…
HUBSPOT_ACCESS_TOKEN=…
HUBSPOT_SYNC_ENABLED=true           # production: enable live sync deliberately
```

Full list: [Configuration](../getting-started/configuration.md) and the
[Environment Variables reference](../reference/environment-variables.md).

## 1. Provision GCP resources

```bash
export PROJECT_ID=your-gcp-project
export REGION=us-central1

gcloud services enable \
  firestore.googleapis.com storage.googleapis.com run.googleapis.com \
  cloudscheduler.googleapis.com pubsub.googleapis.com cloudbuild.googleapis.com

gsutil mb gs://${PROJECT_ID}-grantscout-raw          # raw snapshots bucket
gcloud firestore databases create --region=$REGION    # Firestore database
```

## 2. Build & push the container

```bash
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions COMMIT_SHA=$(git rev-parse --short HEAD)
```

`Dockerfile` is a `node:20-slim` image that installs prod deps, runs
`npm run build`, and sets the entrypoint to `npm run pipeline:once --`. See
[CI/CD](ci-cd.md) for the Cloud Build steps.

## 3. Deploy a Cloud Run job per source

```bash
gcloud run jobs create grantscout-anbi-sensor \
  --image gcr.io/${PROJECT_ID}/grantscout:latest \
  --args "--source=anbi-nl" \
  --region ${REGION} \
  --set-env-vars GCP_PROJECT_ID=${PROJECT_ID}
# repeat with --args "--source=grantatlas-awardees" and "--source=hiring-nl"
```

## 4. Schedule with Cloud Scheduler

Match the cron in each source's registry entry:

```bash
# ANBI — weekly Monday 03:00 UTC
gcloud scheduler jobs create http grantscout-anbi-schedule \
  --location=${REGION} --schedule="0 3 * * 1" --http-method=POST \
  --uri=https://${REGION}-run.googleapis.com/apis/run.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/jobs/grantscout-anbi-sensor:run
# GrantAtlas awardees — daily 04:00 ("0 4 * * *")
# Hiring — daily 05:00 ("0 5 * * *")
```

> Alternatively, the scheduled [GitHub Actions pipeline](ci-cd.md) runs the
> sources daily against production Firestore without Cloud Run jobs. Pick one
> scheduling mechanism to avoid double-ingest.

## 5. Deploy Firestore rules + indexes

```bash
firebase deploy --only firestore        # rules + indexes from firebase.json
```

The rules are the console's authorization contract — review them on every change.
See [Security](security.md).

## 6. Deploy the console

```bash
npm run build                           # console assets → console/dist
firebase deploy --only hosting          # site grantscout-88aa6
```

## Rollback

```bash
gcloud run jobs update grantscout-anbi-sensor \
  --image gcr.io/${PROJECT_ID}/grantscout:previous-tag
```

Firestore: restore from the daily export (see [Operations](operations.md#disaster-recovery)).

## Post-deploy checklist

- [ ] First sensor run succeeds (`syncLogs` shows `success`)
- [ ] Rules deployed; console can read with a team account
- [ ] HubSpot left in dry-run until a payload is reviewed
- [ ] Budget alert configured ([Cost Model](cost-model.md))
- [ ] Monitoring + alerting configured ([Monitoring](monitoring.md))
