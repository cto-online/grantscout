# Console Local Development

Because the console talks to Firestore directly and production is gated to the
`@grantmaster.nl` domain, local QA runs against the **Firebase Emulator Suite**
seeded with realistic data. No production access, no Google account needed.

## One-time setup

1. Install the Firebase CLI: `npm i -g firebase-tools`.
2. `cp console/.env.example console/.env` and set `VITE_USE_EMULATOR=true`. The
   `VITE_FIREBASE_*` values can be dummy strings under the emulator.

## Run it (three steps)

```bash
npm run emulators        # Auth (9099) + Firestore (8080) + Emulator UI (4000)
npm run emulators:seed   # seed the emulator with realistic data
npm run dev:console      # Vite dev server → http://localhost:5173
```

Open `http://localhost:5173`, click **Dev sign-in** (only shown when
`VITE_USE_EMULATOR=true`), and you land on Overview with live data. Inspect or
edit the data in the **Emulator UI** at `http://localhost:4000`.

## What the seed creates

`console/scripts/seed-emulator.ts` (run via `npm run emulators:seed`) inserts a
realistic dataset across every collection — sources, a spread of `syncLogs` runs
(mixed status), organizations, accountScores, reviewQueue items, and the
`settings/console` doc — plus an emulator auth user matching the Dev sign-in. This
makes every screen and action work end-to-end.

## Emulator config

`firebase.json` defines the ports:

```json
"emulators": {
  "auth":      { "port": 9099 },
  "firestore": { "port": 8080 },
  "ui":        { "enabled": true, "port": 4000 },
  "singleProjectMode": true
}
```

The console wires to these in `console/src/lib/firebase.ts` when
`VITE_USE_EMULATOR=true` (see [Data Layer](data-layer.md)).

## Why the emulator

- **No domain gate.** A `@gible.com` account can't read production; the emulator
  sidesteps that with the Dev sign-in.
- **Safe.** QA never touches production data.
- **Complete.** Seeded data exercises loading/empty/populated states and every
  write path (approve/reject, source edits, settings save, run trigger).

## Verification commands

```bash
cd console
npm run typecheck    # tsc -b
npm run build        # vite build (code-split)
npm test             # vitest (jsdom)
npm run lint         # eslint
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| Dev sign-in button missing | Set `VITE_USE_EMULATOR=true` in `console/.env`, restart Vite. |
| Screens empty | Run `npm run emulators:seed`; confirm Emulator UI shows data. |
| Port already in use | Stop a stale emulator, or change ports in `firebase.json`. |
| Styling broken | Tailwind v4 uses the Vite plugin — no `postcss.config` needed. |
| Auth errors against the emulator | The `VITE_FIREBASE_*` values are dummies under the emulator; that's expected. |

## Deploying the console

```bash
firebase deploy --only hosting   # static build → Firebase Hosting (site grantscout-88aa6)
```

CI/CD for automatic console deploys is on the [roadmap](../reference/roadmap.md).
