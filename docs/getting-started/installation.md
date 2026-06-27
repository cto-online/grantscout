# Installation

This guide gets a working local checkout of GrantScout — both the backend
pipeline (`src/`) and the React admin console (`console/`).

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 20 | Enforced by `engines.node` in `package.json`. |
| npm | ≥ 10 | Ships with Node 20. |
| Firebase CLI | latest | Only needed for the console emulator + hosting deploys (`npm i -g firebase-tools`). |
| gcloud CLI | latest | Only needed to deploy to GCP — see [Deployment](../operations/deployment.md). |
| Docker | latest | Optional, for container builds (`npm run docker:build`). |

You do **not** need any cloud credentials to run the test suite or the in-memory
pipeline scripts — they run fully offline with committed sample data.

## Clone and install

```bash
git clone https://github.com/cto-online/grantscout.git
cd grantscout
npm install
```

The root install also pulls the console's dependencies — `console/` is a
self-contained Vite app with its own `package.json`. If you only touched the
console, you can install there directly:

```bash
cd console && npm install
```

> **Note on `.npmrc`.** The repo's `.npmrc` sets `omit=dev` so Docker production
> images stay lean. CI overrides this with `npm ci --include=dev` to get the test
> tooling. A normal local `npm install` includes dev dependencies as usual.

## Environment files

Two independent environment surfaces exist — one for the backend, one for the
console. Copy the examples and fill in what you need:

```bash
cp .env.example .env                  # backend pipeline
cp console/.env.example console/.env  # admin console
```

For purely local work you can leave most values blank:

- The backend falls back to **committed sample data** and a **keyword-based mock
  embedder** when `GEMINI_API_KEY` and source URLs are unset.
- The console runs against the **Firebase Emulator Suite** when
  `VITE_USE_EMULATOR=true`, so no real Firebase project is required.

Every variable is documented in [Configuration](configuration.md) and the
consolidated [Environment Variables reference](../reference/environment-variables.md).

## Verify the install

```bash
npm run typecheck   # tsc --noEmit across src/ + test/
npm test            # Vitest suite (offline)
npx tsx scripts/test-pipeline.ts   # full pipeline on sample data, no cloud
```

If all three succeed, you have a healthy checkout. Continue with the
[Quickstart](quickstart.md).

## Troubleshooting

| Symptom | Fix |
|---|---|
| `engine "node" is incompatible` | Install Node 20+ (`node --version`). |
| `firestore not initialized` warning in scripts | Expected offline — scripts that don't need Firestore ignore it. |
| Console build fails on Tailwind | Tailwind v4 uses the Vite plugin, not PostCSS — no `postcss.config` needed. |
| `tsx: command not found` | Run via `npx tsx …` or ensure dev deps are installed. |
