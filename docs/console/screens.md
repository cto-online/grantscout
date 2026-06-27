# Console Screens

Routing is defined in `console/src/App.tsx` with **route-level code splitting**
(each screen is its own chunk). All screens render inside `AppShell` (responsive
nav + mobile drawer). Unknown routes render `NotFound`.

## Routes → collections → actions

| Route | Screen | Reads | Writes / actions |
|---|---|---|---|
| `/` | `Overview` | aggregates of all collections + last 5 runs | — |
| `/runs` | `PipelineRuns` | `syncLogs` (live) | trigger a run |
| `/runs/:id` | `RunDetail` | one `syncLogs` doc | — |
| `/sources` | `Sources` | `sources` | enable/disable · edit · add |
| `/organizations` | `Organizations` | `organizations` (search/sort/paginate) | — |
| `/organizations/:id` | `OrganizationDetail` | org + its score + signals | — |
| `/grants` | `Grants` | grants/opportunities | — |
| `/review` | `ReviewQueue` | `reviewQueue` pending (live) | approve / reject |
| `/scoring` | `ScoringResults` | `accountScores` (joined to org names) | — |
| `/settings` | `Settings` | `settings/console` | save config |

## Screen notes

- **Overview** — counts (total runs, active sources, pending review, approved
  items) computed client-side, plus the real last-five runs (rows link to
  `/runs/:id`). Loading skeletons + empty/error states.
- **Pipeline Runs** — status filter + pagination; auto-refresh while any run is
  `running`; "View Details" → `/runs/:id`.
- **Run Detail** — full run metadata, counts, and any error. "Trigger run" writes
  a `queued` `syncLogs` doc the backend later picks up.
- **Sources** — toggle `enabled` (optimistic + toast); edit modal
  (name/provider/schedule); "Add source" modal creates a doc.
- **Organizations** — debounced search, filter, sort, pagination; row → detail.
- **Organization Detail** — the golden record with its score breakdown and
  contributing signals.
- **Review Queue** — approve/reject mutations write status + reviewer + timestamp,
  optimistic with rollback; empty state = "Queue clear".
- **Scoring Results** — tier filter, sort by composite, expandable
  Fit/Intent/Timing/Reachability breakdown with reasons.
- **Settings** — controlled form seeded from `settings/console`; **Save** mutation
  with validation (0–100, min ≤ max); "Clear All Cache" behind a `ConfirmDialog`.

## Shared UI

Screens compose primitives from `console/src/components/`: `Badge` (status/tier
pills via `cva`), `Modal`, `ConfirmDialog`, `Toast` (`useToast().show(...)`),
`ErrorBoundary`, and the `states/` set (`EmptyState`, `ErrorState`, `Skeleton`).
Every screen handles **loading / empty / error** explicitly.

## Naming note (product)

The backend's canonical entity is *organizations / prospects*. The console
surfaces both an **Organizations** screen (reads `organizations`) and a **Grants**
screen. Whether grant opportunities become a fully distinct product entity is
flagged for product in the [roadmap](../reference/roadmap.md).
