import { readFileSync } from 'fs';
import { config } from '../../core/config.js';
import { projectGrant, type GrantOpportunity, type RawGrant } from './grants.js';

const SAMPLE_PATH = 'data/grantatlas-grants-sample.json';

/**
 * Mint a Firebase ID token for the GrantAtlas admin API.
 *
 * GrantAtlas verifies a Firebase-issued ID token with a verified, allowlisted
 * email — a raw GCP/OIDC token won't pass. So we mint a custom token for the
 * pre-provisioned `pipeline-bot` user (created with emailVerified:true and
 * allowlisted on the GrantAtlas side) and exchange it for an ID token.
 *
 * Runs under ADC; the runner SA needs roles/iam.serviceAccountTokenCreator on
 * itself (so createCustomToken can sign via IAM signBlob) and rights to mint
 * tokens for the GrantAtlas project.
 */
export async function mintGrantAtlasIdToken(): Promise<string> {
  const { getApps, initializeApp, applicationDefault } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');

  const APP = 'grantatlas';
  const app =
    getApps().find((a) => a.name === APP) ||
    initializeApp(
      { credential: applicationDefault(), projectId: config.grantatlasProjectId || undefined },
      APP,
    );

  const customToken = await getAuth(app).createCustomToken(config.grantatlasBotUid);
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${config.grantatlasFbApiKey}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    },
  );
  if (!res.ok) {
    throw new Error(`GrantAtlas custom-token exchange ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { idToken?: string };
  if (!json.idToken) throw new Error('GrantAtlas token exchange returned no idToken');
  return json.idToken;
}

/**
 * Fetch grant opportunities from the GrantAtlas admin API.
 * Falls back to a committed sample when not configured, so the catalog is
 * runnable in development.
 */
export async function fetchGrants(): Promise<GrantOpportunity[]> {
  if (!config.grantatlasBaseUrl || !config.grantatlasFbApiKey) {
    console.warn(
      '[grantatlas] GRANTATLAS_FB_API_KEY not set — using sample opportunities',
    );
    const raw = JSON.parse(readFileSync(SAMPLE_PATH, 'utf-8')) as RawGrant[];
    return raw.map(projectGrant);
  }

  const idToken = await mintGrantAtlasIdToken();
  const url = `${config.grantatlasBaseUrl.replace(/\/$/, '')}/api/grants?limit=500`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` } });
  if (!res.ok) throw new Error(`GrantAtlas /api/grants ${res.status}: ${res.statusText}`);

  const body = (await res.json()) as RawGrant[] | { grants?: RawGrant[] };
  const raw = Array.isArray(body) ? body : (body.grants ?? []);
  return raw.map(projectGrant);
}
