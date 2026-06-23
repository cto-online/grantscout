import { describe, it, expect } from 'vitest';
import { needsReview, reviewPriorityFor } from '../src/scoring/persist.js';
import type { Organization } from '../src/core/types.js';

function org(overrides: Partial<Organization>): Organization {
  return {
    canonicalId: 'org-1',
    names: ['Test Org'],
    type: 'ngo',
    country: 'NL',
    identifiers: {},
    provenance: [],
    confidence: { overall: 1 },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('reviewPriorityFor', () => {
  it('is high below 0.4 confidence, medium otherwise', () => {
    expect(reviewPriorityFor(0.2)).toBe('high');
    expect(reviewPriorityFor(0.39)).toBe('high');
    expect(reviewPriorityFor(0.4)).toBe('medium');
    expect(reviewPriorityFor(0.55)).toBe('medium');
  });
});

describe('needsReview', () => {
  it('flags low-confidence orgs', () => {
    expect(needsReview(org({ confidence: { overall: 0.5 } }))).toBe(true);
  });
  it('does not flag high-confidence orgs', () => {
    expect(needsReview(org({ confidence: { overall: 0.9 } }))).toBe(false);
  });
  it('never flags opted-out orgs', () => {
    expect(needsReview(org({ confidence: { overall: 0.1 }, optedOut: true }))).toBe(false);
  });
});
