import type { Organization, Signal } from '../core/types.js';

/**
 * Entity resolution: dedup orgs, merge provenance, link to GrantAtlas.
 * Idempotent: same org (by RSIN/name+country) merges, old records yield.
 */
export async function resolveOrganizations(candidates: Organization[]): Promise<Map<string, Organization>> {
  // TODO implement entity resolution
  // - Group by RSIN (highest confidence), then by normalizedName + country
  // - Merge: keep all names, latest mission, union of identifiers
  // - Merge provenance: all sources tracked
  // - Link to GrantAtlas funders (if available)
  // - Return map of canonicalId → merged org
  return new Map();
}

export async function deduplicateSignals(signals: Signal[]): Promise<Signal[]> {
  // TODO implement signal dedup
  // - Group by orgId + type + occurredAt + sourceId (deterministic ID already does this)
  // - Merge confidence: take highest if re-ingested
  // - Return unique set
  return signals;
}
