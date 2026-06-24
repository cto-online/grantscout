import { organizationId, signalId } from '../../core/ids.js';
import type { Organization, Signal, Provenance } from '../../core/types.js';

export interface AnbiRecord {
  rsin: string;
  naam: string;
  status?: string;
  doelstelling?: string;
}

/**
 * Deterministic ANBI register extractor.
 * Parses TSV from Belastingdienst ANBI register (public open data).
 * Produces organizations with `registry_listed` signals.
 * See: https://www.belastingdienst.nl/ondernemers/anbi/
 */
export function extractAnbi(rawData: string | Buffer, snapshotId: string): { orgs: Organization[]; signals: Signal[] } {
  const text = typeof rawData === 'string' ? rawData : rawData.toString('utf-8');
  const lines = text.trim().split('\n');

  if (lines.length < 2) {
    return { orgs: [], signals: [] };
  }

  const header = lines[0].split('\t');
  const rsinIdx = header.indexOf('RSIN_Nummer');
  const naamIdx = header.indexOf('Naam');
  const doelstellingIdx = header.indexOf('Doelstelling');
  const statusIdx = header.indexOf('Status');

  if (rsinIdx === -1 || naamIdx === -1) {
    throw new Error('ANBI TSV missing RSIN_Nummer or Naam columns');
  }

  const now = new Date().toISOString();
  const orgs: Organization[] = [];
  const signals: Signal[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    if (parts.length <= Math.max(rsinIdx, naamIdx)) continue;

    const rsin = parts[rsinIdx]?.trim();
    const naam = parts[naamIdx]?.trim();
    const doelstelling = doelstellingIdx >= 0 ? parts[doelstellingIdx]?.trim() : undefined;
    const status = statusIdx >= 0 ? parts[statusIdx]?.trim() : undefined;

    if (!rsin || !naam) continue;

    const canonicalId = organizationId('NL', rsin);

    const provenance: Provenance = {
      sourceId: 'anbi-nl',
      snapshotId,
      extractionMethod: 'deterministic',
      fetchedAt: new Date().toISOString(),
    };

    const org: Organization = {
      canonicalId,
      names: [naam],
      type: 'ngo',
      country: 'NL',
      identifiers: { rsin, anbi: true },
      mission: doelstelling,
      provenance: [provenance],
      confidence: { overall: 0.95, perField: { rsin: 1.0, naam: 0.95, doelstelling: doelstelling ? 0.8 : 0.5 } },
      createdAt: now,
      updatedAt: now,
    };

    orgs.push(org);

    const signal: Signal = {
      id: signalId(canonicalId, 'registry_listed', now, 'anbi-nl'),
      orgId: canonicalId,
      type: 'registry_listed',
      strength: 0.2,
      occurredAt: now,
      detectedAt: now,
      provenance,
      confidence: { overall: 0.95 },
    };

    signals.push(signal);
  }

  return { orgs, signals };
}
