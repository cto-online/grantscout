# CLI & npm Scripts

How to run everything. The backend entry point is `src/index.ts` (`--source
<id>`); the rest are npm scripts in the root `package.json` (and a few in
`console/package.json`).

## The pipeline CLI

```bash
npm run pipeline:once -- --source <id>     # run one source through the sensor
# or directly:
npx tsx src/index.ts --source=<id>
```

Valid ids: `anbi-nl`, `grantatlas-awardees`, `hiring-nl` (disabled), and the
special `grantatlas-grants` (opportunities catalog ingest). Run with no `--source`
to print usage and the available sources from the registry.

## Root npm scripts

| Script | Does |
|---|---|
| `npm run build` | `tsc -p tsconfig.json` (compile backend → `dist/`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (run once) |
| `npm run test:watch` | Vitest watch mode |
| `npm run lint` | ESLint over `src` + `test` |
| `npm run pipeline:once` | Run a sensor via `tsx` (pass `-- --source <id>`) |
| `npm run start` | `node dist/index.js` (compiled entry) |
| `npm run dev` | `tsx watch src/index.ts` |
| `npm run dev:console` | Start the console Vite dev server |
| `npm run emulators` | Firebase Auth + Firestore emulators |
| `npm run emulators:seed` | Seed the emulator with demo data |
| `npm run docker:build` | Build the Cloud Run image (`grantscout:latest`) |
| `npm run docker:test` | Run the image against `--source anbi-nl` |

## Offline runner scripts

Not npm scripts — invoke with `tsx`:

| Command | Does |
|---|---|
| `npx tsx scripts/test-anbi.ts` | ANBI extract→normalize→resolve→score on sample data, printed |
| `npx tsx scripts/test-pipeline.ts` | Full pipeline on sample data (no cloud) |
| `npx tsx scripts/rescore.ts` | Re-score all orgs after tuning weights/ICP |

## Console npm scripts (`console/`)

| Script | Does |
|---|---|
| `npm run dev` | Vite dev server (`http://localhost:5173`) |
| `npm run build` | `tsc -b && vite build` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm test` / `npm run test:watch` | Vitest (jsdom) |

## Docker

```bash
docker build -t grantscout:latest .
docker run grantscout:latest --source anbi-nl
docker run -e GCP_PROJECT_ID=grantscout-dev grantscout:latest --source grantatlas-awardees
```

## Typical loops

```bash
# backend feature
npm run dev               # watch-run the pipeline
npm run test:watch

# console feature
npm run emulators & npm run emulators:seed && npm run dev:console

# pre-PR gate
npm run typecheck && npm test && npm run lint
```
