import { unzipSync } from 'fflate';
import { nameKey } from '../pipeline/enrich.js';

const ANBI_ZIP_URL =
  process.env.ANBI_REGISTRY_URL || 'https://download.belastingdienst.nl/data/anbi/anbi.zip';

export interface AnbiEntry {
  naam: string;
  rsin?: string; // fiscaalNummer
  website?: string;
  plaats?: string;
}

let cache: Map<string, AnbiEntry> | null = null;

function field(block: string, tag: string): string | undefined {
  const m = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return m ? m[1].trim() : undefined;
}

/**
 * Parse the Belastingdienst ANBI XML into a nameKey -> entry lookup index.
 * Each `<beschikking>` has naam, optional fiscaalNummer (RSIN), webSite,
 * vestigingsPlaats, aliasNaam. Both naam and aliasNaam are indexed.
 */
export function indexAnbiXml(xml: string): Map<string, AnbiEntry> {
  const index = new Map<string, AnbiEntry>();
  for (const m of xml.matchAll(/<beschikking>([\s\S]*?)<\/beschikking>/g)) {
    const block = m[1];
    const naam = field(block, 'naam');
    if (!naam) continue;
    const entry: AnbiEntry = {
      naam,
      rsin: field(block, 'fiscaalNummer'),
      website: field(block, 'webSite'),
      plaats: field(block, 'vestigingsPlaats'),
    };
    for (const candidate of [naam, field(block, 'aliasNaam')]) {
      const key = candidate ? nameKey(candidate) : '';
      if (key && !index.has(key)) index.set(key, entry);
    }
  }
  return index;
}

/** Download + unzip + index the live ANBI register (cached per process). */
export async function loadAnbiRegistry(): Promise<Map<string, AnbiEntry>> {
  if (cache) return cache;
  const res = await fetch(ANBI_ZIP_URL, {
    headers: { 'User-Agent': 'GrantScout/1.0 (grantscout-ingestion)' },
  });
  if (!res.ok) throw new Error(`ANBI registry ${res.status}: ${res.statusText}`);
  const files = unzipSync(new Uint8Array(await res.arrayBuffer()));
  const xmlBytes = files['anbi.xml'];
  if (!xmlBytes) throw new Error('anbi.xml not found in ANBI registry zip');
  // The feed is ISO-8859-1 encoded.
  const xml = Buffer.from(xmlBytes).toString('latin1');
  cache = indexAnbiXml(xml);
  console.log(`[anbi-registry] indexed ${cache.size} name keys`);
  return cache;
}

/** Look up an org in the ANBI register by (normalized) name. */
export async function lookupAnbi(name: string): Promise<AnbiEntry | undefined> {
  const index = await loadAnbiRegistry();
  const key = nameKey(name);
  return key ? index.get(key) : undefined;
}
