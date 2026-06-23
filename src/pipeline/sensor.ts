import type { Source } from '../core/types.js';
import { fetchHttp, storeSnapshot } from './providers/http.js';
import { extractAnbi } from './extractors/anbi.js';
import { normalizeOrg, normalizeSignal } from './normalizer.js';
import { resolveOrganizations, deduplicateSignals, writeOrganizationsAndSignals } from './resolver.js';
import { collections } from '../core/firestore.js';

/**
 * Run sensor for a source: fetch → capture → extract → normalize → resolve → store.
 * Each step is independently testable and composable.
 */
export async function runSensor(source: Source): Promise<{ orgs: number; signals: number }> {
  console.log(`[sensor] Starting ${source.id}`);

  try {
    // 1. Fetch via provider
    let rawData: Buffer;

    if (source.provider === 'http') {
      const url = source.fetchConfig?.url as string | undefined;
      if (!url) throw new Error(`${source.id}: missing fetchConfig.url`);

      console.log(`[sensor] Fetching from ${url}`);
      rawData = await fetchHttp(url);
    } else if (source.provider === 'grantatlas') {
      // TODO implement GrantAtlas provider
      throw new Error(`${source.id}: provider ${source.provider} not yet implemented`);
    } else if (source.provider === 'firecrawl') {
      // TODO implement Firecrawl provider
      throw new Error(`${source.id}: provider ${source.provider} not yet implemented`);
    } else {
      throw new Error(`${source.id}: unknown provider ${source.provider}`);
    }

    // 2. Store immutable raw snapshot in GCS
    console.log(`[sensor] Storing ${rawData.length} bytes to GCS`);
    const snapshotId = await storeSnapshot(source.id, rawData);

    // 3. Extract based on method
    console.log(`[sensor] Extracting via ${source.extractionMethod}`);
    let orgsRaw: any[] = [];
    let signalsRaw: any[] = [];

    if (source.extractionMethod === 'deterministic') {
      if (source.id === 'anbi-nl') {
        const result = extractAnbi(rawData, snapshotId);
        orgsRaw = result.orgs;
        signalsRaw = result.signals;
      } else {
        throw new Error(`${source.id}: deterministic extraction not implemented`);
      }
    } else {
      throw new Error(`${source.id}: LLM extraction not yet implemented`);
    }

    console.log(`[sensor] Extracted ${orgsRaw.length} orgs, ${signalsRaw.length} signals`);

    // 4. Normalize + validate
    const normalizedOrgs = orgsRaw.map(o => {
      const { org, errors } = normalizeOrg(o);
      if (errors.length > 0) {
        console.warn(`[sensor] Normalization errors for org ${o.canonicalId}:`, errors);
      }
      return org;
    }).filter((o): o is typeof o & {} => o !== null);

    const normalizedSignals = signalsRaw.map(s => {
      const { signal, errors } = normalizeSignal(s);
      if (errors.length > 0) {
        console.warn(`[sensor] Normalization errors for signal ${s.id}:`, errors);
      }
      return signal;
    }).filter((s): s is typeof s & {} => s !== null);

    console.log(`[sensor] Normalized ${normalizedOrgs.length} orgs, ${normalizedSignals.length} signals`);

    // 5. Resolve / dedup
    const resolvedOrgs = await resolveOrganizations(normalizedOrgs);
    const deduplicatedSignals = await deduplicateSignals(normalizedSignals);

    console.log(`[sensor] Resolved to ${resolvedOrgs.size} unique orgs`);

    // 6. Write to Firestore
    const writeResult = await writeOrganizationsAndSignals(
      Array.from(resolvedOrgs.values()),
      deduplicatedSignals
    );

    console.log(`[sensor] Wrote ${writeResult.orgsWritten} orgs, ${writeResult.signalsWritten} signals`);

    // 7. Store sync log
    await collections.syncLogs.add({
      sourceId: source.id,
      timestamp: new Date().toISOString(),
      orgsIngested: writeResult.orgsWritten,
      signalsIngested: writeResult.signalsWritten,
      snapshotId,
      status: 'success',
    });

    return { orgs: writeResult.orgsWritten, signals: writeResult.signalsWritten };
  } catch (error) {
    console.error(`[sensor] Error in ${source.id}:`, error);

    await collections.syncLogs.add({
      sourceId: source.id,
      timestamp: new Date().toISOString(),
      orgsIngested: 0,
      signalsIngested: 0,
      status: 'error',
      error: String(error),
    });

    throw error;
  }
}
