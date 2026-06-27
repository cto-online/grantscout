# Source: GrantAtlas Awardees

**id:** `grantatlas-awardees` · **provider:** `grantatlas` · **method:**
deterministic · **signals:** `grant_awarded` (0.8), `grant_applied` (0.85) ·
**schedule:** `0 4 * * *` (daily 04:00 UTC) · **confidence:** ~0.98

This is the highest-intent source: organizations that have *won* or *applied for*
grants. GrantAtlas (the supply-side system) already knows the awardees; GrantScout
ingests those lists and converts each into a high-weight intent signal.

## What it provides

- Organization name
- Funder, grant amount, award/application date (in the signal `payload`)
- `grant_awarded` and `grant_applied` signals — the strongest demand signals

## Fetch — `fetchGrantAtlasAwardees(source)`

`src/pipeline/providers/grantatlas.ts`:

- When `GRANTATLAS_READ_API_URL` (and `GRANTATLAS_API_KEY`) are configured, it
  reads the awardee/applicant list from the API.
- Otherwise it falls back to the committed sample `data/grantatlas-sample.json`,
  so the source runs offline.

## Extract — `extractGrantAtlasAwardees(rawData, snapshotId)`

`src/pipeline/extractors/grantatlas.ts`:

1. Parse awardee records from JSON.
2. Dedup by `awardee_name + funder + grant`.
3. Emit an `Organization` and a `grant_awarded`/`grant_applied` `Signal` with the
   funder, amount, and date in the payload.

## Why missions get enriched

Awardee records frequently lack a mission, which would peg **Fit** at the 0.3
fallback. The sensor therefore enriches these orgs after resolve: it borrows a
mission from a known org with the same name, then looks the org up in the live
ANBI register and scrapes its website's *doelstelling*. See
[Backend → Enrichment](../backend/enrichment.md).

## Run it

```bash
npm run pipeline:once -- --source grantatlas-awardees
```

## Relationship to the grants catalog

Awardees (this source) are **organizations with intent signals**. The separate
[`grantatlas-grants`](grantatlas-grants.md) ingest pulls the **opportunities
catalog** (grants themselves) into `/grants` — a different entity with a
different auth path. Don't conflate the two.
