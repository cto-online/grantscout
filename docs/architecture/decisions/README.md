# Architecture Decision Records (ADRs)

ADRs capture significant, hard-to-reverse decisions: the context, the choice, and
the consequences. They are immutable once accepted — to change a decision, add a
new ADR that supersedes the old one.

## Format

Each ADR follows a light template:

```
# ADR-NNNN: Title
Status: Accepted | Superseded by ADR-XXXX | Proposed
Context  — what forces are at play?
Decision — what we chose.
Consequences — the trade-offs we accept.
```

## Index

| # | Title | Status |
|---|---|---|
| [0001](0001-firestore-direct-console.md) | Console talks to Firestore directly (no API tier) | Accepted |
| [0002](0002-deterministic-ids.md) | Deterministic, content-hash IDs | Accepted |
| [0003](0003-dry-run-hubspot.md) | HubSpot sync is dry-run by default | Accepted |

## Adding an ADR

1. Copy the template above into `NNNN-short-title.md` (next number).
2. Fill in Context / Decision / Consequences.
3. Add a row to the index table.
4. Reference it from the relevant doc (e.g. [Overview](../overview.md)).
