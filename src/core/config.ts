export const config = {
  gcpProjectId: process.env.GCP_PROJECT_ID || 'grantscout',
  firestoreDatabaseId: process.env.FIRESTORE_DATABASE_ID || '(default)',
  gcsRawBucket: process.env.GCS_RAW_BUCKET || 'grantscout-raw',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  typesenseHost: process.env.TYPESENSE_HOST || '',
  typesenseApiKey: process.env.TYPESENSE_API_KEY || '',
  grantatlasReadApiUrl: process.env.GRANTATLAS_READ_API_URL || '',
  grantatlasApiKey: process.env.GRANTATLAS_API_KEY || '',
  hubspotAccessToken: process.env.HUBSPOT_ACCESS_TOKEN || '',
  hubspotSyncEnabled: process.env.HUBSPOT_SYNC_ENABLED === 'true',
};
