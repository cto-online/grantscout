import { bucket } from '../../core/gcs.js';

export async function fetchHttp(url: string): Promise<Buffer> {
  const response = await fetch(url);
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
