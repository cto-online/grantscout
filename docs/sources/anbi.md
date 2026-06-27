# Source: ANBI (NL Charity Register)

**id:** `anbi-nl` · **provider:** `http` · **method:** deterministic ·
**signals:** `registry_listed` · **schedule:** `0 3 * * 1` (Mondays 03:00 UTC) ·
**confidence:** ~0.95

ANBI is the Dutch tax authority's (Belastingdienst) public register of
charitable organizations (*Algemeen Nut Beogende Instelling*). It's the broadest,
most reliable seed of NL NGOs — 3,000+ organizations — and the backbone of the
demand graph.

## What it provides

- Organization name and legal status
- **RSIN** (the Dutch legal-entity tax number) — the strongest dedup key
- Mission / *doelstelling* (objective) text
- A `registry_listed` signal (intent weight 0.2 — low, it's a baseline presence)

## Fetch

Configured via `fetchConfig`:

```ts
fetchConfig: { url: 'file://data/anbi-sample.tsv', format: 'tsv' }
```

The committed sample (`data/anbi-sample.tsv`) lets the source run fully offline.
The production download URL from the Belastingdienst is still to be wired — the
public endpoint currently returns HTML rather than the TSV, tracked as a TODO in
`registry.ts`.

## Extract — `extractAnbi(rawData, snapshotId)`

`src/pipeline/extractors/anbi.ts`:

1. Split TSV into rows; map columns (RSIN, Naam, Doelstelling, Status).
2. Filter out rows with empty RSIN or name.
3. Emit one `Organization` (with RSIN identifier, mission, NL country) and one
   `registry_listed` `Signal` per valid row.

Per-field confidence is high for RSIN (1.0) and name, lower for free-text mission.

## Live ANBI registry (enrichment)

Beyond the bulk TSV, `src/sources/anbiRegistry.ts` can index the live ANBI XML
and look an org up by name (`indexAnbiXml`, `loadAnbiRegistry`, `lookupAnbi`).
This powers mission **enrichment** for awardee orgs that arrive without a
mission. See [Backend → Enrichment](../backend/enrichment.md).

## Run it

```bash
npm run pipeline:once -- --source anbi-nl     # via the sensor
npx tsx scripts/test-anbi.ts                  # offline, in-memory, prints results
```

## Notes & gotchas

- **RSIN is king.** Because the resolver groups on RSIN first, ANBI records give
  every downstream merge a high-confidence anchor.
- The `registry_listed` signal is intentionally low-weight: being in the register
  is presence, not intent. Real intent comes from awardee and hiring signals.
- Mission text quality varies; low-confidence missions can route the org to the
  review queue.
