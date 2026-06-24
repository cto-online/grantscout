import { describe, it, expect } from 'vitest';
import { nameKey, buildMissionIndex, enrichAgainstIndex } from '../src/pipeline/enrich.js';
import type { Organization } from '../src/core/types.js';

function org(canonicalId: string, name: string, mission?: string): Organization {
  return {
    canonicalId,
    names: [name],
    type: 'ngo',
    country: 'NL',
    identifiers: {},
    provenance: [],
    confidence: { overall: 0.9 },
    mission,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('nameKey', () => {
  it('strips legal-form and geo stopwords', () => {
    expect(nameKey('Stichting Kinderpostzegels Nederland')).toBe('kinderpostzegels');
    expect(nameKey('Greenpeace Nederland')).toBe('greenpeace');
  });
  it('normalizes punctuation/case so variants match', () => {
    expect(nameKey('Wereld Natuur Fonds Nederland')).toBe(nameKey('wereld-natuur fonds, nederland'));
  });
  it('keeps distinct names distinct', () => {
    expect(nameKey('War Child Nederland')).not.toBe(nameKey('Greenpeace Nederland'));
  });
});

describe('buildMissionIndex', () => {
  it('indexes only orgs that have a mission, keyed by nameKey', () => {
    const idx = buildMissionIndex([
      { canonicalId: 'a', names: ['Greenpeace Nederland'], mission: 'Protect the environment' },
      { canonicalId: 'b', names: ['War Child Nederland'] }, // no mission → skipped
    ]);
    expect(idx.get('greenpeace')?.canonicalId).toBe('a');
    expect(idx.has(nameKey('War Child Nederland'))).toBe(false);
  });
});

describe('enrichAgainstIndex', () => {
  const index = buildMissionIndex([
    { canonicalId: 'anbi-green', names: ['Greenpeace Nederland'], mission: 'Protect the environment' },
  ]);

  it('borrows a mission for a name-matched missionless org', () => {
    const { orgs, enriched } = enrichAgainstIndex([org('ga-green', 'Greenpeace Nederland')], index);
    expect(enriched).toBe(1);
    expect(orgs[0].mission).toBe('Protect the environment');
  });

  it('leaves non-matching orgs untouched (fallback path)', () => {
    const { orgs, enriched } = enrichAgainstIndex([org('ga-wc', 'War Child Nederland')], index);
    expect(enriched).toBe(0);
    expect(orgs[0].mission).toBeUndefined();
  });

  it('does not overwrite an org that already has a mission', () => {
    const { enriched } = enrichAgainstIndex([org('x', 'Greenpeace Nederland', 'Own mission')], index);
    expect(enriched).toBe(0);
  });

  it('does not match an org against itself', () => {
    const selfIndex = buildMissionIndex([{ canonicalId: 'same', names: ['Greenpeace Nederland'], mission: 'm' }]);
    const { enriched } = enrichAgainstIndex([org('same', 'Greenpeace Nederland')], selfIndex);
    expect(enriched).toBe(0);
  });
});
