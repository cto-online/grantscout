import { describe, it, expect } from 'vitest';
import { normalizeOrg, normalizeSignal, OrgSchema, SignalSchema } from '../src/pipeline/normalizer.js';

describe('normalizer', () => {
  describe('OrgSchema validation', () => {
    it('accepts valid org data', () => {
      const valid = {
        canonicalId: 'test-id',
        names: ['Test NGO'],
        type: 'ngo',
        country: 'NL',
        provenance: [{ sourceId: 'test' }],
        confidence: { overall: 0.9 },
      };
      expect(() => OrgSchema.parse(valid)).not.toThrow();
    });

    it('rejects missing country', () => {
      const invalid = {
        canonicalId: 'test-id',
        names: ['Test NGO'],
        type: 'ngo',
        provenance: [{ sourceId: 'test' }],
        confidence: { overall: 0.9 },
      };
      expect(() => OrgSchema.parse(invalid)).toThrow();
    });
  });

  describe('normalizeOrg', () => {
    it('returns org with confidence for valid input', () => {
      // TODO test normalizeOrg implementation
      expect(true).toBe(true);
    });

    it('returns errors for invalid input', () => {
      // TODO test error collection
      expect(true).toBe(true);
    });
  });

  describe('normalizeSignal', () => {
    it('validates and normalizes signals', () => {
      // TODO test normalizeSignal implementation
      expect(true).toBe(true);
    });
  });
});
