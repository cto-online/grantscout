# Enrichment

Awardee and hiring orgs often arrive **without a mission**. Since **Fit** is the
highest-weighted scoring axis (0.40) and is computed from the mission embedding,
a missing mission would peg Fit at the 0.3 fallback and bury good prospects. Two
cheap enrichment passes run in the sensor, after resolve and before write.

```
resolve → enrichMissions (borrow) → enrichFromAnbiRegistry (ANBI + web) → write
```

## Pass 1 — Borrow (`enrich.ts`)

`enrichMissions(orgs)` builds an in-memory index of orgs that already have a
mission (keyed by a normalized `nameKey`) and copies a mission onto any
missionless org with a matching name. Free, no network.

```ts
nameKey(name)                       // normalize for matching
buildMissionIndex(orgs)             // name → mission
enrichAgainstIndex(orgs, index)     // fill blanks
enrichMissions(orgs) → { orgs, enriched }
```

## Pass 2 — ANBI register + website (`enrichAnbi.ts` + `missionScraper.ts`)

For orgs still missing a mission, `enrichFromAnbiRegistry(orgs)`:

1. Looks the org up in the **live ANBI register** (`sources/anbiRegistry.ts`:
   `lookupAnbi(name)`), which can carry the official *doelstelling*.
2. If needed, scrapes the org's website for its mission via
   `missionScraper.ts`: `fetchPageText(url)` downloads the page, `htmlToText`
   strips markup, and `scrapeDoelstelling(...)` (optionally aided by
   `ai/gemini.ts → extractDoelstelling`) pulls the objective text.

Returns `{ orgs, enriched, matched }`.

## In the sensor

```ts
const borrow = await enrichMissions(Array.from(resolvedOrgs.values()));
const anbi   = await enrichFromAnbiRegistry(borrow.orgs);
const orgsToWrite = anbi.orgs;
// logs: "Enriched N missions (borrow X, ANBI+web Y/Z matched)"
```

## Why it matters

| Without enrichment | With enrichment |
|---|---|
| Awardee org has no mission → Fit ≈ 0.3 | Real mission → genuine cosine Fit |
| Strong-intent org scores low on the dominant axis | Intent and Fit both contribute |
| More orgs flagged low-confidence → review queue | Higher-quality golden records |

## Cost & etiquette

Borrowing is free. The ANBI lookup hits a public register; website scraping is
rate-light and best-effort (failures are swallowed — enrichment never fails the
ingest). Respect source `robotsPolicy` and the
[GDPR posture](../compliance/gdpr.md): only public-record and consented data.
