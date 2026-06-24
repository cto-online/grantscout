import { describe, it, expect } from 'vitest';
import { projectGrant, type RawGrant } from '../src/sources/grantatlas/grants.js';

const raw: RawGrant = {
  canonicalId: 'ga_grant_1',
  externalId: 'staatscourant-2026-1',
  title: { source: 'Subsidieregeling X', normalized: 'Subsidie duurzame energie' },
  funderId: 'ga_funder_1',
  funderName: 'Provincie Utrecht',
  funding: { min: 5000, max: 50000, currency: 'EUR' },
  dates: { open: '2026-01-01', close: '2026-09-30', rolling: false },
  eligibility: { geographicScope: ['NL-UT'], sectors: ['energy'], organizationTypes: ['ngo', 'sme'] },
  grantType: 'subsidy',
  ngoEligible: true,
  status: 'active',
  provenance: { sourceUrl: 'https://example.nl/x' },
};

describe('projectGrant', () => {
  it('flattens the raw GrantAtlas grant into an opportunity', () => {
    const g = projectGrant(raw);
    expect(g).toMatchObject({
      id: 'ga_grant_1',
      title: 'Subsidie duurzame energie', // prefers normalized
      funderName: 'Provincie Utrecht',
      fundingMin: 5000,
      fundingMax: 50000,
      currency: 'EUR',
      dateClose: '2026-09-30',
      status: 'active',
      ngoEligible: true,
      sourceUrl: 'https://example.nl/x',
    });
    expect(g.sectors).toEqual(['energy']);
    expect(g.organizationTypes).toEqual(['ngo', 'sme']);
  });

  it('falls back to source title and defaults status to active', () => {
    expect(projectGrant({ canonicalId: 'x', funderId: 'f', title: { source: 'Only source' } }).title).toBe('Only source');
    expect(projectGrant({ canonicalId: 'x', funderId: 'f' }).status).toBe('active');
    expect(projectGrant({ canonicalId: 'x', funderId: 'f' }).title).toBe('(untitled)');
  });
});
