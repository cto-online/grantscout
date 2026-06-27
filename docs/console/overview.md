# Console Overview

The admin console (`console/`) is the GrantMaster team's window onto the
pipeline: live dashboards plus the few actions they need (approve/reject review
items, toggle/edit/add sources, trigger a run, save settings). It reads and
writes Firestore **directly** via the Firebase Web SDK — there is no API tier, so
the [security rules are the contract](../operations/security.md).

## Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Build | Vite 6 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (Vite plugin, no PostCSS) |
| Routing | React Router v6 |
| Server cache | TanStack React Query v5 |
| Backend SDK | Firebase v12 (Auth + Firestore + Emulator) |
| Icons | lucide-react |
| Dates | date-fns |
| Tests | Vitest + Testing Library (jsdom) |

## Architecture

```
Browser (team member)
│
├─ Firebase Auth ──► ID token (email_verified + allowed domain)
│
└─ Firestore Web SDK
     ├─ reads  ─► syncLogs · organizations · accountScores · signals
     │            sources · reviewQueue · settings · grants
     └─ writes ─► reviewQueue (approve/reject) · sources (toggle/edit/add)
                  settings (save) · syncLogs (queue a manual run)
```

- **Reads** use React Query hooks (one per collection, in `console/src/data/`).
- **Hot collections** (Pipeline Runs, Review Queue) use Firestore `onSnapshot`
  (or polling) for near-real-time updates.
- **Writes** are React Query mutations with optimistic updates + toasts.

## Source layout

```
console/src/
├─ main.tsx               entry
├─ App.tsx                providers (ErrorBoundary, ToastProvider, QueryClient) + router
├─ auth/                  AuthProvider, LoginPage (Google + emulator Dev sign-in)
├─ app/                   AppShell (responsive nav), NotFound
├─ screens/               one component per route (see Screens doc)
├─ data/                  typed hooks, converters, query-key factory
├─ components/            Badge, Modal, ConfirmDialog, Toast, ErrorBoundary,
│                         states/{Empty,Error,Skeleton}
└─ lib/                   firebase.ts (singleton), format.ts, cn.ts
```

## Authentication & access

Firebase Auth issues an ID token; a user is authorized when `email_verified` is
true and the email matches an allowed domain (`@grantmaster.nl` or `@gible.com`)
— the same predicate enforced by the Firestore rules. Locally, the
[emulator Dev sign-in](local-development.md) bypasses Google OAuth.

## Build & deploy

```bash
npm run dev:console     # Vite dev server (http://localhost:5173)
npm run build           # builds backend + console; console assets → console/dist
```

Deploy is a static build to **Firebase Hosting** (`firebase.json` → site
`grantscout-88aa6`, SPA rewrite to `index.html`):

```bash
firebase deploy --only hosting
```

## Related docs

- [Data Layer](data-layer.md) — hooks, converters, query keys.
- [Screens](screens.md) — routes mapped to collections + actions.
- [Local Development](local-development.md) — emulator workflow.
- [Design System](design-system.md) — colors, typography, components.
