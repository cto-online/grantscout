import type { Organization, Signal } from '../../core/types.js';

/**
 * Deterministic ANBI register extractor.
 * Parses CSV/XML from Belastingdienst ANBI register.
 * Produces organizations with `registry_listed` signals.
 */
export async function extractAnbi(rawData: string | Buffer): Promise<{ orgs: Organization[]; signals: Signal[] }> {
  // TODO implement deterministic CSV/XML parser
  // - Read ANBI register format (confirm current distribution at build time)
  // - Extract: id (RSIN), name, mission, legal status
  // - Create organizations with confidence: firmographic (0.8), registry (0.9)
  // - Emit `registry_listed` signals
  // - Return idempotent results (same input = same output)
  return { orgs: [], signals: [] };
}
