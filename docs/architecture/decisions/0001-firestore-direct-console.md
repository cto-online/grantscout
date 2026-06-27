# ADR-0001: Console talks to Firestore directly (no API tier)

**Status:** Accepted

## Context

The admin console needs to read pipeline output (runs, organizations, scores) and
perform a handful of writes (approve/reject review items, toggle sources, save
settings, queue a manual run). The team is small and the data already lives in
Firestore, written by the Cloud Run pipeline. We could build a REST/GraphQL API
tier in front of Firestore, or let the browser use the Firebase Web SDK directly.

## Decision

The console reads and writes Firestore **directly** via the Firebase Web SDK.
There is no separate backend API. Access control is enforced entirely by
**Firestore security rules**, which therefore *are* the API contract.

Authentication is Firebase Auth; a request is authorized when the token is
`email_verified` and the email matches an allowed domain (`@grantmaster.nl` or
`@gible.com`). The pipeline writes as a service account (no auth uid).

## Consequences

- **Least new infrastructure.** No API service to build, deploy, secure, or scale.
- **Rules are load-bearing.** Every access decision is a rule; they must be
  reviewed as carefully as application code. See
  [Security](../../operations/security.md).
- **Real-time is free.** Hot collections (runs, review queue) can use Firestore
  `onSnapshot` for live updates without a websocket layer.
- **Client holds query logic.** Aggregations (e.g. the Overview counts) are
  computed client-side from collection reads.
- **Trade-off:** complex server-side authorization or cross-document invariants
  are harder than with an API tier. If those needs grow, introduce a thin
  callable-functions layer and supersede this ADR.
