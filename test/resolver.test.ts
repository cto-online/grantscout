import { describe, it, expect } from 'vitest';
import { resolveOrganizations, deduplicateSignals } from '../src/pipeline/resolver.js';
import type { Organization, Signal } from '../src/core/types.js';

describe('resolver', () => {
  describe('resolveOrganizations', () => {
    it('deduplicates orgs by RSIN', async () => {
      // TODO test dedup by RSIN
      const result = await resolveOrganizations([]);
      expect(result.size).toBe(0);
    });

    it('merges provenance across duplicates', async () => {
      // TODO test provenance merging
      const result = await resolveOrganizations([]);
      expect(result.size).toBe(0);
    });
  });

  describe('deduplicateSignals', () => {
    it('removes duplicate signals', async () => {
      // TODO test signal dedup by deterministic ID
      const result = await deduplicateSignals([]);
      expect(result.length).toBe(0);
    });
  });
});
