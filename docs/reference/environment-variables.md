# Environment Variables Reference

Flat lookup of every environment variable. For the *why* and the degradation
behavior, see [Getting Started → Configuration](../getting-started/configuration.md).

## Backend (`.env`)

Consumed by `src/core/config.ts`.

| Variable | Default | Required for | Notes |
|---|---|---|---|
| `GCP_PROJECT_ID` | `grantscout` | Firestore writes | Unset/no ADC → writes skipped (warn) |
| `FIRESTORE_DATABASE_ID` | `(default)` | Firestore | — |
| `GCS_RAW_BUCKET` | `grantscout-raw` | Snapshots | Bucket for immutable raw fetches |
| `GEMINI_API_KEY` | `""` | Real embeddings/LLM | Unset → keyword mock embedder |
| `TYPESENSE_HOST` | `""` | Search (future) | — |
| `TYPESENSE_API_KEY` | `""` | Search (future) | — |
| `GRANTATLAS_READ_API_URL` | `""` | Awardees API | Unset → committed sample |
| `GRANTATLAS_API_KEY` | `""` | Awardees API | Bearer token |
| `GRANTATLAS_BASE_URL` | `https://grantatlas-prod.web.app` | Grants catalog | Console Admin API base |
| `GRANTATLAS_FB_API_KEY` | `""` | Grants catalog | Firebase Web API key |
| `GRANTATLAS_PROJECT_ID` | `""` | Grants catalog | Firebase project id |
| `GRANTATLAS_BOT_UID` | `pipeline-bot` | Grants catalog | Allowlisted bot identity |
| `HUBSPOT_ACCESS_TOKEN` | `""` | CRM sync | Private-app token |
| `HUBSPOT_SYNC_ENABLED` | `false` | Live CRM sync | `true` → live upserts; else dry-run |
| `GOOGLE_APPLICATION_CREDENTIALS` | — | GCP auth (ADC) | Path to service-account key (off GCP) |

## Console (`console/.env`)

Vite build-time; only `VITE_`-prefixed vars reach the browser.

| Variable | Default | Required for | Notes |
|---|---|---|---|
| `VITE_FIREBASE_API_KEY` | — | Auth/Firestore | Dummy OK under emulator |
| `VITE_FIREBASE_PROJECT_ID` | — | Auth/Firestore | Dummy OK under emulator |
| `VITE_FIREBASE_AUTH_DOMAIN` | — | Auth | Dummy OK under emulator |
| `VITE_USE_EMULATOR` | `false` | Local QA | `true` → emulator wiring + Dev sign-in |

## CI / Actions secrets

Used by the scheduled [`pipeline` workflow](../operations/ci-cd.md).

| Secret | Purpose |
|---|---|
| `GCP_SA_KEY` | Service-account JSON (Firestore + GCS write) |
| `GEMINI_API_KEY` | Real Fit embeddings |
| `GRANTATLAS_FB_API_KEY` | GrantAtlas Firebase Web API key |
| `GRANTATLAS_PROJECT_ID` | GrantAtlas Firebase project id |

Production env set inline in the workflow: `GCP_PROJECT_ID=grantscout-88aa6`,
`GCS_RAW_BUCKET=grantscout-88aa6-grantscout-raw`,
`GRANTATLAS_BASE_URL=https://grantatlas-prod.web.app`.

## Quick rules of thumb

- **No secrets at all** → tests + offline scripts still run (sample data + mock
  embedder + skipped Firestore).
- **HubSpot** is dry-run unless `HUBSPOT_ACCESS_TOKEN` is set **and**
  `HUBSPOT_SYNC_ENABLED=true`.
- **GrantAtlas** sources fall back to committed samples until their respective
  credentials are configured.
