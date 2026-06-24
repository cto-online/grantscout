export const config = {
  gcpProjectId: process.env.GCP_PROJECT_ID || 'grantscout',
  firestoreDatabaseId: process.env.FIRESTORE_DATABASE_ID || '(default)',
  gcsRawBucket: process.env.GCS_RAW_BUCKET || 'grantscout-raw',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  typesenseHost: process.env.TYPESENSE_HOST || '',
  typesenseApiKey: process.env.TYPESENSE_API_KEY || '',
  grantatlasReadApiUrl: process.env.GRANTATLAS_READ_API_URL || '',
  grantatlasApiKey: process.env.GRANTATLAS_API_KEY || '',
  // GrantAtlas Console Admin API (opportunities catalog). Auth is a Firebase
  // ID token minted via custom-token exchange (see sources/grantatlas/client.ts).
  grantatlasBaseUrl: process.env.GRANTATLAS_BASE_URL || 'https://grantatlas-prod.web.app',
  grantatlasFbApiKey: process.env.GRANTATLAS_FB_API_KEY || '',
  grantatlasProjectId: process.env.GRANTATLAS_PROJECT_ID || '',
  grantatlasBotUid: process.env.GRANTATLAS_BOT_UID || 'pipeline-bot',
  hubspotAccessToken: process.env.HUBSPOT_ACCESS_TOKEN || '',
  hubspotSyncEnabled: process.env.HUBSPOT_SYNC_ENABLED === 'true',
};
