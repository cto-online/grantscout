# Source: GrantAtlas Grants (Opportunities Catalog)

**id:** `grantatlas-grants` · **target collection:** `/grants` · **auth:**
Firebase ID token (custom-token exchange)

Unlike the org sensors, this ingest pulls the **grants themselves** — GrantAtlas's
opportunities catalog — into the `/grants` Firestore collection. It is a distinct
entity from awardee *organizations*, and it does not run through `runSensor`.

## Dispatch

`src/index.ts` special-cases the id before consulting `SOURCES`:

```ts
if (sourceId === 'grantatlas-grants') {
  const { ingestGrants } = await import('./sources/grantatlas/ingest.js');
  const res = await ingestGrants();
  console.log(`✓ GrantAtlas opportunities ingested: ${res.grants}`);
  return;
}
```

## Modules

| File | Responsibility |
|---|---|
| `sources/grantatlas/client.ts` | `mintGrantAtlasIdToken()`, `fetchGrants()` — auth + API read |
| `sources/grantatlas/grants.ts` | `projectGrant(raw)` — map raw API shape → `GrantOpportunity` |
| `sources/grantatlas/ingest.ts` | `ingestGrants()` — fetch, project, write `/grants` |

## Authentication

The Console Admin API is gated behind GrantAtlas's Firebase project. The client
mints a Firebase **ID token** by exchanging a custom token for the
`GRANTATLAS_BOT_UID` identity (default `pipeline-bot`), using:

| Variable | Purpose |
|---|---|
| `GRANTATLAS_BASE_URL` | API base (default `https://grantatlas-prod.web.app`) |
| `GRANTATLAS_FB_API_KEY` | GrantAtlas Firebase Web API key |
| `GRANTATLAS_PROJECT_ID` | GrantAtlas Firebase project id |
| `GRANTATLAS_BOT_UID` | Allowlisted bot identity |

If these are unset (or the bot isn't yet allowlisted on the GrantAtlas side), the
ingest falls back to the committed sample `data/grantatlas-grants-sample.json`.

## Run it

```bash
npm run pipeline:once -- --source grantatlas-grants
```

In CI, the scheduled [`pipeline` workflow](../operations/ci-cd.md) runs this id
alongside `anbi-nl` and `grantatlas-awardees`.

## Product note

The console currently surfaces a **Grants** screen and an **Organizations**
screen. Whether grant opportunities should be a fully distinct product entity (vs.
reading `organizations`) is flagged for product in the
[roadmap](../reference/roadmap.md). The backend already treats `/grants` as its
own collection.
