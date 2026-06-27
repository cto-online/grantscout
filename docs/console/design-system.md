# Console Design System

The console uses GrantAtlas's dark theme so the two products feel like one
family. Styling is **Tailwind CSS v4** utilities (via the Vite plugin) — there is
no separate component library; primitives are built in-house in
`console/src/components/`.

## Color tokens

| Role | Hex | Use |
|---|---|---|
| Canvas | `#050608` | Main background |
| Sidebar | `#08090e` | Navigation rail |
| Panel | `#0a0b11` | Card backgrounds |
| Card | `#0d0e15` | Nested containers |
| Text (primary) | `#f2f1f7` | Body text |
| Text (muted) | `#8a8a99` | Secondary text |
| Text (faint) | `#5b5b68` | Tertiary / disabled |
| Accent | `#9182f8` | Primary actions, links |
| Accent (hover) | `#a194fa` | Hover state |
| Success | `#4ade80` | Healthy / approved |
| Warning | `#fbbf24` | Attention |
| Danger | `#f87171` | Error / rejected |

## Typography

- **Font:** Inter, with a system-font fallback stack.
- **Spacing:** consistent 4px base unit (Tailwind's default scale).

## Component primitives

`console/src/components/`:

| Component | Purpose |
|---|---|
| `Badge` | Status/tier pills — `success`/`warning`/`danger`/`neutral` variants via `class-variance-authority` (`cva`). Centralizes pill styling that used to be duplicated across screens. |
| `Button`, `Input`, `Card` | Base form/layout primitives |
| `Modal`, `ConfirmDialog` | Overlays (edit source, confirm destructive actions) |
| `Toast` (+ `ToastProvider`, `useToast`) | Stacked, auto-dismiss, dark-themed notifications |
| `ErrorBoundary` | Renders `ErrorState` on a crash |
| `states/EmptyState`, `states/ErrorState`, `states/Skeleton` | The loading/empty/error triad every screen uses |

## Conventions

- **Every screen handles loading / empty / error** — use the `states/` set rather
  than ad-hoc spinners.
- **Tier and status always render via `Badge`** for visual consistency.
- **Icon-only buttons need `aria-label`s**; modals trap focus; nav uses
  `aria-current`. Accessibility is part of "done" (see the build-out history in
  [project status](../reference/project-status.md)).
- **Mutations show a toast** on success/failure, never a silent change.

## Responsive shell

`AppShell` shows a fixed sidebar on `md+` and a slide-over drawer with a mobile
top bar (hamburger, close-on-navigate) below `md`. Verify layouts at 375px and
1440px when touching navigation.

## Extending the theme

Add color tokens and font config in `console/src/index.css` (Tailwind v4 reads
its config inline/CSS-first). Prefer adding a `Badge`/`Button` variant over
introducing new one-off class strings, so styling stays centralized.
