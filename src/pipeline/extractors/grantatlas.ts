import { organizationId, signalId } from '../../core/ids.js';
import type { Organization, Signal, Provenance } from '../../core/types.js';

export interface GrantAtlasAwardee {
  awardeeNameNormalized: string;
  country?: string;
  funderId: string;
  grantId: string;
  awardedAmount?: number;
  awardedDate: string;
  status: 'awarded' | 'applied';
}

/**
 * Deterministic GrantAtlas awardee extractor.
 * Parses awardee/applicant records from GrantAtlas API.
 * Produces organizations + high-intent signals (grant_awarded/grant_applied).
 */
export function extractGrantAtlasAwardees(
  rawData: string | Buffer,
  snapshotId: string
): { orgs: Organization[]; signals: Signal[] } {
  const text = typeof rawData === 'string' ? rawData : rawData.toString('utf-8');

  let records: GrantAtlasAwardee[];
  try {
    records = JSON.parse(text);
    if (!Array.isArray(records)) {
      throw new Error('Expected array of awardee records');
    }
  } catch (e) {
    throw new Error(`Failed to parse GrantAtlas awardees: ${e}`);
  }

  const now = new Date().toISOString();
  const orgs: Organization[] = [];
  const signals: Signal[] = [];
  const seenOrgIds = new Set<string>();

  for (const record of records) {
    if (!record.awardeeNameNormalized || !record.grantId) {
      continue;
    }

    const country = record.country || 'NL';
    const canonicalId = organizationId(country, record.awardeeNameNormalized);

    // Create org if not yet seen in this batch
    if (!seenOrgIds.has(canonicalId)) {
      seenOrgIds.add(canonicalId);

      const provenance: Provenance = {
        sourceId: 'grantatlas-awardees',
        snapshotId,
        extractionMethod: 'deterministic',
        fetchedAt: now,
      };

      const org: Organization = {
        canonicalId,
        names: [record.awardeeNameNormalized],
        type: 'ngo',
        country,
        identifiers: {},
        provenance: [provenance],
        confidence: { overall: 0.98, perField: { name: 0.98 } },
        createdAt: now,
        updatedAt: now,
      };

      orgs.push(org);
    }

    // Emit signal for each grant award/application
    const signalType = record.status === 'awarded' ? 'grant_awarded' : 'grant_applied';
    const signalStrength = record.status === 'awarded' ? 0.8 : 0.85;

    const provenance: Provenance = {
      sourceId: 'grantatlas-awardees',
      snapshotId,
      extractionMethod: 'deterministic',
      fetchedAt: now,
    };

    const signal: Signal = {
      id: signalId(canonicalId, signalType, record.awardedDate, 'grantatlas-awardees'),
      orgId: canonicalId,
      type: signalType,
      strength: signalStrength,
      occurredAt: record.awardedDate,
      detectedAt: now,
      payload: {
        funderId: record.funderId,
        grantId: record.grantId,
        amount: record.awardedAmount,
      },
      provenance,
      confidence: { overall: 0.98 },
    };

    signals.push(signal);
  }

  return { orgs, signals };
}
