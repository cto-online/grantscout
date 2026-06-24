/**
 * GrantAtlas is a forward-looking funding-opportunity catalog (not awardees).
 * A `Grant` is an opportunity: title, funder, funding range, application window,
 * eligibility, lifecycle status.
 */

/** Raw GrantAtlas Grant object (the subset we consume from GET /api/grants). */
export interface RawGrant {
  canonicalId: string;
  externalId?: string;
  sourceId?: string;
  title?: { source?: string; normalized?: string };
  description?: string;
  funderId: string;
  funderName?: string;
  funding?: { min?: number; max?: number; currency?: string };
  dates?: { open?: string; close?: string; rolling?: boolean };
  eligibility?: {
    geographicScope?: string[];
    sectors?: string[];
    organizationTypes?: string[];
    other?: unknown;
  };
  grantType?: string;
  tags?: string[];
  ngoEligible?: boolean;
  status?: string;
  grantorType?: string;
  provenance?: { sourceUrl?: string };
  updatedAt?: string;
}

/** GrantScout's projection of a GrantAtlas opportunity. */
export interface GrantOpportunity {
  id: string;
  externalId?: string;
  sourceId?: string;
  title: string;
  description?: string;
  funderId: string;
  funderName?: string;
  funderCountry?: string;
  fundingMin?: number;
  fundingMax?: number;
  currency?: string;
  dateOpen?: string;
  dateClose?: string;
  rolling?: boolean;
  geographicScope?: string[];
  sectors?: string[];
  organizationTypes?: string[];
  grantType?: string;
  tags?: string[];
  ngoEligible?: boolean;
  status: string; // active | upcoming | closed | archived
  grantorType?: string;
  sourceUrl?: string;
  updatedAt?: string;
}

/** Pure: project a raw GrantAtlas grant into a GrantOpportunity. */
export function projectGrant(raw: RawGrant): GrantOpportunity {
  return {
    id: raw.canonicalId,
    externalId: raw.externalId,
    sourceId: raw.sourceId,
    title: raw.title?.normalized || raw.title?.source || '(untitled)',
    description: raw.description,
    funderId: raw.funderId,
    funderName: raw.funderName,
    fundingMin: raw.funding?.min,
    fundingMax: raw.funding?.max,
    currency: raw.funding?.currency,
    dateOpen: raw.dates?.open,
    dateClose: raw.dates?.close,
    rolling: raw.dates?.rolling,
    geographicScope: raw.eligibility?.geographicScope,
    sectors: raw.eligibility?.sectors,
    organizationTypes: raw.eligibility?.organizationTypes,
    grantType: raw.grantType,
    tags: raw.tags,
    ngoEligible: raw.ngoEligible,
    status: raw.status || 'active',
    grantorType: raw.grantorType,
    sourceUrl: raw.provenance?.sourceUrl,
    updatedAt: raw.updatedAt,
  };
}
