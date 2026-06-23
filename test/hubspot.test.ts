import { describe, it, expect } from 'vitest';
import { toHubSpotProspect, rankProspects } from '../src/orchestrator/hubspot.js';
import type { Organization, AccountScore } from '../src/core/types.js';

describe('HubSpot orchestrator', () => {
  const mockOrg: Organization = {
    canonicalId: 'test-org-1',
    names: ['Test NGO'],
    type: 'ngo',
    country: 'NL',
    identifiers: { rsin: '123456789' },
    provenance: [],
    confidence: { overall: 0.9 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockScore: AccountScore = {
    orgId: 'test-org-1',
    fit: 0.8,
    intent: 0.7,
    timing: 0.6,
    reachability: 0.9,
    score: 75,
    tier: 'hot',
    reasons: [
      { factor: 'fit', detail: 'ICP similarity 0.80', weight: 0.8 },
      { factor: 'intent', detail: 'Top signal weight 0.70', weight: 0.7 },
    ],
    contributingSignals: ['sig-1', 'sig-2'],
    computedAt: new Date().toISOString(),
    modelVersion: 'v0',
  };

  describe('toHubSpotProspect', () => {
    it('converts org + score to HubSpot payload', () => {
      const prospect = toHubSpotProspect(mockOrg, mockScore);

      expect(prospect.name).toBe('Test NGO');
      expect(prospect.country).toBe('NL');
      expect(prospect.grantscout_score).toBe(75);
      expect(prospect.grantscout_tier).toBe('hot');
      expect(prospect.grantscout_source_rsin).toBe('123456789');
    });

    it('includes all score components', () => {
      const prospect = toHubSpotProspect(mockOrg, mockScore);

      expect(prospect.grantscout_fit).toBe(0.8);
      expect(prospect.grantscout_intent).toBe(0.7);
      expect(prospect.grantscout_timing).toBe(0.6);
      expect(prospect.grantscout_reachability).toBe(0.9);
    });

    it('formats reasons as readable text', () => {
      const prospect = toHubSpotProspect(mockOrg, mockScore);

      expect(prospect.grantscout_reasons).toContain('fit: ICP similarity');
      expect(prospect.grantscout_reasons).toContain('intent: Top signal');
    });
  });

  describe('rankProspects', () => {
    const hot: AccountScore = { ...mockScore, score: 80, tier: 'hot' };
    const warm: AccountScore = { ...mockScore, score: 60, tier: 'warm' };
    const cold: AccountScore = { ...mockScore, score: 70, tier: 'cold_fit' };

    it('ranks by tier first, then score', () => {
      const prospects = [
        { org: mockOrg, score: cold },
        { org: mockOrg, score: hot },
        { org: mockOrg, score: warm },
      ];

      const ranked = rankProspects(prospects);

      expect(ranked[0].score.tier).toBe('hot');
      expect(ranked[1].score.tier).toBe('warm');
      expect(ranked[2].score.tier).toBe('cold_fit');
    });

    it('breaks ties within tier by score descending', () => {
      const hot1: AccountScore = { ...mockScore, score: 90, tier: 'hot' };
      const hot2: AccountScore = { ...mockScore, score: 70, tier: 'hot' };

      const prospects = [
        { org: mockOrg, score: hot2 },
        { org: mockOrg, score: hot1 },
      ];

      const ranked = rankProspects(prospects);

      expect(ranked[0].score.score).toBe(90);
      expect(ranked[1].score.score).toBe(70);
    });

    it('respects topN limit', () => {
      const prospects = Array.from({ length: 100 }, (_, i) => ({
        org: mockOrg,
        score: { ...mockScore, score: i, tier: 'warm' as const },
      }));

      const ranked = rankProspects(prospects, 10);

      expect(ranked.length).toBe(10);
    });
  });
});
