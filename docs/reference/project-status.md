# Project Status

**Status:** Phase 2 complete, console wired end-to-end, ready for GCP deployment.
**Test coverage:** backend Vitest suite green; console Vitest green.

This page is a point-in-time snapshot. The owning docs (architecture, sources,
operations) are the living reference; the [roadmap](roadmap.md) tracks what's next.

## What's implemented

### Ingestion
- **ANBI (NL charity register):** 3K+ orgs, `registry_listed`, ~0.95 confidence.
- **GrantAtlas awardees:** `grant_awarded` (0.8) / `grant_applied` (0.85), ~0.98
  confidence; provider reads the API when configured, sample otherwise.
- **GrantAtlas grants:** opportunities catalog ingest → `/grants` (Firebase
  ID-token auth; sample fallback).
- **Hiring (LLM):** extractor implemented + tested; source disabled until the
  Firecrawl provider lands.

### Scoring
- Fit (real `gemini-embedding-001`, key-gated mock fallback), Intent, Timing
  (30-day half-life), Reachability (default 0.8).
- Composite `0.40·Fit + 0.30·Intent + 0.20·Timing + 0.10·Reach`; tiers
  hot/warm/cold_fit/low; explainable reasons; inline persistence + review enqueue.

### CRM
- HubSpot orchestration: rank by tier then score, payload mapping, **dry-run by
  default**.

### Infrastructure
- Dockerfile + Cloud Build; Cloud Run jobs + Cloud Scheduler; GitHub Actions CI +
  scheduled pipeline; Firestore rules; GCS snapshots (7-day retention).

### Console
- React 19 admin console wired to Firestore end-to-end: every screen reads live
  data; every action (approve/reject, source toggle/edit/add, run trigger,
  settings save) persists. Local QA via the Firebase Emulator Suite + Dev sign-in.

## Known limitations / next actions

| Item | Status | Next |
|---|---|---|
| Real ANBI fetch URL | TODO | Wire Belastingdienst download (currently sample) |
| Firecrawl provider | Stub | Implement to enable `hiring-nl` |
| HubSpot live sync | Dry-run | Enable deliberately after payload review |
| Console CI/CD | Manual | Automate hosting deploys |
| Performance at scale | TBD | Load-test ~10K orgs; consider embedding cache |
| EU expansion | Phase 4 | Add non-NL sources |

## Handoff checklists

**GCP deployment**
- [ ] Review [Architecture](../architecture/overview.md)
- [ ] Follow [Deployment](../operations/deployment.md)
- [ ] Configure Firestore database + [rules](../operations/security.md)
- [ ] Build/push image; deploy Cloud Run jobs; schedule
- [ ] Configure [monitoring + alerting](../operations/monitoring.md)
- [ ] Review HubSpot dry-run before enabling live
- [ ] Set up Firestore backups + DR

**Sales integration**
- [ ] Map prospect properties to HubSpot; create "GrantScout Score" company field
- [ ] Build views/filters for hot/warm prospects
- [ ] Review sample payloads (`scripts/test-pipeline.ts` output)

**Data/analytics**
- [ ] Dashboards on signal quality (confidence distributions)
- [ ] Track conversion vs. GrantScout tier
- [ ] Feedback on Fit accuracy; help tune thresholds after month one

## Pointers

- Architecture → [`docs/architecture/`](../architecture/overview.md)
- Deploy/operate → [`docs/operations/`](../operations/deployment.md)
- Local dev → [Getting Started](../getting-started/installation.md)
- What's next → [Roadmap](roadmap.md)
