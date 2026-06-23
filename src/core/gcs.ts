import { Storage } from '@google-cloud/storage';
import { config } from './config.js';

const storage = new Storage({
  projectId: config.gcpProjectId,
});

export const bucket = storage.bucket(config.gcsRawBucket);

export async function storeRawSnapshot(key: string, data: string | Buffer): Promise<void> {
  const file = bucket.file(key);
  await file.save(data);
}

export async function getRawSnapshot(key: string): Promise<Buffer> {
  const file = bucket.file(key);
  const [contents] = await file.download();
  return contents;
}

export default storage;
