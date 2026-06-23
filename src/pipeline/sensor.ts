import type { Source, Signal, Organization } from '../core/types.js';

// fetch → capture(GCS) → extract → normalize → resolve org → upsert org + emit signal(s)
export async function runSensor(source: Source): Promise<{ orgs: number; signals: number }> {
  // 1. fetch via provider (http | grantatlas | firecrawl)
  // 2. store immutable RawSnapshot in GCS, record provenance
  // 3. extract (deterministic for anbi/awardees; gemini for long-tail)
  // 4. normalize + validate + confidence-score (zod)
  // 5. resolve/dedup org (by identifiers/name+country), merge provenance
  // 6. write organizations; emit signals (idempotent by deterministic id)
  // 7. low-confidence or conflicting → reviewQueue
  // TODO implement per provider; keep each step pure + unit-tested
  return { orgs: 0, signals: 0 };
}
