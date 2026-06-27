# Contributing

Thanks for working on GrantScout. This guide covers the workflow and
expectations; see [Code Style](code-style.md) for conventions and the
[Glossary](glossary.md) for domain terms.

## Before you start

- Node 20+ installed; `npm install` at the repo root.
- Read [Architecture → Overview](../architecture/overview.md) and
  [Backend → Overview](../backend/overview.md) to orient.
- For pipeline work, the mental model is a line of pure stages
  ([Pipeline](../architecture/pipeline.md)).

## Workflow

1. **Branch** off `main`: `git checkout -b <area>/<short-description>` (e.g.
   `sources/add-kvk`, `console/run-detail-fix`, `docs/scoring-clarity`).
2. **Make the change** with tests.
3. **Verify locally** (must pass — same as CI):
   ```bash
   npm run typecheck && npm test
   cd console && npm run typecheck && npm test   # if you touched the console
   ```
4. **Open a PR** to `cto-online/grantscout`. The `ci` workflow runs
   typecheck + tests on push.
5. **Keep PRs focused.** One concern per PR; update the doc that owns the topic.

## Definition of done

- [ ] Behavior covered by tests (backend Vitest and/or console RTL).
- [ ] `npm run typecheck` and `npm test` green (both packages if relevant).
- [ ] Lint clean (`npm run lint`).
- [ ] Docs updated — the page in `/docs` that owns the topic, not the root stubs.
- [ ] New env vars added to `.env.example` **and**
      [Configuration](../getting-started/configuration.md) +
      [Env Variables](../reference/environment-variables.md).
- [ ] Significant architectural decisions captured as an
      [ADR](../architecture/decisions/README.md).

## Common change recipes

| Task | Start here |
|---|---|
| Add a data source | [Adding a Source](../sources/adding-a-source.md) |
| Tune scoring / ICP | [Scoring](../architecture/scoring.md) → `accountScore.ts` / `icp.ts` |
| Add a console screen/action | [Console → Data Layer](../console/data-layer.md) |
| Change Firestore access | [Security](../operations/security.md) (rules!) |
| Add/modify CI | [CI/CD](../operations/ci-cd.md) |

## Security & compliance expectations

- Never commit secrets. `.env` files are git-ignored; use CI secrets for
  pipelines (see [Security](../operations/security.md)).
- Keep data **org-level**; new personal-data paths need explicit review
  ([GDPR](../compliance/gdpr.md)).
- Changing `firestore.rules` is changing the product's authorization layer —
  treat it as such and validate against the emulator.

## Docs are part of the change

This `/docs` tree is canonical. The repo-root markdown files are **thin stubs**
that point here — don't add content back into them. When you change behavior,
update the owning doc in the same PR.

## Commit messages

Short imperative subject; body explains *why* when it isn't obvious. Reference the
area, e.g. `scoring: lengthen timing half-life to 45 days`. Conventional-commit
prefixes (`feat:`, `fix:`, `docs:`, `chore:`) are welcome but not enforced.
