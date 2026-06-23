import { z } from 'zod';
import type { Organization, Signal, Confidence, Provenance } from '../core/types.js';

/**
 * Normalize and validate extracted org/signal data.
 * Applies Zod schemas, confidence scoring, standardization.
 */
export const OrgSchema = z.object({
  canonicalId: z.string(),
  names: z.array(z.string()).min(1),
  type: z.enum(['ngo', 'foundation', 'charity', 'association', 'social_enterprise', 'other']),
  country: z.string().length(2),
  identifiers: z.object({
    rsin: z.string().optional(),
    kvk: z.string().optional(),
    anbi: z.boolean().optional(),
    websiteDomain: z.string().optional(),
  }).optional(),
  mission: z.string().optional(),
  themes: z.array(z.string()).optional(),
  provenance: z.array(z.object({
    sourceId: z.string(),
    snapshotId: z.string().optional(),
    sourceUrl: z.string().optional(),
    fetchedAt: z.string().optional(),
    extractionMethod: z.enum(['deterministic', 'llm']).optional(),
  })),
  confidence: z.object({
    overall: z.number().min(0).max(1),
    perField: z.record(z.number()).optional(),
  }),
});

export const SignalSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  type: z.enum(['grant_awarded', 'grant_applied', 'deadline_upcoming', 'hiring_grants_role', 'registry_listed', 'search_intent', 'website_signal']),
  strength: z.number().min(0).max(1).optional(),
  occurredAt: z.string().datetime(),
  detectedAt: z.string().datetime().optional(),
  payload: z.record(z.unknown()).optional(),
  provenance: z.object({
    sourceId: z.string(),
    snapshotId: z.string().optional(),
  }),
  confidence: z.object({
    overall: z.number().min(0).max(1),
  }).optional(),
});

export function normalizeOrg(raw: unknown): { org: Organization | null; confidence: Confidence; errors: string[] } {
  const errors: string[] = [];
  let org: Organization | null = null;

  try {
    const parsed = OrgSchema.parse(raw);
    org = parsed as Organization;
  } catch (e) {
    if (e instanceof z.ZodError) {
      errors.push(...e.errors.map(err => `${err.path.join('.')}: ${err.message}`));
    } else {
      errors.push(String(e));
    }
  }

  const confidence: Confidence = {
    overall: org?.confidence.overall ?? 0,
    perField: org?.confidence.perField,
  };

  return { org, confidence, errors };
}

export function normalizeSignal(raw: unknown): { signal: Signal | null; confidence: Confidence; errors: string[] } {
  const errors: string[] = [];
  let signal: Signal | null = null;

  try {
    const parsed = SignalSchema.parse(raw);
    signal = parsed as Signal;
  } catch (e) {
    if (e instanceof z.ZodError) {
      errors.push(...e.errors.map(err => `${err.path.join('.')}: ${err.message}`));
    } else {
      errors.push(String(e));
    }
  }

  const confidence: Confidence = { overall: 0.9 };
  return { signal, confidence, errors };
}
