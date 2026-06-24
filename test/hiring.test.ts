import { describe, it, expect } from 'vitest';
import { extractHiringSignals } from '../src/pipeline/extractors/hiring.js';
import type { JobPosting } from '../src/pipeline/extractors/hiring.js';

describe('Hiring signals extractor', () => {
  const samplePostings: JobPosting[] = [
    {
      title: 'Subsidieadviseur',
      company: 'Stichting Hulp in Nood',
      description: 'Wij zoeken een ervaren subsidieadviseur voor onze organisatie',
      postedDate: '2026-02-20T00:00:00Z',
      url: 'https://example.com/job1',
    },
    {
      title: 'Grants Manager',
      company: 'Rode Kruis Afdeling',
      description: 'Help us find funding for our humanitarian projects',
      postedDate: '2026-02-15T00:00:00Z',
      url: 'https://example.com/job2',
    },
  ];

  it('extracts organizations from job postings', async () => {
    const { orgs, signals } = await extractHiringSignals(samplePostings, 'test-snapshot');

    expect(orgs.length).toBe(2);
    expect(orgs[0].names[0]).toBe('Stichting Hulp in Nood');
    expect(orgs[1].names[0]).toBe('Rode Kruis Afdeling');
  });

  it('emits hiring_grants_role signals', async () => {
    const { signals } = await extractHiringSignals(samplePostings, 'test-snapshot');

    expect(signals.length).toBe(2);
    expect(signals.every(s => s.type === 'hiring_grants_role')).toBe(true);
    expect(signals[0].strength).toBe(0.9); // High intent
  });

  it('includes job details in signal payload', async () => {
    const { signals } = await extractHiringSignals(samplePostings, 'test-snapshot');

    expect(signals[0].payload?.jobTitle).toBe('Subsidieadviseur');
    expect(signals[0].payload?.jobUrl).toBe('https://example.com/job1');
  });

  it('filters out non-grants-related postings', async () => {
    const mixedPostings: JobPosting[] = [
      ...samplePostings,
      {
        title: 'Software Engineer',
        company: 'Tech Company',
        description: 'Build amazing software',
        postedDate: '2026-02-10T00:00:00Z',
      },
    ];

    const { orgs, signals } = await extractHiringSignals(mixedPostings, 'test-snapshot');

    expect(orgs.length).toBe(2); // Only grant-related orgs
    expect(signals.length).toBe(2);
  });

  it('deduplicates orgs across multiple postings', async () => {
    const sameOrgPostings: JobPosting[] = [
      {
        title: 'Subsidieadviseur',
        company: 'Stichting ABC',
        description: 'Subsidie advisor needed',
        postedDate: '2026-02-20T00:00:00Z',
      },
      {
        title: 'Grants Manager',
        company: 'Stichting ABC',
        description: 'Grants manager for fundraising',
        postedDate: '2026-02-15T00:00:00Z',
      },
    ];

    const { orgs, signals } = await extractHiringSignals(sameOrgPostings, 'test-snapshot');

    expect(orgs.length).toBe(1); // Same org, deduped
    expect(signals.length).toBe(2); // Both signals emitted
    expect(signals[0].orgId).toBe(signals[1].orgId);
  });

  it('includes provenance on all records', async () => {
    const { orgs, signals } = await extractHiringSignals(samplePostings, 'test-snapshot-123');

    expect(orgs[0].provenance[0].sourceId).toBe('hiring-nl');
    expect(orgs[0].provenance[0].snapshotId).toBe('test-snapshot-123');
    expect(signals[0].provenance.sourceId).toBe('hiring-nl');
  });

  it('returns empty for non-matching postings', async () => {
    const nonMatching: JobPosting[] = [
      {
        title: 'Sales Manager',
        description: 'Sell our products',
      },
    ];

    const { orgs, signals } = await extractHiringSignals(nonMatching, 'test-snapshot');

    expect(orgs.length).toBe(0);
    expect(signals.length).toBe(0);
  });
});
