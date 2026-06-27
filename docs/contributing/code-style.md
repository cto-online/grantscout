# Code Style

Conventions that keep GrantScout consistent. Enforced by `tsc` (strict) and
ESLint; the rest is convention.

## Language & modules

- **TypeScript, ESM** throughout. Backend `import` paths use the **`.js`
  extension** (compiled-output convention for Node ESM), e.g.
  `import { runSensor } from './pipeline/sensor.js'`. Keep this even though the
  source file is `.ts`.
- Target **Node 20+**. Prefer standard library and small, audited deps.

## Backend conventions

- **Pure, composable functions.** A pipeline stage takes explicit inputs and
  returns explicit outputs. `runSensor` is the only orchestrator; don't add
  hidden cross-stage state.
- **Types first.** Add/extend domain types in `src/core/types.ts`; let them flow.
- **Validate at the boundary.** New ingested fields go through Zod
  (`OrgSchema`/`SignalSchema`) — don't trust raw source data.
- **Stamp provenance + confidence** on every record you create.
- **Deterministic IDs.** Use `src/core/ids.ts`; never invent ad-hoc ids.
- **Degrade, don't crash.** Missing credentials should downgrade (sample data,
  mock embedder, dry-run), not throw. Secondary work (scoring, enrichment) is
  wrapped so it can't fail the primary ingest.
- **Logging.** Use the `[sensor]`/module-prefixed `console.log` style already in
  the code; log counts at each stage.

## Console conventions

- **No Firestore in screens.** All access goes through `console/src/data/` hooks.
- **React Query** for server state; **Context** only for auth.
- **Every screen handles loading / empty / error** via the `states/` primitives.
- **Mutations are optimistic + toasted** with rollback on error.
- **Tailwind v4 utilities**; prefer a `Badge`/`Button` variant over new one-off
  class strings. See [Design System](../console/design-system.md).
- **Accessibility:** `aria-label` on icon-only buttons, focus traps in modals,
  `aria-current` on nav.

## Formatting & linting

```bash
npm run lint              # backend: eslint src test
cd console && npm run lint
npm run typecheck         # strict tsc, both packages
```

Keep diffs minimal — don't reformat unrelated code. Match the surrounding style.

## Tests

- Co-locate intent: backend tests in `test/` mirror modules; console tests sit
  beside the code (`*.test.ts`).
- Tests must be **offline** — use sample data and the mock embedder; stub network
  and LLM calls.
- Assert determinism (exact ids/counts) where idempotency matters.

See [Backend → Testing](../backend/testing.md).

## Naming

- Domain vocabulary matches `types.ts`: *organization*, *signal*, *score*,
  *source*, *tier*. Use NL terms where the domain does (e.g. *doelstelling*,
  *RSIN*) — see the [Glossary](glossary.md).
- Source ids are kebab-case with a country suffix where relevant (`anbi-nl`).
