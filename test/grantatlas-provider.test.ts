import { describe, it, expect } from 'vitest';
import { fetchGrantAtlasAwardees } from '../src/pipeline/providers/grantatlas.js';
import { extractGrantAtlasAwardees } from '../src/pipeline/extractors/grantatlas.js';

describe('fetchGrantAtlasAwardees (sample fallback)', () => {
  it('returns a parseable JSON buffer when no API URL is configured', async () => {
    const buf = await fetchGrantAtlasAwardees();
    expect(Buffer.isBuffer(buf)).toBe(true);
    const records = JSON.parse(buf.toString('utf-8'));
    expect(Array.isArray(records)).toBe(true);
    expect(records.length).toBeGreaterThan(0);
    expect(records[0]).toHaveProperty('awardeeNameNormalized');
  });

  it('feeds the extractor to produce orgs + high-intent signals', async () => {
    const buf = await fetchGrantAtlasAwardees();
    const { orgs, signals } = extractGrantAtlasAwardees(buf, 'test-snapshot');
    expect(orgs.length).toBeGreaterThan(0);
    expect(signals.length).toBeGreaterThan(0);
    expect(
      signals.every((s) => s.type === 'grant_awarded' || s.type === 'grant_applied'),
    ).toBe(true);
  });
});
