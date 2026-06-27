# Source: Hiring Signals

**id:** `hiring-nl` · **provider:** `firecrawl` · **method:** llm ·
**signals:** `hiring_grants_role` (0.9 — high intent) · **schedule:**
`0 5 * * *` · **confidence:** 0.6–0.8 · **enabled:** `false`

When an organization hires a grants or fundraising role, it's a strong forward
signal that they're scaling grant activity. This source detects those job
postings and extracts the hiring org.

## Status

The source is **disabled** in the registry until ANBI + awardees are proven. The
`firecrawl` fetch provider is also a **stub** (`runSensor` throws "provider
firecrawl not yet implemented"). The LLM extractor, however, is implemented and
unit-tested.

```ts
{ id: 'hiring-nl', provider: 'firecrawl', extractionMethod: 'llm', enabled: false,
  signalTypes: ['hiring_grants_role'],
  fetchConfig: { keywords: ['subsidieadviseur', 'fondsenwerver', 'grants manager'] } }
```

## Extract — `extractHiringSignals(jobPostings, snapshotId)`

`src/pipeline/extractors/hiring.ts`. Given an array of job postings (the sensor
expects `rawData` to be a JSON array of postings), it uses Gemini to:

1. Extract the hiring organization's name.
2. Match the role to the grants/fundraising domain.
3. Emit an `Organization` + a `hiring_grants_role` signal (intent 0.9), with
   confidence reflecting extraction certainty (0.6–0.8).

Dutch keywords (`subsidieadviseur`, `fondsenwerver`, `grants manager`) define
what counts as a relevant role.

## To finish wiring it

1. Implement the `firecrawl` provider in `pipeline/providers/` to scrape job
   boards into the JSON-array shape the extractor expects.
2. Set `enabled: true` in `src/sources/registry.ts`.
3. Provide a `GEMINI_API_KEY` so real extraction runs (otherwise the mock path).

See [Adding a Source](adding-a-source.md) for the provider/extractor contract.

## Why LLM, not deterministic

Job postings are unstructured HTML with no stable schema, so a deterministic
parser is brittle. An LLM extractor trades some confidence (hence the 0.6–0.8
range and the review-queue safety net) for coverage.
