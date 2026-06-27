# ADR-0002: Deterministic, content-hash IDs

**Status:** Accepted

## Context

Sensors run on a schedule and can fail partway through (network, quota, a bad
record). We need re-runs to be safe: a retry must not create duplicate
organizations or signals. We also ingest the same org from multiple sources and
must converge them onto one record.

## Decision

All primary IDs are **deterministic content hashes** (`src/core/ids.ts`):

- Organization: `canonicalId = SHA256(country :: normalizedName)[0:20]`
- Signal: `id = SHA256(orgId :: type :: occurredAt :: sourceId)[0:20]`

Writes are **upserts** keyed by these IDs. The same input therefore always
produces the same document.

## Consequences

- **Idempotent ingest.** Re-running a sensor overwrites the same documents — no
  duplicates, so failed runs can simply be retried.
- **Natural dedup.** Two sources describing the same org compute the same
  `canonicalId`; the resolver merges their names, missions, and provenance.
- **Stable references.** Scores and review items reference orgs by an ID that
  never changes for a given real-world entity.
- **Trade-off:** the normalized-name component must be computed consistently;
  changes to normalization can shift IDs. Normalization logic is therefore
  centralized and covered by tests (`resolver`, `normalizer`).
