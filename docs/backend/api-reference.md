# Backend API Reference

A map of the exported functions per module. Signatures are abbreviated; the
authoritative source is the code. Anchors below are referenced from other docs.

## core/ids {#core-ids}

`src/core/ids.ts`

```ts
organizationId(country: string, normalizedNameOrId: string): string
signalId(orgId: string, type: string, occurredAt: string, sourceId: string): string
```

Deterministic, truncated SHA-256 IDs. Same inputs → same id (idempotent ingest).

## core/config

`src/core/config.ts` — exports `config`, a typed object built from `process.env`
with safe defaults. See [Configuration](../getting-started/configuration.md).

## core/firestore

`src/core/firestore.ts` — lazily inits the Admin SDK and exports `collections`
(typed refs: `sources`, `rawSnapshots`, `organizations`, `signals`,
`accountScores`, `reviewQueue`, `syncLogs`, `grants`). Tolerates missing creds.

## core/gcs

```ts
bucket                                            // configured GCS bucket
storeRawSnapshot(key: string, data: string|Buffer): Promise<void>
getRawSnapshot(key: string): Promise<Buffer>
```

## pipeline/sensor

```ts
runSensor(source: Source): Promise<{ orgs: number; signals: number }>
```

The orchestrator. See [Architecture → Pipeline](../architecture/pipeline.md).

## pipeline/providers

```ts
// http.ts
fetchHttp(url: string): Promise<Buffer>
storeSnapshot(sourceId: string, data: Buffer): Promise<string>   // returns snapshotId
// grantatlas.ts
fetchGrantAtlasAwardees(source?: Source): Promise<Buffer>        // sample fallback
```

## pipeline/extractors

```ts
// anbi.ts
extractAnbi(rawData: string|Buffer, snapshotId: string): { orgs, signals }
// grantatlas.ts
extractGrantAtlasAwardees(rawData, snapshotId): { orgs, signals }
// hiring.ts
extractHiringSignals(jobPostings, snapshotId): Promise<{ orgs, signals }>
// gemini.ts
extractWithGemini(content: string, context: Record<string,string>): Promise<…>
```

## pipeline/normalizer

```ts
OrgSchema, SignalSchema                            // Zod schemas
normalizeOrg(raw: unknown): { org, errors }
normalizeSignal(raw: unknown): { signal, errors }
```

## pipeline/resolver

```ts
resolveOrganizations(candidates: Organization[]): Promise<Map<string, Organization>>
deduplicateSignals(signals: Signal[]): Promise<Signal[]>
writeOrganizationsAndSignals(orgs, signals): Promise<{ orgsWritten, signalsWritten }>
```

## pipeline/enrich + enrichAnbi + missionScraper

```ts
// enrich.ts
nameKey(name: string): string
buildMissionIndex(orgs): …
enrichAgainstIndex(orgs, index): …
enrichMissions(orgs): Promise<{ orgs, enriched }>
// enrichAnbi.ts
enrichFromAnbiRegistry(orgs): Promise<{ orgs, enriched, matched }>
// missionScraper.ts
htmlToText(html: string): string
fetchPageText(url: string): Promise<string | undefined>
scrapeDoelstelling(...): …
```

See [Enrichment](enrichment.md).

## scoring {#scoring}

```ts
// accountScore.ts
computeAccountScore(org, signals, fit, reachability, modelVersion='v0'): AccountScore
// persist.ts
needsReview(org: Organization): boolean
reviewPriorityFor(confidence: number): 'high' | 'medium'
scoreAndPersist(orgs, signals): Promise<{ scored, queuedForReview }>
// icp.ts
ICP_SEED_MISSIONS: string[]
```

See [Architecture → Scoring](../architecture/scoring.md).

## sources

```ts
// registry.ts
SOURCES: Source[]
// anbiRegistry.ts
indexAnbiXml(xml: string): Map<string, AnbiEntry>
loadAnbiRegistry(): Promise<Map<string, AnbiEntry>>
lookupAnbi(name: string): Promise<AnbiEntry | undefined>
// grantatlas/grants.ts
projectGrant(raw: RawGrant): GrantOpportunity
// grantatlas/ingest.ts
ingestGrants(): Promise<{ grants: number }>
// grantatlas/client.ts
mintGrantAtlasIdToken(): Promise<string>
fetchGrants(): Promise<GrantOpportunity[]>
```

## orchestrator/hubspot

```ts
toHubSpotProspect(org: Organization, score: AccountScore): HubSpotProspect
rankProspects(prospects, topN): HubSpotProspect[]
syncProspectsToHubSpot(...): Promise<…>
upsertCompanies(payloads: HubSpotProspect[]): Promise<number>
```

See [HubSpot Sync](hubspot-sync.md).

## ai/gemini {#ai-gemini}

```ts
embedMission(mission: string): Promise<number[]>          // real or mock
cosineSimilarity(a: number[], b: number[]): number
computeICPCentroid(seedMissions: string[]): Promise<number[]>
computeFitScore(orgMission: string, icpCentroid: number[]): Promise<number>
extractDoelstelling(...): Promise<…>
extractStructured(content: string, context): Promise<Record<string, unknown>>
```

`embedMission` uses `gemini-embedding-001` (768-dim) when `GEMINI_API_KEY` is set,
and a deterministic keyword-based mock otherwise — so Fit is always computable
offline.
