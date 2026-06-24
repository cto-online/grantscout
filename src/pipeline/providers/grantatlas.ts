import { readFileSync } from 'fs';
import { config } from '../../core/config.js';
import type { Source } from '../../core/types.js';

const SAMPLE_PATH = 'data/grantatlas-sample.json';

/**
 * GrantAtlas provider: fetch awardee/applicant records as a JSON buffer.
 * These are the highest-intent signals (grant_awarded / grant_applied).
 *
 * Resolution order:
 *   1. source.fetchConfig.url (per-source override)
 *   2. GRANTATLAS_READ_API_URL (env) — the production read API (Bearer auth)
 *   3. committed sample file (so the source is runnable in development)
 *
 * The returned bytes are a JSON array of GrantAtlasAwardee records, parsed
 * downstream by extractGrantAtlasAwardees.
 */
export async function fetchGrantAtlasAwardees(source?: Source): Promise<Buffer> {
  const configuredUrl =
    (source?.fetchConfig?.url as string | undefined) || config.grantatlasReadApiUrl;

  if (!configuredUrl) {
    console.warn(
      `[grantatlas] GRANTATLAS_READ_API_URL not set — using sample ${SAMPLE_PATH}`,
    );
    return readFileSync(SAMPLE_PATH);
  }

  if (configuredUrl.startsWith('file://')) {
    return readFileSync(configuredUrl.replace('file://', ''));
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': 'GrantScout/1.0 (grantscout-ingestion)',
  };
  if (config.grantatlasApiKey) {
    headers.Authorization = `Bearer ${config.grantatlasApiKey}`;
  }

  const res = await fetch(configuredUrl, { headers });
  if (!res.ok) {
    throw new Error(`GrantAtlas API ${res.status}: ${res.statusText}`);
  }
  return Buffer.from(await res.arrayBuffer());
}
