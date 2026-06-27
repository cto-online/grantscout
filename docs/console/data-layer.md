# Console Data Layer

All Firestore access is centralized in `console/src/data/`. Screens never touch
Firestore directly — they call typed React Query hooks. This keeps query logic,
caching, and Firestore↔domain conversion in one place.

## Files

| File | Role |
|---|---|
| `types.ts` | Domain types (Run, Source, Org, ReviewItem, Score, Settings) |
| `converters.ts` | Firestore ↔ domain mapping + `tsToDate` timestamp handling |
| `keys.ts` | React Query key factory (`qk.runs.all`, `qk.runs.detail(id)`, …) |
| `useOverview.ts` | Aggregate counts for the Overview dashboard |
| `useRuns.ts` | List runs, run detail, trigger a run |
| `useSources.ts` | List, toggle `enabled`, edit, add |
| `useOrganizations.ts` | List/search/sort/paginate orgs; org detail |
| `useOpportunities.ts` | Grants/opportunities listing |
| `useScores.ts` | Scores joined to org names |
| `useReviewQueue.ts` | List, approve, reject |
| `useSettings.ts` | Read/write the `settings/console` doc |
| `useLive.ts` | `onSnapshot` helper for real-time collections |

## The Firebase singleton

`console/src/lib/firebase.ts` initializes the app, auth, and Firestore **once**,
and wires the emulator when `VITE_USE_EMULATOR === 'true'`:

```ts
export const app = getApps().length ? getApp() : initializeApp(config)
export const auth = getAuth(app)
export const db = getFirestore(app)

if (import.meta.env.VITE_USE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}
```

Everything (including `AuthProvider`) imports `auth`/`db` from here — never call
`initializeApp` elsewhere.

## Converters & timestamps

Firestore documents mix `Timestamp` objects and ISO strings (the pipeline writes
ISO strings for `timestamp`). `tsToDate(value)` normalizes
`Timestamp | string | number → Date` so screens get a real `Date`. It's
unit-tested for all input shapes plus null (`converters.test.ts`).

## Query keys

`keys.ts` exposes a factory so cache invalidation is consistent:

```ts
qk.runs.all
qk.runs.detail(id)
qk.sources.all
qk.reviewQueue.pending
// …
```

Mutations invalidate the relevant key (or update the cache optimistically) on success.

## Read vs. real-time

- **Reads** (organizations, scores, sources, settings): React Query with
  sensible `staleTime`; `refetchInterval` while a run is `running`.
- **Real-time** (Pipeline Runs, Review Queue): Firestore `onSnapshot` via
  `useLive.ts` so the screen reflects pipeline/other-user changes immediately.

## Writes (mutations)

Pattern for every action (approve/reject, toggle source, save settings, queue a
run):

1. React Query `useMutation` writes to Firestore.
2. **Optimistic update** of the cached list.
3. **Toast** on success; **rollback** + error toast on failure.

This is what turned the console's formerly "dead buttons" into working actions —
see the [console build-out history](../reference/project-status.md).

## Adding a new data hook

1. Add/extend a domain type in `types.ts` and converter in `converters.ts`.
2. Add a query-key in `keys.ts`.
3. Write `useThing.ts` wrapping the Firestore read/write behind React Query.
4. If it writes, confirm the [security rules](../operations/security.md) allow it
   for a verified team email, and add an optimistic update + toast.
5. Cover pure logic (converters/adapters) with a Vitest test.
