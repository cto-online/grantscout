import { bucket } from '../../core/gcs.js';
import { readFileSync } from 'fs';

export async function fetchHttp(url: string): Promise<Buffer> {
  // Handle local file:// URLs for testing
  if (url.startsWith('file://')) {
    const path = url.replace('file://', '');
    return readFileSync(path);
  }

  // Handle HTTP(S) URLs
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'GrantScout/1.0 (grantscout-ingestion)',
      'Accept': 'text/tab-separated-values, text/plain, */*',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

export async function storeSnapshot(sourceId: string, data: Buffer): Promise<string> {
  const timestamp = new Date().toISOString();
  const key = `raw/${sourceId}/${timestamp}.bin`;
  const file = bucket.file(key);
  await file.save(data);
  return key;
}
