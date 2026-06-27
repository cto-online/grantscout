# ADR-0003: HubSpot sync is dry-run by default

**Status:** Accepted

## Context

The orchestrator ranks prospects and upserts them to HubSpot as companies. Writing
to a live CRM is a side effect that's hard to undo and easy to get wrong
(mismapped properties, accidental overwrites, noisy records during testing).

## Decision

HubSpot sync is **dry-run unless explicitly enabled**. The behavior is gated on
`HUBSPOT_SYNC_ENABLED` (default `false`) read in `src/core/config.ts`. In dry-run
mode the orchestrator computes and logs the exact payloads it *would* send but
performs no writes. Live upserts require both a valid `HUBSPOT_ACCESS_TOKEN` and
`HUBSPOT_SYNC_ENABLED=true`.

## Consequences

- **Low-risk launch.** Payloads can be reviewed in logs / the dry-run run record
  before any company is touched.
- **Safe by default in every environment** — local, CI, staging — without extra
  guards. You must opt in to live sync.
- **Auditable.** Dry-run payloads are logged with `service: hubspot` and
  `status: dry-run`, queryable in Cloud Logging and visible in Pipeline Runs.
- **Trade-off:** enabling live sync is a manual, deliberate step (env change +
  redeploy/job update). That friction is intentional. See
  [Backend → HubSpot Sync](../../backend/hubspot-sync.md).
