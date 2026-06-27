# Security

Because the console talks to Firestore directly, **`firestore.rules` is the
authorization layer for the entire product**. There is no API tier to add checks
in — review the rules with the same rigor as application code
([ADR-0001](../architecture/decisions/0001-firestore-direct-console.md)).

## Identities

Two predicates gate every collection:

```
isService()  — request.auth == null || request.auth.uid == null
               (Cloud Run ingest: Admin SDK has no auth uid)

isTeam()     — request.auth != null
               && token.email_verified == true
               && email matches @grantmaster.nl OR @gible.com
```

> Firestore rules have **no `string.endsWith()`** — domain checks use RE2
> `matches()` anchored to the domain, e.g. `.*@grantmaster[.]nl$`. The emulator
> dev user `dev@grantmaster.nl` satisfies `isTeam()`.

## Access matrix

| Collection | Write | Read |
|---|---|---|
| `organizations` | `isService()` | `isTeam()` |
| `signals` | `isService()` | `isTeam()` |
| `accountScores` | `isService()` | `isTeam()` |
| `grants` | `isService()` | `isTeam()` |
| `sources` | `isService() \|\| isTeam()` | `isTeam()` |
| `syncLogs` | `isService() \|\| isTeam()` | `isTeam()` |
| `reviewQueue` | `isTeam()` | `isTeam()` |
| `settings` | `isTeam()` | `isTeam()` |
| `rawSnapshots` | `isService()` | **denied** (use GCS) |

Rationale: the pipeline (service) owns ingested truth; the team can act on
workflow collections (`reviewQueue`, `settings`), and on `sources`/`syncLogs`
they can configure and enqueue runs. Raw bytes are never served from Firestore.

## Threat model & mitigations

| Risk | Mitigation |
|---|---|
| Unauthorized read of prospect data | `isTeam()` + verified email + domain allowlist |
| Tampering with ingested records | Only `isService()` writes orgs/signals/scores/grants |
| Privilege via unverified email | `email_verified == true` required |
| Exposed raw snapshots | Firestore reads denied; GCS bucket is private |
| Leaked secrets in CI | SA key written to temp file, removed in `always()` step |
| Accidental CRM writes | HubSpot dry-run by default ([ADR-0003](../architecture/decisions/0003-dry-run-hubspot.md)) |

## Secrets

- **Local:** `.env` / `console/.env` (git-ignored). Never commit real keys.
- **CI:** GitHub Actions secrets (`GCP_SA_KEY`, `GEMINI_API_KEY`,
  `GRANTATLAS_*`). See [CI/CD](ci-cd.md).
- **Runtime:** Cloud Run job env vars / ADC. Prefer a dedicated service account
  with least privilege (Firestore + GCS write only).

## Changing the rules

1. Edit `firestore.rules`.
2. Validate against the emulator (`firebase emulators:exec` rules tests, or
   manual QA via the console's Dev sign-in).
3. Deploy: `firebase deploy --only firestore`.
4. Re-confirm the console can read with a real team account and that service
   ingest still writes.

## Domain allowlist

Allowed domains live **in the rules** (`@grantmaster.nl`, `@gible.com`) and are
mirrored by the console's auth check. To add a domain, update both the rule
`matches()` predicate and the console guard, then redeploy rules + console.
