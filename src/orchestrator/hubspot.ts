import { config } from '../core/config.js';
import { collections } from '../core/firestore.js';
import type { Organization, AccountScore } from '../core/types.js';

/**
 * HubSpot prospect representation.
 * Maps GrantScout org + score to HubSpot Company object.
 */
export interface HubSpotProspect {
  name: string;
  country: string;
  grantscout_score: number;
  grantscout_tier: string;
  grantscout_fit: number;
  grantscout_intent: number;
  grantscout_timing: number;
  grantscout_reachability: number;
  grantscout_reasons: string;
  grantscout_source_rsin?: string;
  grantscout_updated_at: string;
}

/**
 * Convert GrantScout org + score to HubSpot prospect payload.
 */
export function toHubSpotProspect(org: Organization, score: AccountScore): HubSpotProspect {
  const reasonsText = score.reasons.map(r => `${r.factor}: ${r.detail}`).join('; ');

  return {
    name: org.names[0] || 'Unknown',
    country: org.country,
    grantscout_score: score.score,
    grantscout_tier: score.tier,
    grantscout_fit: parseFloat(score.fit.toFixed(2)),
    grantscout_intent: parseFloat(score.intent.toFixed(2)),
    grantscout_timing: parseFloat(score.timing.toFixed(2)),
    grantscout_reachability: parseFloat(score.reachability.toFixed(2)),
    grantscout_reasons: reasonsText,
    grantscout_source_rsin: org.identifiers.rsin,
    grantscout_updated_at: new Date().toISOString(),
  };
}

/**
 * Sync prospects to HubSpot.
 * Dry-run by default (HUBSPOT_SYNC_ENABLED=false); logs payloads for review.
 */
export async function syncProspectsToHubSpot(
  prospects: { org: Organization; score: AccountScore }[]
): Promise<{ synced: number; logged: number }> {
  if (!config.hubspotAccessToken) {
    console.warn('[hubspot] No HUBSPOT_ACCESS_TOKEN configured, skipping sync');
    return { synced: 0, logged: prospects.length };
  }

  const hupsotPayloads = prospects.map(p => toHubSpotProspect(p.org, p.score));

  console.log(`\n[hubspot] Syncing ${hupsotPayloads.length} prospects`);
  console.log('[hubspot] Sample payload:', JSON.stringify(hupsotPayloads[0], null, 2));

  if (!config.hubspotSyncEnabled) {
    console.log('[hubspot] DRY-RUN MODE: No actual sync performed');
    console.log('[hubspot] To enable real sync, set HUBSPOT_SYNC_ENABLED=true');

    // Log the dry-run to Firestore for auditing (if available)
    if (collections.syncLogs) {
      try {
        await collections.syncLogs.add({
          service: 'hubspot',
          timestamp: new Date().toISOString(),
          prospectsCount: hupsotPayloads.length,
          status: 'dry-run',
          payloadSample: hupsotPayloads.slice(0, 3),
        });
      } catch (e) {
        console.warn('[hubspot] Could not log to Firestore (not configured?):', e);
      }
    }

    return { synced: 0, logged: hupsotPayloads.length };
  }

  // TODO implement real HubSpot upsert
  // - Batch upsert via Companies API
  // - Handle rate limits (100/s for standard tier)
  // - Map grantscout_* properties
  // - Log sync result to syncLogs
  console.log('[hubspot] Real sync not yet implemented');

  return { synced: 0, logged: hupsotPayloads.length };
}

/**
 * Rank prospects by Account Score tier and score value.
 * Returns top-N prospects ready for sync.
 */
export function rankProspects(
  prospects: { org: Organization; score: AccountScore }[],
  topN: number = 100
): { org: Organization; score: AccountScore }[] {
  const tierOrder = { hot: 0, warm: 1, cold_fit: 2, low: 3 };

  return prospects
    .sort((a, b) => {
      const tierDiff = tierOrder[a.score.tier] - tierOrder[b.score.tier];
      if (tierDiff !== 0) return tierDiff;
      return b.score.score - a.score.score; // higher score first
    })
    .slice(0, topN);
}
