import { describe, it, expect } from 'vitest';
import { computeAccountScore } from '../src/scoring/accountScore.js';
import type { Organization, Signal } from '../src/core/types.js';

describe('computeAccountScore', () => {
  const now = new Date().toISOString();

  const mockOrg: Organization = {
    canonicalId: 'test-org-1',
    names: ['Test NGO'],
    type: 'ngo',
    country: 'NL',
    identifiers: { rsin: '123456789' },
    provenance: [],
    confidence: { overall: 0.9 },
    createdAt: now,
    updatedAt: now,
  };

  const mockSignals: Signal[] = [
    {
      id: 'signal-1',
      orgId: 'test-org-1',
      type: 'grant_awarded',
      strength: 1.0,
      occurredAt: now,
      detectedAt: now,
      provenance: { sourceId: 'grantatlas-awardees' },
      confidence: { overall: 0.95 },
    },
  ];

  it('computes a score with reasons', () => {
    const score = computeAccountScore(mockOrg, mockSignals, 0.7, 0.8);

    expect(score.orgId).toBe('test-org-1');
    expect(score.score).toBeGreaterThan(0);
    expect(score.tier).toBe('hot');
    expect(score.reasons.length).toBeGreaterThan(0);
  });

  it('respects opted-out flag', () => {
    const optedOutOrg = { ...mockOrg, optedOut: true };
    const score = computeAccountScore(optedOutOrg, mockSignals, 0.7, 0.8);

    expect(score.score).toBe(0);
    expect(score.tier).toBe('low');
  });

  it('returns warm tier for medium scores', () => {
    const score = computeAccountScore(mockOrg, mockSignals, 0.4, 0.5);
    expect(score.score).toBeLessThan(70);
    expect(score.score).toBeGreaterThanOrEqual(45);
    expect(score.tier).toBe('warm');
  });
});
