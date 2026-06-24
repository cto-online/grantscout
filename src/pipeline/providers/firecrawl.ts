import { readFileSync } from 'fs';
import { config } from '../../core/config.js';
import type { Source } from '../../core/types.js';

const SAMPLE_PATH = 'data/hiring-sample.json';
const FIRECRAWL_SEARCH = 'https://api.firecrawl.dev/v1/search';

interface PostingOut {
  title: string;
  company?: string;
  description: string;
  url?: string;
  postedDate?: string;
}

/**
 * Firecrawl provider: search for grants/fundraising job postings and return
 * them as a JSON buffer (parsed downstream by extractHiringSignals).
 * Falls back to a committed sample when FIRECRAWL_API_KEY is not set.
 */
export async function fetchFirecrawl(source: Source): Promise<Buffer> {
  if (!config.firecrawlApiKey) {
    console.warn(`[firecrawl] FIRECRAWL_API_KEY not set — using sample ${SAMPLE_PATH}`);
    return readFileSync(SAMPLE_PATH);
  }

  const keywords = (source.fetchConfig?.keywords as string[] | undefined) ?? ['fondsenwerver'];
  const postings: PostingOut[] = [];

  for (const kw of keywords) {
    const res = await fetch(FIRECRAWL_SEARCH, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: `${kw} vacature NGO Nederland`, limit: 10 }),
    });
    if (!res.ok) throw new Error(`Firecrawl search ${res.status}: ${res.statusText}`);
    const json = (await res.json()) as {
      data?: { url?: string; title?: string; description?: string; markdown?: string }[];
    };
    for (const r of json.data ?? []) {
      postings.push({
        title: r.title ?? kw,
        description: r.markdown ?? r.description ?? '',
        url: r.url,
      });
    }
  }

  return Buffer.from(JSON.stringify(postings), 'utf-8');
}
