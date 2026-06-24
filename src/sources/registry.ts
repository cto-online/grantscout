import type { Source } from '../core/types.js';

export const SOURCES: Source[] = [
  {
    id: 'anbi-nl',
    name: 'ANBI register (Belastingdienst, NL)',
    country: 'NL',
    acquisitionTier: 'feed',
    extractionMethod: 'deterministic',
    provider: 'http',
    signalTypes: ['registry_listed'],
    schedule: '0 3 * * 1',          // weekly Monday 03:00
    enabled: true,
    license: 'open data',
    fetchConfig: {
      // TODO: Find correct ANBI download URL from Belastingdienst
      // Current endpoint returns HTML instead of TSV
      // For now, using local test file
      url: 'file://data/anbi-sample.tsv',
      format: 'tsv',
    },
  },
  {
    id: 'grantatlas-awardees',
    name: 'GrantAtlas awardee / applicant lists',
    country: 'NL',
    acquisitionTier: 'internal',
    extractionMethod: 'deterministic',
    provider: 'grantatlas',
    signalTypes: ['grant_awarded', 'grant_applied'],
    schedule: '0 4 * * *',          // daily 04:00
    enabled: true,
  },
  {
    id: 'hiring-nl',
    name: 'NL job postings (grants/fundraising roles)',
    country: 'NL',
    acquisitionTier: 'scrape',
    extractionMethod: 'llm',
    provider: 'firecrawl',
    signalTypes: ['hiring_grants_role'],
    schedule: '0 5 * * *',
    enabled: false,                 // enable after ANBI + awardees proven
    fetchConfig: { keywords: ['subsidieadviseur', 'fondsenwerver', 'grants manager'] },
  },
];
