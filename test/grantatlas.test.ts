import { describe, it, expect } from 'vitest';
import { extractGrantAtlasAwardees } from '../src/pipeline/extractors/grantatlas.js';

describe('GrantAtlas extractor', () => {
  const sampleData = JSON.stringify([
    {
      awardeeNameNormalized: 'Stichting Hulp in Nood',
      country: 'NL',
      funderId: 'funder-123',
      grantId: 'grant-001',
      awardedAmount: 50000,
      awardedDate: '2026-01-15T00:00:00Z',
      status: 'awarded',
    },
    {
      awardeeNameNormalized: 'Organisatie voor Duurzaamheid',
      country: 'NL',
      funderId: 'funder-456',
      grantId: 'grant-002',
      awardedAmount: 30000,
      awardedDate: '2026-02-20T00:00:00Z',
      status: 'applied',
    },
  ]);

  it('extracts awardees from JSON', () => {
    const { orgs, signals } = extractGrantAtlasAwardees(sampleData, 'test-snapshot');

    expect(orgs.length).toBe(2);
    expect(orgs[0].names[0]).toBe('Stichting Hulp in Nood');
    expect(orgs[0].country).toBe('NL');
  });

  it('emits grant_awarded and grant_applied signals', () => {
    const { signals } = extractGrantAtlasAwardees(sampleData, 'test-snapshot');

    expect(signals.length).toBe(2);
    expect(signals[0].type).toBe('grant_awarded');
    expect(signals[0].strength).toBe(0.8);
    expect(signals[1].type).toBe('grant_applied');
    expect(signals[1].strength).toBe(0.85);
  });

  it('includes grant details in signal payload', () => {
    const { signals } = extractGrantAtlasAwardees(sampleData, 'test-snapshot');

    expect(signals[0].payload?.funderId).toBe('funder-123');
    expect(signals[0].payload?.grantId).toBe('grant-001');
    expect(signals[0].payload?.amount).toBe(50000);
  });

  it('deduplicates orgs across multiple awards', () => {
    const dataWithDuplicate = JSON.stringify([
      {
        awardeeNameNormalized: 'Same Org',
        country: 'NL',
        funderId: 'funder-1',
        grantId: 'grant-1',
        awardedDate: '2026-01-01T00:00:00Z',
        status: 'awarded',
      },
      {
        awardeeNameNormalized: 'Same Org',
        country: 'NL',
        funderId: 'funder-2',
        grantId: 'grant-2',
        awardedDate: '2026-02-01T00:00:00Z',
        status: 'awarded',
      },
    ]);

    const { orgs, signals } = extractGrantAtlasAwardees(dataWithDuplicate, 'test-snapshot');

    expect(orgs.length).toBe(1);
    expect(signals.length).toBe(2); // but two signals for same org
    expect(signals[0].orgId).toBe(signals[1].orgId);
  });

  it('includes high confidence scores', () => {
    const { orgs, signals } = extractGrantAtlasAwardees(sampleData, 'test-snapshot');

    expect(orgs[0].confidence.overall).toBe(0.98);
    expect(signals[0].confidence.overall).toBe(0.98);
  });

  it('handles empty input', () => {
    const { orgs, signals } = extractGrantAtlasAwardees('[]', 'test-snapshot');

    expect(orgs.length).toBe(0);
    expect(signals.length).toBe(0);
  });

  it('throws on invalid JSON', () => {
    expect(() => extractGrantAtlasAwardees('invalid', 'test-snapshot')).toThrow();
  });
});
