# GrantScout Console Build-Out — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline) or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the GrantScout admin console from a static mock (hard-coded data, dead buttons) into a fully-working, full-fledged product wired to real Firestore data with working interactions, proper UI states, and a local-dev/QA path.

**Architecture:** The console reads/writes Firestore directly via the Firebase Web SDK (auth already exists; no new backend API). A typed data-access layer (`console/src/data/`) wraps Firestore collections behind React Query hooks. Local development runs against the **Firebase Emulator Suite** seeded with realistic data, so every screen and interaction works end-to-end without the production `@grantmaster.nl` domain gate. Production uses the live project with tightened security rules.

**Tech Stack:** React 19, TypeScript, Vite 6, Tailwind v4, React Router v6, TanStack React Query v5, Firebase v12 (Auth + Firestore + Emulator), date-fns, lucide-react, Vitest + Testing Library.

---

## Status — 2026-06-23

**Phases 0, 1, 2, 3 complete and verified live against the seeded Firebase emulator.**
The console is wired end-to-end: every screen reads real Firestore data, every interaction
(approve/reject, source toggle/edit/add, run trigger, settings save) persists. Verified:
`tsc` ✓ · `vite build` ✓ (code-split) · `vitest` 14/14 ✓ · `eslint` 0 errors.

Run locally: `npm run emulators` → `npm run emulators:seed` → `npm run dev:console`, then *Dev sign-in*.

Deferred (optional, low-value/high-risk for a single-operator tool): real-time `onSnapshot`
(runs already poll; review updates optimistically), grant/score deep-link routes (covered by
modals/expanders), broader screen-level RTL tests. Also flagged for product: the "Extracted
Grants" screen reads `organizations` — confirm whether grants should be a distinct entity.

---

## Data Model — Console screen → Firestore collection

The backend pipeline already defines and writes these collections (`src/core/firestore.ts`). The console maps onto them:

| Console screen | Collection | Owner (writes) | Notes |
|---|---|---|---|
| Overview | aggregate of all | — | Counts/rollups computed client-side from the collections below |
| Pipeline Runs | `syncLogs` | backend (`sensor.ts`, `hubspot.ts`) | One doc per run: source, status, counts, timestamps |
| Sources | `sources` | console (toggle/edit) + backend | Provider config + enabled flag + last run/health |
| Extracted Grants | `organizations` | backend (`resolver.ts`) | The extracted/prospect orgs (see naming note) |
| Review Queue | `reviewQueue` | console (approve/reject) | Already team read/write in rules |
| Scoring Results | `accountScores` | backend (scoring) | Fit/Intent/Timing/Reachability + composite, joined to org name |
| Settings | `settings` (doc `console`) | console | New console-owned config doc |

**Naming note (needs product confirmation):** the backend domain is *organizations / prospects*, but the console labels the screen "Extracted Grants" with grant-shaped fields (amount, deadline, provider). For this build the screen reads `organizations` and surfaces org + top-signal + score data. If "grants" should be a distinct entity, that is a backend change tracked separately — flagged, not blocking.

---

## Decisions & Assumptions

1. **Data access = Firestore-direct** (Firebase Web SDK), not a new REST API. Least new infrastructure; auth + rules already exist.
2. **Local dev = Firebase Emulator Suite** (Firestore + Auth) seeded by `console/scripts/seed-emulator.ts`. Solves the `@grantmaster.nl` gate (your `@gible.com` account can't read prod) and gives a real QA path. Toggled by `VITE_USE_EMULATOR=true` in `console/.env`.
3. **Security rules** get minimal, well-scoped additions: authenticated team writes to `sources` (enabled flag) and a new `settings` collection. Service-account ingest paths unchanged. All rule changes called out in Task 0.4.
4. **Testing posture:** strict Vitest unit tests for pure logic (data adapters, formatters, score/tier helpers, aggregation). UI screens verified by build + typecheck + Playwright walkthrough against the seeded emulator. (Adaptation of TDD default to a UI-heavy build, per user's "fully working console" priority.)
5. **Commits:** held until the user gives the go-ahead (per environment guardrail). Verification is via `npm run build` / typecheck / Playwright in the meantime.

---

## File Structure

```
console/src/
  lib/
    firebase.ts          # NEW: single firebase init (app, auth, db) + emulator wiring
  data/
    types.ts             # NEW: domain types (Run, Source, Org, ReviewItem, Score, Settings)
    converters.ts        # NEW: Firestore <-> domain converters + Timestamp handling
    keys.ts              # NEW: React Query key factory
    useRuns.ts           # NEW: list runs, run detail, trigger-run
    useSources.ts        # NEW: list, toggle enabled, edit
    useGrants.ts         # NEW: list orgs (+ filter/sort/paginate)
    useReviewQueue.ts    # NEW: list, approve, reject
    useScores.ts         # NEW: list scores joined to org name
    useSettings.ts       # NEW: read/write settings doc
  components/
    states/EmptyState.tsx    # NEW
    states/ErrorState.tsx    # NEW
    states/Skeleton.tsx      # NEW
    feedback/Toast.tsx       # NEW: toast provider + useToast
    ErrorBoundary.tsx        # NEW
    ConfirmDialog.tsx        # NEW
    Modal.tsx                # NEW
    Badge.tsx                # NEW: status/tier pills (extract repeated styling)
  app/
    AppShell.tsx         # MODIFY: responsive drawer + mobile top bar
    NotFound.tsx         # NEW: 404 catch-all
  screens/*.tsx          # MODIFY: each wired to its hook + states
  App.tsx                # MODIFY: ToastProvider, ErrorBoundary, 404 route, router future flags
console/scripts/
  seed-emulator.ts       # NEW: realistic data for every collection
firebase.json            # MODIFY: emulators block
firestore.rules          # MODIFY: scoped team writes for sources + settings
```

---

## Phase 0 — Foundations (unblocks every screen)

### Task 0.1: Firebase singleton + Firestore + emulator wiring

**Files:** Create `console/src/lib/firebase.ts`; Modify `console/src/auth/AuthProvider.tsx` to import from it.

- [ ] Create `firebase.ts` exporting `app`, `auth`, `db`, initialised once. When `import.meta.env.VITE_USE_EMULATOR === 'true'`, call `connectAuthEmulator(auth, 'http://127.0.0.1:9099')` and `connectFirestoreEmulator(db, '127.0.0.1', 8080)`.
- [ ] Refactor `AuthProvider` to use `auth`/`app` from `firebase.ts` (remove its inline `initializeApp`).
- [ ] Verify: `npm run build` passes; app still boots to login.

```ts
// console/src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
}
export const app = getApps().length ? getApp() : initializeApp(config)
export const auth = getAuth(app)
export const db = getFirestore(app)

if (import.meta.env.VITE_USE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}
```

### Task 0.2: Domain types + converters + query-key factory

**Files:** Create `console/src/data/types.ts`, `converters.ts`, `keys.ts`. Test: `console/src/data/converters.test.ts`.

- [ ] Define domain types matching backend docs (Run from `syncLogs`, Source, Org, ReviewItem, Score, Settings).
- [ ] Write `tsToDate(value)` converting Firestore `Timestamp | string | number` → `Date`; unit-test all three input shapes + null.
- [ ] Query-key factory: `qk.runs.all`, `qk.runs.detail(id)`, `qk.sources.all`, etc.

### Task 0.3: Shared UI states + feedback primitives

**Files:** Create `EmptyState.tsx`, `ErrorState.tsx`, `Skeleton.tsx`, `Toast.tsx` (+ `ToastProvider`/`useToast`), `ErrorBoundary.tsx`, `Modal.tsx`, `ConfirmDialog.tsx`, `Badge.tsx`.

- [ ] `Badge` centralises the status/tier pill styling currently duplicated across 4 screens (success/warning/danger/neutral variants via `cva`).
- [ ] `Toast` provider with `useToast().show({ type, message })`, auto-dismiss, stacked, dark-theme styled.
- [ ] `ErrorBoundary` class component rendering `ErrorState` on crash.
- [ ] Verify: render each in a scratch route or unit smoke test.

### Task 0.4: Security rules — scoped team writes

**Files:** Modify `firestore.rules`.

- [ ] Allow team write to `sources` (so enable/disable persists): replace `allow write: if false;` with team-email write guard, but only the `enabled`/config fields (document-level write guarded by verified team email).
- [ ] Add `settings` collection: team read/write for verified team email.
- [ ] Keep all service-account ingest paths unchanged.
- [ ] Verify with `firebase emulators:exec` rules tests later; for now `firebase deploy --only firestore:rules --dry-run` style check is N/A — validate via emulator.

### Task 0.5: Emulator config + seed script

**Files:** Modify `firebase.json` (add `emulators`); Create `console/scripts/seed-emulator.ts`; add `console/package.json` scripts `emulators` and `seed`.

- [ ] `firebase.json` emulators: `auth` (9099), `firestore` (8080), `ui` (4000).
- [ ] Seed script (uses `firebase-admin` against emulator via `FIRESTORE_EMULATOR_HOST`): insert ~8 `sources`, ~24 `syncLogs` runs (mixed status), ~30 `organizations`, ~30 `accountScores`, ~12 `reviewQueue` items, 1 `settings/console` doc. Plus seed an emulator auth user matching the dev login.
- [ ] Scripts: `"emulators": "firebase emulators:start --import=./.emulator-data --export-on-exit"`, `"seed": "tsx scripts/seed-emulator.ts"`.
- [ ] Verify: `npm run emulators` + `npm run seed`; Emulator UI at :4000 shows the data.

### Task 0.6: Local dev auth path

**Files:** Modify `console/src/auth/LoginPage.tsx`; `console/.env`.

- [ ] When `VITE_USE_EMULATOR`, show a "Dev sign-in" button that creates/signs-in a test user against the Auth emulator (bypasses Google popup, which the emulator can't do).
- [ ] Document `VITE_USE_EMULATOR=true` in `.env.local.example`.
- [ ] Verify: with emulator running, Dev sign-in lands on Overview.

### Task 0.7: App-level wiring — providers, 404, router flags

**Files:** Modify `console/src/App.tsx`; Create `console/src/app/NotFound.tsx`.

- [ ] Wrap routes in `ErrorBoundary` + `ToastProvider`.
- [ ] Add `<Route path="*" element={<NotFound />} />`.
- [ ] Add React Router future flags (`v7_startTransition`, `v7_relativeSplatPath`) to silence warnings.
- [ ] Verify: unknown URL renders NotFound; console has 0 warnings.

### Task 0.8: Responsive app shell

**Files:** Modify `console/src/app/AppShell.tsx`.

- [ ] Sidebar becomes a slide-over drawer under `md`; add a mobile top bar with hamburger + close-on-navigate.
- [ ] Add `aria-label`s and `aria-current` to nav.
- [ ] Verify: Playwright at 375px and 1440px — nav usable at both.

---

## Phase 1 — Read screens wired to real data

### Task 1.1: Overview → live aggregates
**Files:** `data/useOverview.ts` (NEW), `screens/Overview.tsx` (MODIFY).
- [ ] Hook computes counts: total runs, active sources, pending review, approved grants (from collections).
- [ ] Replace hard-coded stats + the duplicate `[1,2,3]` recent-runs block with real last-5 runs.
- [ ] Loading skeletons, empty + error states. Recent-run rows link to run detail.

### Task 1.2: Pipeline Runs → `syncLogs`
**Files:** `data/useRuns.ts`, `screens/PipelineRuns.tsx`.
- [ ] List with status filter + pagination; loading/empty/error.
- [ ] Auto-refresh (React Query `refetchInterval`) while any run is `running`.
- [ ] "View Details" now navigates to `/runs/:id`.

### Task 1.3: Extracted Grants → `organizations`
**Files:** `data/useGrants.ts`, `screens/ExtractedGrants.tsx`.
- [ ] Search (debounced) + status filter + sort + pagination.
- [ ] Row → `/grants/:id` detail drawer. Loading/empty/error.

### Task 1.4: Scoring Results → `accountScores`
**Files:** `data/useScores.ts`, `screens/ScoringResults.tsx`.
- [ ] Read scores joined to org name; tier filter; sort by composite.
- [ ] Expand row → component breakdown (Fit/Intent/Timing/Reachability). Loading/empty/error.

---

## Phase 2 — Interactive workflows (the dead buttons)

### Task 2.1: Review Queue approve/reject (highest value — vertical slice)
**Files:** `data/useReviewQueue.ts`, `screens/ReviewQueue.tsx`.
- [ ] `approve(id)`/`reject(id)` mutations write to `reviewQueue` (status + reviewer + timestamp), optimistic update, toast, rollback on error.
- [ ] Icon buttons get `aria-label`. Empty state = "Queue clear 🎉". Loading/error states.
- [ ] Verify end-to-end against emulator (proves the whole Phase-0 data layer).

### Task 2.2: Pipeline Run detail + trigger
**Files:** `screens/RunDetail.tsx` (NEW), route `/runs/:id`, `useRuns.ts` (+ `triggerRun`).
- [ ] Detail page: full run metadata, records processed/imported, logs/errors.
- [ ] "Trigger run" writes a `queued` `syncLogs` doc (backend picks up later) + toast.

### Task 2.3: Sources edit + enable/disable + add
**Files:** `screens/Sources.tsx`, `useSources.ts`, `Modal.tsx`.
- [ ] Toggle `enabled` persists (mutation + optimistic + toast).
- [ ] Edit modal (name/provider/schedule) persists. "Add source" modal creates a doc.

### Task 2.4: Settings → controlled form + save
**Files:** `screens/Settings.tsx`, `useSettings.ts`.
- [ ] Convert all inputs to controlled state seeded from `settings/console`.
- [ ] Add **Save** button → write mutation + success/error toast. Number-field validation (0–100, min ≤ relevant max).
- [ ] "Clear All Cache" → `ConfirmDialog` then action + toast.

---

## Phase 3 — Polish & cross-cutting

### Task 3.1: Grant detail drawer (`/grants/:id`) — org + signals + score.
### Task 3.2: Score "why" drill-down wired from Scoring + Grants.
### Task 3.3: Real-time — switch hot collections (runs, reviewQueue) to Firestore `onSnapshot` or React Query polling.
### Task 3.4: Accessibility sweep — aria-labels on all icon-only buttons, focus traps in modals, keyboard nav.
### Task 3.5: Design-QA pass — spacing/hierarchy, remove any remaining duplicate-looking rows, consistent Badge usage, loading/empty polish.
### Task 3.6: Vitest coverage for adapters/hooks logic; Playwright smoke walkthrough of all routes against seeded emulator.

---

## Self-Review (spec coverage)

- Every menu item from the audit (Overview, Runs, Sources, Grants, Review, Scoring, Settings) has wiring + interaction tasks. ✓
- Every dead button identified in the audit (View Details, Edit, Enable/Disable, Approve/Reject, Save/Clear Cache) has an owning task in Phase 2. ✓
- Cross-cutting gaps (responsive nav, 404, toasts, error boundary, loading/empty/error, local-dev auth, real-time, router warnings, a11y) covered in Phase 0/3. ✓
- Root cause (no data layer) fixed first in Phase 0. ✓

## Execution order

Phase 0 in full → **Task 2.1 (Review Queue) as the first vertical slice** to validate the data layer end-to-end → remaining Phase 1 read screens → rest of Phase 2 → Phase 3 polish.
