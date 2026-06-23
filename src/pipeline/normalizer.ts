import { z } from 'zod';
import type { Organization, Signal, Confidence, Provenance } from '../core/types.js';

/**
 * Normalize and validate extracted org/signal data.
 * Applies Zod schemas, confidence scoring, standardization.
 */
export const OrgSchema = z.object({
  names: z.array(z.string()).min(1),
  type: z.enum(['ngo', 'foundation', 'charity', 'association', 'social_enterprise', 'other']),
  country: z.string().length(2),
  identifiers: z.object({
    rsin: z.string().optional(),
    kvk: z.string().optional(),
    anbi: z.boolean().optional(),
    websiteDomain: z.string().optional(),
  }).optional(),
});

export const SignalSchema = z.object({
  type: z.enum(['grant_awarded', 'grant_applied', 'deadline_upcoming', 'hiring_grants_role', 'registry_listed', 'search_intent', 'website_signal']),
  occurredAt: z.string().datetime(),
  payload: z.record(z.unknown()).optional(),
});

export function normalizeOrg(raw: unknown, provenance: Provenance): { org: Organization | null; confidence: Confidence; errors: string[] } {
  // TODO implement validation + normalization
  // - Parse + validate via OrgSchema
  // - Normalize: whitespace, casing, duplicates in names
  // - Extract RSIN/KVK if present; link to GrantAtlas funders if available
  // - Assign confidence per field (identifiers boost, mission reduces)
  // - Collect errors for review queue
  return { org: null, confidence: { overall: 0 }, errors: [] };
}

export function normalizeSignal(raw: unknown, provenance: Provenance): { signal: Signal | null; confidence: Confidence; errors: string[] } {
  // TODO implement signal validation
  // - Parse + validate via SignalSchema
  // - Link to org (orgId lookup or deterministic match)
  // - Assign confidence per source + freshness
  // - Collect errors
  return { signal: null, confidence: { overall: 0 }, errors: [] };
}
