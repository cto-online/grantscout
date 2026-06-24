import { describe, it, expect } from 'vitest';
import { fetchFirecrawl } from '../src/pipeline/providers/firecrawl.js';
import { extractHiringSignals } from '../src/pipeline/extractors/hiring.js';
import type { Source } from '../src/core/types.js';

const source = { id: 'hiring-nl', fetchConfig: { keywords: ['fondsenwerver'] } } as unknown as Source;

describe('fetchFirecrawl (sample fallback)', () => {
  it('returns parseable job postings when FIRECRAWL_API_KEY is unset', async () => {
    const buf = await fetchFirecrawl(source);
    const postings = JSON.parse(buf.toString('utf-8'));
    expect(Array.isArray(postings)).toBe(true);
    expect(postings.length).toBeGreaterThan(0);
    expect(postings[0]).toHaveProperty('company');
  });

  it('feeds the extractor to produce orgs + high-intent hiring signals', async () => {
    const buf = await fetchFirecrawl(source);
    const postings = JSON.parse(buf.toString('utf-8'));
    const { orgs, signals } = await extractHiringSignals(postings, 'test-snap');
    expect(orgs.length).toBeGreaterThan(0);
    expect(signals.length).toBeGreaterThan(0);
    expect(signals.every((s) => s.type === 'hiring_grants_role')).toBe(true);
    expect(signals[0].strength).toBe(0.9); // high intent
  });
});
