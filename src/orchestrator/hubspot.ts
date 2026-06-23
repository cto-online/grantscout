import { config } from '../core/config.js';

export async function syncProspectsToHubSpot(prospects: any[]): Promise<void> {
  if (!config.hubspotAccessToken) {
    console.warn('[hubspot] No HUBSPOT_ACCESS_TOKEN configured, skipping sync');
    return;
  }

  console.log(`[hubspot] Syncing ${prospects.length} prospects (HUBSPOT_SYNC_ENABLED=${config.hubspotSyncEnabled})`);

  // Log the payload for dry-run
  console.log('[hubspot] Upsert payload:', JSON.stringify(prospects, null, 2));

  if (!config.hubspotSyncEnabled) {
    console.log('[hubspot] Dry-run mode; no actual sync performed');
    return;
  }

  // TODO implement real HubSpot sync via Companies API
}
