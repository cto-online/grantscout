# Glossary

Domain terms used across GrantScout, including the Dutch (NL) vocabulary that
shows up in the data.

## Product & scoring

| Term | Meaning |
|---|---|
| **Demand side** | Organizations that *seek* grants — GrantScout's domain. |
| **Supply side** | Grants + funders — GrantAtlas's domain. |
| **Account Score** | Composite 0–100 score per org: `0.40·Fit + 0.30·Intent + 0.20·Timing + 0.10·Reachability`. |
| **Fit** | Cosine similarity of an org's mission embedding to the ICP centroid. |
| **Intent** | Strongest active buying signal (max-weighted). |
| **Timing** | Recency decay of triggering signals (30-day half-life). |
| **Reachability** | Whether we can reach the right person on an ethical channel. |
| **Tier** | `hot` (≥70), `warm` (≥45), `cold_fit` (fit ≥0.6), `low`. |
| **ICP** | Ideal Customer Profile — seed missions in `src/scoring/icp.ts`. |
| **Signal** | A detected buying-intent event (grant awarded, hiring, etc.). |
| **Provenance** | Where a record came from (source, snapshot, time). |
| **Confidence** | Trust score per record and per field (0–1). |
| **Sensor** | One end-to-end pipeline run for a single source. |
| **Golden record** | The canonical, deduplicated `Organization`. |

## Systems

| Term | Meaning |
|---|---|
| **GrantScout** | This system — demand-side intelligence. |
| **GrantAtlas** | Sibling system mapping grants + funders (supply side). |
| **GrantMaster** | The product whose customers define the ICP (compliance/finance for NGOs). |
| **Beacon** | Planned module for organic/viral acquisition loops. |
| **Orchestrator** | Ranks prospects → HubSpot. |

## Dutch (NL) terms

| Term | Meaning |
|---|---|
| **ANBI** | *Algemeen Nut Beogende Instelling* — a public-benefit (charitable) organization; the NL charity register. |
| **RSIN** | *Rechtspersonen en Samenwerkingsverbanden Informatienummer* — the legal-entity tax number; the strongest dedup key. |
| **KvK** | *Kamer van Koophandel* — Chamber of Commerce (business registration) number. |
| **Doelstelling** | An organization's stated objective / mission. |
| **Belastingdienst** | The Dutch tax authority (publishes the ANBI register). |
| **Subsidieadviseur** | Grants/subsidy advisor (a hiring-signal role). |
| **Fondsenwerver** | Fundraiser (a hiring-signal role). |

## Infrastructure

| Term | Meaning |
|---|---|
| **Cloud Run job** | Serverless container run that executes one sensor and exits. |
| **Cloud Scheduler** | Cron trigger for Cloud Run jobs. |
| **GCS snapshot** | Immutable raw fetch stored in Google Cloud Storage (7-day retention). |
| **Firestore** | The canonical document store and console integration point. |
| **Emulator Suite** | Local Firebase Auth + Firestore for console development. |
| **syncLog** | A Firestore document recording one pipeline run. |
| **Review queue** | Firestore collection of low-confidence orgs awaiting human decision. |
