# Configuration

GrantScout reads configuration from environment variables. There are two
surfaces: the **backend** (`.env`, consumed by `src/core/config.ts`) and the
**console** (`console/.env`, consumed at build time by Vite). This page explains
each value and how the system degrades gracefully when it is unset. For a flat
lookup table, see the [Environment Variables reference](../reference/environment-variables.md).

## Backend (`.env`)

Loaded through `src/core/config.ts`, which provides safe defaults so the
pipeline can run offline.

### Core GCP

| Variable | Default | Purpose |
|---|---|---|
| `GCP_PROJECT_ID` | `grantscout` | Firebase Admin project. Without real creds, Firestore init warns and writes are skipped. |
| `FIRESTORE_DATABASE_ID` | `(default)` | Firestore database id. |
| `GCS_RAW_BUCKET` | `grantscout-raw` | Bucket for immutable raw snapshots. |

Authentication to GCP uses **Application Default Credentials** — set
`GOOGLE_APPLICATION_CREDENTIALS` to a service-account key path, or run on GCP
where ADC is automatic.

### AI / embeddings

| Variable | Default | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | `""` | Enables real `gemini-embedding-001` Fit embeddings and LLM extraction. **Unset → keyword-based mock embedder** (deterministic, offline). |

### Search (optional)

| Variable | Default | Purpose |
|---|---|---|
| `TYPESENSE_HOST` | `""` | Typesense host, if/when search indexing is wired. |
| `TYPESENSE_API_KEY` | `""` | Typesense API key. |

### GrantAtlas — awardees provider

| Variable | Default | Purpose |
|---|---|---|
| `GRANTATLAS_READ_API_URL` | `""` | Awardee/applicant list API. **Unset → committed sample fallback** (`data/grantatlas-sample.json`). |
| `GRANTATLAS_API_KEY` | `""` | Bearer token for the awardee API. |

### GrantAtlas — grants (opportunities) catalog

The grants catalog authenticates with a Firebase ID token minted via a
custom-token exchange (see `src/sources/grantatlas/client.ts`).

| Variable | Default | Purpose |
|---|---|---|
| `GRANTATLAS_BASE_URL` | `https://grantatlas-prod.web.app` | Console Admin API base. |
| `GRANTATLAS_FB_API_KEY` | `""` | GrantAtlas Firebase Web API key. |
| `GRANTATLAS_PROJECT_ID` | `""` | GrantAtlas Firebase project id. |
| `GRANTATLAS_BOT_UID` | `pipeline-bot` | Service identity allowlisted on the GrantAtlas side. |

Unset → the `grantatlas-grants` ingest falls back to
`data/grantatlas-grants-sample.json`.

### HubSpot

| Variable | Default | Purpose |
|---|---|---|
| `HUBSPOT_ACCESS_TOKEN` | `""` | Private-app token for company upserts. |
| `HUBSPOT_SYNC_ENABLED` | `false` | **`false` → dry-run** (payloads logged, nothing written). `true` → live upserts. |

> **Safety default:** HubSpot is dry-run unless explicitly enabled. See
> [Backend → HubSpot Sync](../backend/hubspot-sync.md).

## Console (`console/.env`)

Vite exposes only variables prefixed with `VITE_` to the browser bundle.

| Variable | Default | Purpose |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | — | Firebase Web API key. |
| `VITE_FIREBASE_PROJECT_ID` | — | Firebase project id. |
| `VITE_FIREBASE_AUTH_DOMAIN` | — | Firebase auth domain. |
| `VITE_USE_EMULATOR` | `false` | `true` wires Auth + Firestore to the local emulator and shows the **Dev sign-in** button. |

When `VITE_USE_EMULATOR=true`, the three `VITE_FIREBASE_*` values can be dummy
strings — the emulator does not validate them.

## Degradation matrix

GrantScout is designed so that a missing credential downgrades a feature rather
than crashing the run:

| Missing | Effect |
|---|---|
| `GCP_PROJECT_ID` / ADC | Firestore writes skipped (warn); pipeline logic still runs. |
| `GEMINI_API_KEY` | Mock keyword embedder used for Fit; deterministic, lower fidelity. |
| `GRANTATLAS_READ_API_URL` | Awardees read from committed sample. |
| `GRANTATLAS_FB_API_KEY` / `_PROJECT_ID` | Grants catalog reads from committed sample. |
| `HUBSPOT_ACCESS_TOKEN` or `HUBSPOT_SYNC_ENABLED=false` | HubSpot dry-run only. |

This is what makes the offline scripts and CI possible without secrets.
