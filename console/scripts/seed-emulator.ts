/**
 * Seed the Firebase Emulator Suite with realistic data so the admin console
 * works end-to-end in local development.
 *
 * Usage (from repo root, with emulators running):
 *   npx tsx console/scripts/seed-emulator.ts
 *
 * Resolves `firebase-admin` from the root workspace node_modules.
 */
import admin from 'firebase-admin'

const PROJECT_ID = 'grantscout-88aa6'

// Point the Admin SDK at the local emulators.
process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= '127.0.0.1:9099'

admin.initializeApp({ projectId: PROJECT_ID })
const db = admin.firestore()
db.settings({ ignoreUndefinedProperties: true })
const auth = admin.auth()
const Ts = admin.firestore.Timestamp

const DEV_EMAIL = 'dev@grantmaster.nl'
const DEV_PASSWORD = 'devpass123'

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000)
const hoursAgo = (n: number) => new Date(Date.now() - n * 3_600_000)
const pick = <T>(arr: T[], i: number) => arr[i % arr.length]

async function seedDevUser() {
  try {
    await auth.getUserByEmail(DEV_EMAIL)
    console.log(`[seed] dev user already exists: ${DEV_EMAIL}`)
  } catch {
    const user = await auth.createUser({
      email: DEV_EMAIL,
      emailVerified: true,
      password: DEV_PASSWORD,
      displayName: 'Dev User',
    })
    console.log(`[seed] created dev user ${DEV_EMAIL} (uid ${user.uid})`)
  }
}

async function seedSources() {
  const sources = [
    { id: 'anbi-nl', name: 'ANBI NL Registry', provider: 'http', acquisitionTier: 'feed', extractionMethod: 'deterministic', signalTypes: ['registry_listed'], schedule: '0 3 * * 1', enabled: true, lastRunStatus: 'success', lastRunAt: hoursAgo(2) },
    { id: 'grantatlas', name: 'GrantAtlas Awardees', provider: 'grantatlas', acquisitionTier: 'api', extractionMethod: 'deterministic', signalTypes: ['grant_awarded', 'grant_applied'], schedule: '0 4 * * *', enabled: true, lastRunStatus: 'success', lastRunAt: hoursAgo(6) },
    { id: 'job-postings', name: 'Job Postings (Firecrawl)', provider: 'firecrawl', acquisitionTier: 'scrape', extractionMethod: 'llm', signalTypes: ['hiring_grants_role'], schedule: '0 5 * * *', enabled: true, lastRunStatus: 'error', lastRunAt: hoursAgo(7) },
    { id: 'kansspelfonds', name: 'Kansspelfonds', provider: 'http', acquisitionTier: 'feed', extractionMethod: 'deterministic', signalTypes: ['grant_awarded'], schedule: '0 6 * * 2', enabled: true, lastRunStatus: 'success', lastRunAt: daysAgo(1) },
    { id: 'vsbfonds', name: 'VSBfonds', provider: 'http', acquisitionTier: 'feed', extractionMethod: 'deterministic', signalTypes: ['grant_awarded'], schedule: '0 6 * * 3', enabled: false, lastRunStatus: 'success', lastRunAt: daysAgo(5) },
    { id: 'oranje-fonds', name: 'Oranje Fonds', provider: 'http', acquisitionTier: 'feed', extractionMethod: 'deterministic', signalTypes: ['grant_awarded', 'deadline_upcoming'], schedule: '0 7 * * 4', enabled: true, lastRunStatus: 'success', lastRunAt: daysAgo(2) },
    { id: 'eu-funding', name: 'EU Funding Portal', provider: 'apify', acquisitionTier: 'scrape', extractionMethod: 'llm', signalTypes: ['deadline_upcoming'], schedule: '0 8 * * 5', enabled: false, lastRunStatus: undefined, lastRunAt: undefined },
    { id: 'gemeente-subsidies', name: 'Gemeente Subsidies', provider: 'firecrawl', acquisitionTier: 'scrape', extractionMethod: 'llm', signalTypes: ['grant_awarded'], schedule: '0 9 * * 1', enabled: true, lastRunStatus: 'success', lastRunAt: daysAgo(3) },
  ]
  const batch = db.batch()
  for (const s of sources) {
    const { id, lastRunAt, ...rest } = s
    batch.set(db.collection('sources').doc(id), {
      ...rest,
      country: 'NL',
      ...(lastRunAt ? { lastRunAt: Ts.fromDate(lastRunAt) } : {}),
    })
  }
  await batch.commit()
  console.log(`[seed] ${sources.length} sources`)
  return sources
}

async function seedRuns(sourceIds: string[]) {
  const statuses = ['success', 'success', 'success', 'error', 'dry-run', 'running'] as const
  const batch = db.batch()
  const N = 24
  for (let i = 0; i < N; i++) {
    const status = pick([...statuses], i)
    const sourceId = pick(sourceIds, i)
    const orgs = status === 'error' ? 0 : 200 + ((i * 137) % 1800)
    batch.set(db.collection('syncLogs').doc(`run-${String(i).padStart(3, '0')}`), {
      sourceId,
      // backend writes ISO strings for timestamp
      timestamp: hoursAgo(i * 5).toISOString(),
      orgsIngested: orgs,
      signalsIngested: status === 'error' ? 0 : Math.round(orgs * 1.6),
      status,
      ...(status === 'error' ? { error: 'HTTP 503 from upstream after 3 retries' } : {}),
      ...(i % 8 === 0 ? { snapshotId: `snap-${i}` } : {}),
    })
  }
  // one hubspot service run
  batch.set(db.collection('syncLogs').doc('run-hubspot'), {
    service: 'hubspot',
    timestamp: hoursAgo(3).toISOString(),
    prospectsCount: 100,
    status: 'dry-run',
  })
  await batch.commit()
  console.log(`[seed] ${N + 1} pipeline runs`)
}

const ORG_NAMES = [
  'Stichting Leergeld', 'Voedselbank Nederland', 'Natuurmonumenten', 'Oxfam Novib',
  'War Child Nederland', 'Het Vergeten Kind', 'Stichting AAP', 'KWF Kankerbestrijding',
  'Cordaid', 'Stichting Doen', 'Jeugdfonds Sport & Cultuur', 'Liliane Fonds',
  'Terre des Hommes', 'Stichting Lezen & Schrijven', 'Vluchtelingenwerk Nederland',
  'Dierenbescherming', 'Amnesty International NL', 'Greenpeace Nederland', 'Edukans',
  'Stichting Vrienden van', 'Ronald McDonald Kinderfonds', 'Hartstichting',
  'Longfonds', 'Diabetes Fonds', 'Stichting Kinderpostzegels', 'Wakker Dier',
  'Milieudefensie', 'Stichting Opkikker', 'Fonds Gehandicaptensport', 'ALS Nederland',
]
const ORG_TYPES = ['ngo', 'foundation', 'charity', 'association', 'social_enterprise'] as const
const THEMES = [
  ['poverty', 'children'], ['food security'], ['nature', 'climate'], ['development'],
  ['children', 'conflict'], ['health'], ['animals'], ['education'], ['human rights'],
]

async function seedOrganizations() {
  const batch = db.batch()
  for (let i = 0; i < ORG_NAMES.length; i++) {
    const id = `org-${String(i).padStart(3, '0')}`
    batch.set(db.collection('organizations').doc(id), {
      canonicalId: id,
      names: [ORG_NAMES[i]],
      type: pick([...ORG_TYPES], i),
      country: 'NL',
      identifiers: { rsin: `8${(1000000 + i * 7919).toString().slice(0, 8)}`, anbi: i % 3 !== 0 },
      mission: `${ORG_NAMES[i]} works on ${pick(THEMES, i).join(' and ')} across the Netherlands.`,
      themes: pick(THEMES, i),
      sizeBand: pick(['micro', 'small', 'medium', 'large'], i),
      createdAt: Ts.fromDate(daysAgo(60 - i)),
      updatedAt: Ts.fromDate(daysAgo(i % 14)),
      confidence: { overall: 0.7 + (i % 3) * 0.1 },
    })
  }
  await batch.commit()
  console.log(`[seed] ${ORG_NAMES.length} organizations`)
}

const SIGNAL_TYPES = [
  'grant_awarded',
  'grant_applied',
  'registry_listed',
  'hiring_grants_role',
  'deadline_upcoming',
]

async function seedSignals() {
  const batch = db.batch()
  let count = 0
  for (let i = 0; i < ORG_NAMES.length; i++) {
    const orgId = `org-${String(i).padStart(3, '0')}`
    const n = 1 + (i % 3) // 1–3 signals per org
    for (let j = 0; j < n; j++) {
      const id = `sig-${String(i).padStart(3, '0')}-${j}`
      batch.set(db.collection('signals').doc(id), {
        id,
        orgId,
        type: pick(SIGNAL_TYPES, i + j),
        strength: +(0.4 + ((i + j) % 6) / 10).toFixed(2),
        occurredAt: daysAgo((i + j * 7) % 90).toISOString(),
        detectedAt: daysAgo((i + j * 7) % 90).toISOString(),
        provenance: { sourceId: pick(['anbi-nl', 'grantatlas', 'job-postings'], i + j) },
        confidence: { overall: 0.8 },
      })
      count++
    }
  }
  await batch.commit()
  console.log(`[seed] ${count} signals`)
}

type Tier = 'hot' | 'warm' | 'cold_fit' | 'low'

async function seedScores() {
  const batch = db.batch()
  for (let i = 0; i < ORG_NAMES.length; i++) {
    const orgId = `org-${String(i).padStart(3, '0')}`
    const fit = +(0.55 + ((i * 13) % 40) / 100).toFixed(2)
    const intent = +(0.4 + ((i * 29) % 55) / 100).toFixed(2)
    const timing = +(0.3 + ((i * 17) % 65) / 100).toFixed(2)
    const reachability = 0.8
    const score = Math.round((0.4 * fit + 0.3 * intent + 0.2 * timing + 0.1 * reachability) * 100)
    const tier: Tier =
      score >= 70 ? 'hot' : score >= 55 ? 'warm' : fit >= 0.6 ? 'cold_fit' : 'low'
    batch.set(db.collection('accountScores').doc(orgId), {
      orgId,
      fit, intent, timing, reachability, score, tier,
      reasons: [
        { factor: 'fit', detail: `Mission aligns with ICP (${Math.round(fit * 100)}%)`, weight: 0.4 },
        { factor: 'intent', detail: intent > 0.7 ? 'Recently won a grant' : 'Some grant activity', weight: 0.3 },
        { factor: 'timing', detail: `Last signal ${i % 30} days ago`, weight: 0.2 },
      ],
      contributingSignals: [`sig-${i}-a`, `sig-${i}-b`],
      computedAt: Ts.fromDate(hoursAgo(i)),
      modelVersion: 'keyword-v1',
    })
  }
  await batch.commit()
  console.log(`[seed] ${ORG_NAMES.length} account scores`)
}

async function seedReviewQueue() {
  const priorities = ['high', 'medium', 'low'] as const
  const reasons = [
    'Low extraction confidence — verify mission text',
    'Possible duplicate of another organization',
    'Conflicting RSIN across sources',
    'Hiring signal needs human confirmation',
    'Grant amount could not be parsed',
  ]
  const batch = db.batch()
  const N = 12
  for (let i = 0; i < N; i++) {
    const id = `review-${String(i).padStart(3, '0')}`
    batch.set(db.collection('reviewQueue').doc(id), {
      orgId: `org-${String(i).padStart(3, '0')}`,
      title: ORG_NAMES[i % ORG_NAMES.length],
      priority: pick([...priorities], i),
      reason: pick(reasons, i),
      submittedBy: 'pipeline',
      status: 'pending',
      createdAt: Ts.fromDate(hoursAgo(i * 3)),
    })
  }
  await batch.commit()
  console.log(`[seed] ${N} review queue items`)
}

async function seedGrants() {
  const grants = [
    { id: 'ga-energy-ut', title: 'Subsidie duurzame energie', funderName: 'Provincie Utrecht', grantType: 'subsidy', fundingMin: 5000, fundingMax: 50000, currency: 'EUR', dateClose: Ts.fromDate(daysAgo(-90)), status: 'active', ngoEligible: true, sectors: ['energy', 'environment'], geographicScope: ['NL-UT'], sourceUrl: 'https://zoek.officielebekendmakingen.nl/' },
    { id: 'ga-youth-oranje', title: 'Jeugd & Ontwikkeling fonds', funderName: 'Oranje Fonds', grantType: 'grant', fundingMin: 10000, fundingMax: 100000, currency: 'EUR', dateClose: Ts.fromDate(daysAgo(-21)), status: 'active', ngoEligible: true, sectors: ['youth', 'education'], geographicScope: ['NL'], sourceUrl: 'https://www.oranjefonds.nl/' },
    { id: 'ga-culture-pbcf', title: 'Cultuurparticipatie subsidie', funderName: 'Prins Bernhard Cultuurfonds', grantType: 'grant', fundingMin: 2500, fundingMax: 25000, currency: 'EUR', dateClose: Ts.fromDate(daysAgo(-160)), status: 'upcoming', ngoEligible: true, sectors: ['culture'], geographicScope: ['NL'], sourceUrl: 'https://www.cultuurfonds.nl/' },
    { id: 'ga-climate-postcode', title: 'Klimaat & Natuur programma', funderName: 'Nationale Postcode Loterij', grantType: 'grant', fundingMin: 100000, fundingMax: 1000000, currency: 'EUR', dateClose: Ts.fromDate(daysAgo(116)), status: 'closed', ngoEligible: true, sectors: ['environment', 'nature'], geographicScope: ['NL', 'EU'], sourceUrl: 'https://www.postcodeloterij.nl/' },
    { id: 'ga-health-zonmw', title: 'Gezondheidsonderzoek subsidie', funderName: 'ZonMw', grantType: 'subsidy', fundingMin: 50000, fundingMax: 500000, currency: 'EUR', rolling: true, status: 'active', ngoEligible: true, sectors: ['health'], geographicScope: ['NL'], sourceUrl: 'https://www.zonmw.nl/' },
  ]
  const batch = db.batch()
  for (const g of grants) {
    const { id, ...rest } = g
    batch.set(db.collection('grants').doc(id), { ...rest, ingestedAt: Ts.now() })
  }
  await batch.commit()
  console.log(`[seed] ${grants.length} grant opportunities`)
}

async function seedSettings() {
  await db.collection('settings').doc('console').set({
    autoRunEnabled: true,
    emailOnFailure: true,
    debugLogging: false,
    minRelevanceScore: 70,
    minFitScore: 75,
    updatedAt: Ts.now(),
    updatedBy: 'seed',
  })
  console.log('[seed] settings/console')
}

async function main() {
  console.log(`[seed] project=${PROJECT_ID} firestore=${process.env.FIRESTORE_EMULATOR_HOST} auth=${process.env.FIREBASE_AUTH_EMULATOR_HOST}`)
  await seedDevUser()
  const sources = await seedSources()
  await seedRuns(sources.map((s) => s.id))
  await seedOrganizations()
  await seedSignals()
  await seedScores()
  await seedReviewQueue()
  await seedGrants()
  await seedSettings()
  console.log('\n[seed] done ✓  Sign in at the console with the "Dev sign-in" button (or')
  console.log(`[seed]   ${DEV_EMAIL} / ${DEV_PASSWORD}).`)
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error('[seed] failed:', err)
    process.exit(1)
  },
)
