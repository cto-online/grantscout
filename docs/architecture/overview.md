# Architecture Overview

GrantScout is a **demand-side intelligence system** for GrantMaster. It ingests
organizations that seek grants, scores them on **Fit × Intent × Timing ×
Reachability**, and surfaces the top prospects to the sales team via HubSpot and
an admin console.

## Thesis

GrantAtlas already maps every grant and funder — the **supply** side. GrantScout
mirrors this for the **demand** side: every organization that seeks grants. By
scoring on fit to GrantMaster's capabilities and recent grant activity, we
convert discovery into sales at the lowest possible cost.

A useful framing of the three sibling systems:

| System | Role | Relationship to GrantScout |
|---|---|---|
| **GrantAtlas** | Supply side (grants + funders) | Source of awardee lists + the opportunities catalog |
| **GrantScout** | Demand side (orgs that seek grants) | This repo |
| **GrantMaster** | Do-the-work (compliance, finance) | Its customer base defines the ICP |

## The four modules

- **Sensor** — signal ingestion (ANBI, GrantAtlas awardees, hiring).
- **Scorer** — Account Score + the canonical demand graph.
- **Beacon** — feeds organic/viral acquisition loops (later phases).
- **Orchestrator** — ranks prospects → HubSpot / team.

## System design

```
Cloud Scheduler (cron)
        │
        ▼
Cloud Run Job (sensor)
   ├─ Fetch & store snapshot (GCS)
   ├─ Extract → Normalize → Resolve
   ├─ Write organizations + signals to Firestore
   ├─ Score inline (scoreAndPersist)
   │     ├─ Write accountScores
   │     └─ Enqueue low-confidence orgs → reviewQueue
   └─ HubSpot sync (rank prospects → upsert companies, dry-run by default)

Firestore ──► Admin Console (Firebase Hosting)
           └─ team reads dashboards + actions review/sources/settings
```

Two key properties shape everything else:

1. **There is no API tier.** The console talks to Firestore directly via the
   Firebase Web SDK, so the **security rules are the API contract**. See
   [ADR-0001](decisions/0001-firestore-direct-console.md).
2. **Every step is deterministic and idempotent.** Hash-based IDs mean re-running
   a sensor produces the same documents — safe retries, no duplicates. See
   [ADR-0002](decisions/0002-deterministic-ids.md).

## Data flow (one sensor run)

See [Pipeline](pipeline.md) for the stage-by-stage detail. In brief:

```
Source → Fetch (provider) → GCS snapshot → Extract → Normalize (Zod)
       → Resolve (dedup/merge) → Enrich missions → Write Firestore
       → Score inline → Enqueue review → Write syncLog
```

## Component boundaries

| Component | Tech | Deploy target | Writes |
|---|---|---|---|
| Sensor pipeline | Node 20, TypeScript (ESM) | Cloud Run job | orgs, signals, scores, reviewQueue, syncLogs |
| Admin console | React 19, Vite, Tailwind v4 | Firebase Hosting | reviewQueue, sources, settings, syncLogs (manual run) |
| Raw storage | GCS | GCS bucket | immutable snapshots |
| Canonical store | Firestore | Firestore | — |
| CRM sink | HubSpot | external | companies (dry-run/live) |

## Deployment tiers

```
Development (Local)
├─ Firebase Emulator Suite (Auth + Firestore) + seed script
├─ Console: VITE_USE_EMULATOR=true → "Dev sign-in" (no Google OAuth)
├─ GCS (local mock or dev bucket)
├─ Gemini mock (keyword-based embeddings)
└─ HubSpot: dry-run only

Staging (GCP Project)
├─ Real Firestore (separate database)   ├─ Real GCS bucket
├─ Real Gemini API                      ├─ Real HubSpot (dry-run flag)
└─ CI/CD via Cloud Build

Production (Main GCP Project)
├─ Real Firestore (prod database)       ├─ Real GCS w/ lifecycle policies
├─ Real Gemini API (prod quota)         ├─ Real HubSpot (live upserts)
├─ Cloud Monitoring dashboards + alerts └─ Daily Firestore export backups
```

## Key design decisions

1. **Deterministic IDs** → idempotent re-runs, safe retries.
2. **Provenance on every record** → trust, lineage, regulatory compliance.
3. **Per-field confidence** → drives what to trust vs. send to human review.
4. **Scoring weights** (0.40 Fit + 0.30 Intent) → prevents false positives.
5. **Firestore, not SQL** → schema-less, real-time, GCS-backed.
6. **Cloud Run, not servers** → scales to zero, pay-per-execution, easy cron.
7. **Dry-run HubSpot** → review payloads before any live sync.
8. **NL-first** → start with the most accessible data, expand later.

These are captured as [Architecture Decision Records](decisions/README.md).

## Where to go next

- [Data Model](data-model.md) — the four core entities.
- [Pipeline](pipeline.md) — the seven sensor stages.
- [Scoring](scoring.md) — the formula in depth.
- [Firestore Schema](firestore-schema.md) — collections and ownership.
- [Security](../operations/security.md) — the rules that gate it all.
