import type { Organization, Signal } from '../../core/types.js';

/**
 * Extract awardees/applicants from GrantAtlas grant records.
 * Produces organizations + high-intent grant_awarded/grant_applied signals.
 */
export function extractGrantAtlasAwardees(
  rawData: string | Buffer,
  snapshotId: string
): { orgs: Organization[]; signals: Signal[] } {
  // TODO implement awardee extraction
  // - Parse JSON from GrantAtlas API: org name, funder, grant id, amount, date
  // - Create org: country='NL' (start), name from parsed record
  // - Emit grant_awarded (strength 0.8) or grant_applied (0.85)
  // - Include funderId, grantId, amount in signal payload
  // - Higher confidence (0.95+) since sourced from primary data
  return { orgs: [], signals: [] };
}
