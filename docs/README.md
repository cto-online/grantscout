# GrantScout Documentation

Welcome to the GrantScout developer documentation. GrantScout is an internal
**demand-side intelligence system** for GrantMaster: it discovers the NGO
organizations most likely to become GrantMaster customers and ranks them by
**Fit × Intent × Timing × Reachability**.

> GrantAtlas maps the *supply* side (grants + funders). GrantScout mirrors it on
> the *demand* side (the organizations that seek them).

This `/docs` tree is the canonical home for engineering documentation. The
markdown files in the repository root (`ARCHITECTURE.md`, `DEPLOYMENT.md`, …)
are now thin stubs that point here.

---

## Start here

| If you want to… | Read |
|---|---|
| Get the project running locally | [Getting Started → Installation](getting-started/installation.md) |
| See the pipeline run end-to-end in 5 minutes | [Getting Started → Quickstart](getting-started/quickstart.md) |
| Understand how the system fits together | [Architecture → Overview](architecture/overview.md) |
| Add a new data source | [Sources → Adding a Source](sources/adding-a-source.md) |
| Deploy to GCP | [Operations → Deployment](operations/deployment.md) |
| Run or debug the admin console | [Console → Local Development](console/local-development.md) |

## Documentation map

### Getting started
- [Installation](getting-started/installation.md) — prerequisites, clone, install, env files
- [Quickstart](getting-started/quickstart.md) — run the pipeline and the console locally
- [Project Layout](getting-started/project-layout.md) — what lives where
- [Configuration](getting-started/configuration.md) — every environment variable explained

### Architecture
- [Overview](architecture/overview.md) — thesis, system design, deployment tiers
- [Data Model](architecture/data-model.md) — Organization, Signal, AccountScore, Source
- [Pipeline](architecture/pipeline.md) — the seven sensor stages
- [Scoring](architecture/scoring.md) — the Fit × Intent × Timing × Reachability formula
- [Firestore Schema](architecture/firestore-schema.md) — collections, ownership, indexes
- [Decision Records](architecture/decisions/README.md) — ADRs

### Data sources
- [Overview](sources/overview.md) — the source registry, providers, extractors
- [ANBI (NL charity register)](sources/anbi.md)
- [GrantAtlas awardees](sources/grantatlas-awardees.md)
- [GrantAtlas grants (opportunities catalog)](sources/grantatlas-grants.md)
- [Hiring signals](sources/hiring.md)
- [Adding a source](sources/adding-a-source.md)

### Backend
- [Overview](backend/overview.md) — module map of `src/`
- [API Reference](backend/api-reference.md) — exported functions per module
- [Enrichment](backend/enrichment.md) — mission borrowing + ANBI/web scraping
- [HubSpot Sync](backend/hubspot-sync.md) — ranking and the CRM orchestrator
- [Testing](backend/testing.md) — the Vitest suite

### Console (admin frontend)
- [Overview](console/overview.md) — stack and architecture
- [Data Layer](console/data-layer.md) — hooks, converters, query keys
- [Screens](console/screens.md) — routes mapped to Firestore collections
- [Local Development](console/local-development.md) — the Firebase Emulator Suite
- [Design System](console/design-system.md) — colors, typography, components

### Operations
- [Deployment](operations/deployment.md) — GCP setup to Cloud Scheduler
- [Operations Runbook](operations/operations.md) — monitoring, maintenance, DR
- [Monitoring & Alerting](operations/monitoring.md)
- [CI/CD](operations/ci-cd.md) — GitHub Actions + Cloud Build
- [Security](operations/security.md) — Firestore rules, auth model
- [Cost Model](operations/cost-model.md)

### Compliance
- [GDPR / AVG](compliance/gdpr.md) — lawful basis, provenance, opt-out

### Contributing
- [Contributing Guide](contributing/contributing.md) — workflow and conventions
- [Code Style](contributing/code-style.md)
- [Glossary](contributing/glossary.md) — domain terms (NL & EN)

### Reference
- [CLI & npm scripts](reference/cli.md)
- [Environment Variables](reference/environment-variables.md)
- [Roadmap](reference/roadmap.md)
- [Project Status](reference/project-status.md)

---

## System at a glance

```
Cloud Scheduler (cron)
        │
        ▼
Cloud Run Job  ──►  Fetch ─► GCS snapshot ─► Extract ─► Normalize ─► Resolve
   (sensor)                                                              │
                                                                         ▼
                                              Firestore (orgs · signals · scores)
                                                                         │
                          ┌──────────────────────────────────────────────┤
                          ▼                                               ▼
                   HubSpot sync (dry-run/live)                  Admin Console (Firebase Hosting)
```

## Conventions used in these docs

- Code identifiers, file paths, and commands are in `monospace`.
- Backend code lives under `src/`; the React admin console lives under `console/`.
- "Sensor" = one end-to-end pipeline run for a single source.
- Money figures are illustrative euro estimates for the NL-first deployment.

## Keeping docs current

When you change behavior, update the doc that owns that topic (see the map
above). Architecture-level decisions get a new
[ADR](architecture/decisions/README.md). Keep the root stubs as pointers only —
do not let content drift back into them.
