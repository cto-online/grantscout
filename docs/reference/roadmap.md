# Roadmap

Phase status as reflected in the codebase and prior planning docs. For the
detailed current state see [Project Status](project-status.md).

## Phase 1 — Scaffold & core pipeline ✅

- ANBI + GrantAtlas extractors
- Scoring formula (Fit × Intent × Timing × Reachability)
- HubSpot dry-run sync
- End-to-end testing

## Phase 2 — Production deployment & operations ✅

- Hiring signals extractor (LLM-based)
- Cloud Run deployment (Dockerfile, Cloud Build)
- Firestore persistence (orgs, signals, scores, review queue)
- Admin console wired to Firestore (live dashboards + review/source/settings
  actions, real-time)
- Monitoring & operations docs

## Phase 3 — Next

- **Beacon:** organic/viral loops (content/SEO/AEO, referral, funder-led)
- ✅ Real Gemini embeddings (`gemini-embedding-001`, key-gated with mock fallback)
- ✅ GrantAtlas awardee provider (reads API when configured, sample otherwise)
- HubSpot live sync + sync tracking
- GrantAtlas funder linking
- Grants catalog ingest (`grantatlas-grants` → `/grants`) — wired; product to
  decide whether grants become a fully distinct console entity (see naming note
  in [Console → Screens](../console/screens.md))

## Phase 4 — ML & expansion

- ML-trained Fit model (replace keyword/embedding heuristic)
- EU/world expansion beyond NL
- Learning loop (win/loss feedback into scoring)
- Advanced segmentation (use cases, geographies)

## Known follow-ups

| Item | State | Next action |
|---|---|---|
| Real ANBI download URL | TODO | Belastingdienst endpoint returns HTML, not TSV |
| Firecrawl provider | Stub | Implement to enable `hiring-nl` |
| HubSpot live sync | Dry-run | Set `HUBSPOT_SYNC_ENABLED=true`, review payload first |
| Console CI/CD | Manual | Automate `firebase deploy --only hosting` |
| Snapshot replay | TODO | Re-extract from a stored GCS snapshot |
| Embedding cache | In-memory | Consider Redis before EU-scale growth |
| Screen-level console tests | Partial | Broaden RTL coverage |

## Scheduling note

Both Cloud Scheduler + Cloud Run jobs and the GitHub Actions `pipeline` workflow
can drive production ingest. Standardize on one to avoid double work (idempotent
IDs make overlap harmless but wasteful). See [CI/CD](../operations/ci-cd.md).
