import type { Organization } from '../core/types.js';
import { lookupAnbi } from '../sources/anbiRegistry.js';
import { scrapeDoelstelling } from './missionScraper.js';

function domainOf(url: string): string | undefined {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

export interface AnbiEnrichResult {
  orgs: Organization[];
  enriched: number; // got a mission
  matched: number; // found in the ANBI register
}

/**
 * Demand-driven enrichment: for orgs still missing a mission, look them up in
 * the live ANBI register by name, attach RSIN + website, and scrape the website
 * for a real doelstelling so Fit can be scored for real. Only missionless orgs
 * are looked up / scraped, so cost stays proportional to the set that needs it.
 */
export async function enrichFromAnbiRegistry(
  orgs: Organization[],
): Promise<AnbiEnrichResult> {
  const missionless = orgs.filter((o) => !o.mission);
  if (missionless.length === 0) return { orgs, enriched: 0, matched: 0 };

  let enriched = 0;
  let matched = 0;
  const out: Organization[] = [];

  for (const o of orgs) {
    if (o.mission) {
      out.push(o);
      continue;
    }
    let entry;
    try {
      entry = await lookupAnbi(o.names[0] || '');
    } catch {
      entry = undefined;
    }
    if (!entry) {
      out.push(o);
      continue;
    }
    matched++;

    let mission: string | undefined;
    if (entry.website) {
      try {
        mission = await scrapeDoelstelling(o.names[0], entry.website);
      } catch {
        mission = undefined;
      }
    }
    if (mission) enriched++;

    out.push({
      ...o,
      mission: mission ?? o.mission,
      identifiers: {
        ...o.identifiers,
        rsin: o.identifiers.rsin || entry.rsin,
        anbi: true,
        websiteDomain:
          o.identifiers.websiteDomain ||
          (entry.website ? domainOf(entry.website) : undefined),
      },
      updatedAt: new Date().toISOString(),
    });
  }

  return { orgs: out, enriched, matched };
}
