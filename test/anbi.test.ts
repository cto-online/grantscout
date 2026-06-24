import { describe, it, expect } from 'vitest';
import { extractAnbi } from '../src/pipeline/extractors/anbi.js';

describe('ANBI extractor', () => {
  const sampleTsv = `RSIN_Nummer	Naam	Doelstelling	Status
000000001	Test NGO 1	Helping communities	Actief
000000002	Test NGO 2	Environmental protection	Actief
000000003	Test NGO 3		Actief`;

  it('extracts organizations from TSV', () => {
    const { orgs, signals } = extractAnbi(sampleTsv, 'test-snapshot-1');

    expect(orgs.length).toBe(3);
    expect(orgs[0].names).toContain('Test NGO 1');
    expect(orgs[0].identifiers.rsin).toBe('000000001');
    expect(orgs[0].country).toBe('NL');
  });

  it('extracts signals for each org', () => {
    const { signals } = extractAnbi(sampleTsv, 'test-snapshot-1');

    expect(signals.length).toBe(3);
    expect(signals.every(s => s.type === 'registry_listed')).toBe(true);
    expect(signals[0].strength).toBe(0.2);
  });

  it('includes provenance on all records', () => {
    const { orgs, signals } = extractAnbi(sampleTsv, 'test-snapshot-1');

    expect(orgs[0].provenance).toHaveLength(1);
    expect(orgs[0].provenance[0].sourceId).toBe('anbi-nl');
    expect(orgs[0].provenance[0].snapshotId).toBe('test-snapshot-1');

    expect(signals[0].provenance.sourceId).toBe('anbi-nl');
  });

  it('handles missing optional fields', () => {
    const { orgs } = extractAnbi(sampleTsv, 'test-snapshot-1');
    const orgWithoutMission = orgs[2];

    expect(orgWithoutMission.mission).toBeFalsy();
    expect(orgWithoutMission.confidence.perField?.doelstelling).toBeLessThan(0.8);
  });

  it('returns empty for invalid input', () => {
    const { orgs, signals } = extractAnbi('', 'test-snapshot-1');

    expect(orgs.length).toBe(0);
    expect(signals.length).toBe(0);
  });

  it('throws on missing required columns', () => {
    const invalidTsv = `Naam	Status
Test NGO	Actief`;

    expect(() => extractAnbi(invalidTsv, 'test-snapshot-1')).toThrow('missing RSIN_Nummer');
  });
});
