import { config } from '../../core/config.js';

/**
 * GrantAtlas provider: Query awardee/applicant lists from GrantAtlas API.
 * Resolves grant-seeking orgs that won/applied for grants.
 */
export async function fetchGrantAtlasAwardees(): Promise<Buffer> {
  if (!config.grantatlasReadApiUrl || !config.grantatlasApiKey) {
    throw new Error('GRANTATLAS_READ_API_URL or GRANTATLAS_API_KEY not configured');
  }

  // TODO implement GrantAtlas API integration
  // - Query awardee/applicant lists endpoint
  // - Parse org names, funder, grant, amount, award date
  // - Returns buffer of JSON records
  throw new Error('GrantAtlas provider not yet implemented');
}
