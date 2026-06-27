# Sources Overview

A **source** is a configured data feed. Each source declares *how to fetch* (a
provider), *how to parse* (an extractor / extraction method), and *what signals
it emits*. The canonical list is `SOURCES` in `src/sources/registry.ts`; the type
is `Source` in `src/core/types.ts`.

## The registry

```ts
export const SOURCES: Source[] = [
  { id: 'anbi-nl',             provider: 'http',       extractionMethod: 'deterministic', enabled: true,  … },
  { id: 'grantatlas-awardees', provider: 'grantatlas', extractionMethod: 'deterministic', enabled: true,  … },
  { id: 'hiring-nl',           provider: 'firecrawl',  extractionMethod: 'llm',           enabled: false, … },
];
```

The CLI (`src/index.ts`) looks a source up by `--source <id>` and runs it through
`runSensor`. The separate `grantatlas-grants` id is **not** in `SOURCES` — it is
the opportunities-catalog ingest, dispatched specially (see below).

## Configured sources

| id | Country | Provider | Method | Signals | Schedule | Enabled |
|---|---|---|---|---|---|:--:|
| `anbi-nl` | NL | `http` | deterministic | `registry_listed` | `0 3 * * 1` (Mon 03:00) | ✓ |
| `grantatlas-awardees` | NL | `grantatlas` | deterministic | `grant_awarded`, `grant_applied` | `0 4 * * *` (04:00) | ✓ |
| `hiring-nl` | NL | `firecrawl` | llm | `hiring_grants_role` | `0 5 * * *` (05:00) | ✗ |
| `grantatlas-grants` | NL | (special ingest) | deterministic | — (grants catalog) | daily 04:00 (Actions) | n/a |

Per-source detail:

- [ANBI](anbi.md) — Dutch charity register (deterministic, high confidence).
- [GrantAtlas awardees](grantatlas-awardees.md) — grant winners/applicants (high intent).
- [GrantAtlas grants](grantatlas-grants.md) — the opportunities catalog (separate entity).
- [Hiring signals](hiring.md) — job postings via LLM extraction (medium confidence).

## Providers (the fetch layer)

`runSensor` dispatches on `source.provider`:

| Provider | Module | Status |
|---|---|---|
| `http` | `pipeline/providers/http.ts` (`fetchHttp`) | implemented; supports `http(s)://` and `file://` |
| `grantatlas` | `pipeline/providers/grantatlas.ts` (`fetchGrantAtlasAwardees`) | implemented; sample fallback |
| `firecrawl` | — | stub (throws "not yet implemented") |
| `apify` | — | declared in the type, unused |

## Extractors (the parse layer)

Dispatched on `source.extractionMethod` + `source.id`:

| Extractor | Module | Input → Output |
|---|---|---|
| ANBI | `extractors/anbi.ts` (`extractAnbi`) | TSV → orgs + `registry_listed` |
| GrantAtlas awardees | `extractors/grantatlas.ts` | JSON → orgs + grant signals |
| Hiring | `extractors/hiring.ts` (`extractHiringSignals`) | job postings → orgs + `hiring_grants_role` |
| Gemini (generic LLM) | `extractors/gemini.ts` | text + context → structured fields |

## Confidence by source

| Source | Typical confidence | Why |
|---|---|---|
| GrantAtlas awardees | 0.98 | Structured internal data |
| ANBI | 0.95 | Official public register |
| Hiring (LLM) | 0.6–0.8 | Depends on extraction quality |

## Acquisition tiers & ethics

`acquisitionTier` (`api` / `feed` / `scrape` / `internal`) and `license` document
*how* data is obtained. GrantScout uses **public-record + consented first-party**
data only; scrape-tier sources must respect `robotsPolicy`. See
[Compliance → GDPR](../compliance/gdpr.md).

To add your own source, see [Adding a Source](adding-a-source.md).
