# CI/CD

GrantScout uses **GitHub Actions** for CI and for the scheduled production
pipeline, and **Cloud Build** for container image builds.

## GitHub Actions

### `ci` — on every push and pull request

`.github/workflows/ci.yml`:

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4         # node 20, npm cache
- run: npm ci --include=dev           # .npmrc omits dev; CI needs the tooling
- run: npm run typecheck
- run: npm test
```

> The repo `.npmrc` sets `omit=dev` so Docker images stay lean. CI overrides with
> `--include=dev` to get TypeScript/Vitest. Keep this gate green.

### `pipeline` — scheduled production ingest

`.github/workflows/pipeline.yml` runs the real ingest into production Firestore,
daily at 04:00 UTC and on manual `workflow_dispatch`.

- **Guard:** `if: github.repository == 'cto-online/grantscout'` (won't run on forks).
- **Concurrency:** `group: pipeline`, `cancel-in-progress: false` (no overlapping
  ingests).
- **Sources:** defaults to `anbi-nl,grantatlas-awardees,grantatlas-grants`;
  overridable via the dispatch input. The workflow loops over the comma-separated
  ids and runs `npx tsx src/index.ts --source=<id>` for each.
- **Auth:** writes the service-account key from a secret to a temp file
  (`GOOGLE_APPLICATION_CREDENTIALS`) and removes it in an `always()` step.

Required repository secrets (Settings → Secrets and variables → Actions):

| Secret | Purpose |
|---|---|
| `GCP_SA_KEY` | Service-account JSON (Firestore + GCS write) |
| `GEMINI_API_KEY` | Real Fit embeddings |
| `GRANTATLAS_FB_API_KEY` | GrantAtlas Firebase Web API key (grants catalog) |
| `GRANTATLAS_PROJECT_ID` | GrantAtlas Firebase project id |

Production env is set inline in the workflow: `GCP_PROJECT_ID=grantscout-88aa6`,
`GCS_RAW_BUCKET=grantscout-88aa6-grantscout-raw`,
`GRANTATLAS_BASE_URL=https://grantatlas-prod.web.app`.

> **Choose one scheduler.** The Actions pipeline and Cloud Scheduler + Cloud Run
> jobs ([Deployment](deployment.md)) both ingest into production. Run one to avoid
> double-ingest (idempotent IDs make double runs harmless but wasteful).

## Cloud Build

`cloudbuild.yaml` builds and pushes the container, tagged with both the commit SHA
and `latest`:

```
1. docker build -t gcr.io/$PROJECT_ID/grantscout:$COMMIT_SHA -t …:latest .
2. docker push …:$COMMIT_SHA
3. deploy step (gke-deploy)              # adjust to your Cloud Run job deploy
images: [ …:$COMMIT_SHA, …:latest ]
timeout: 1800s
```

Trigger it manually or from a build trigger:

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions COMMIT_SHA=$(git rev-parse --short HEAD)
```

## Container image

`Dockerfile` (`node:20-slim`): copy, `npm ci --only=production`, `npm run build`,
entrypoint `npm run pipeline:once --`, default `CMD ["--source","anbi-nl"]`. Build
locally with `npm run docker:build`; smoke test with `npm run docker:test`.

## Release flow (recommended)

```
PR → ci (typecheck + test) green → review → merge to main
   → Cloud Build image (SHA + latest)
   → Cloud Run jobs use :latest (or pin :SHA)
   → scheduled pipeline ingests on cron
```

Console deploys (`firebase deploy --only hosting`) are currently manual —
automating them is on the [roadmap](../reference/roadmap.md).
