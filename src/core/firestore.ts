import * as admin from 'firebase-admin';
import { config } from './config.js';

let db: any = null;

// Initialize Firebase Admin SDK if not already initialized
try {
  if (!admin.apps || admin.apps.length === 0) {
    admin.initializeApp({
      projectId: config.gcpProjectId,
    });
  }

  db = admin.firestore();
  db.settings({ ignoreUndefinedProperties: true });
} catch (e) {
  // Firestore not available (e.g., in test scripts without credentials)
  console.warn('[firestore] Not initialized (credentials not available)');
}

// Typed collection references
export const collections = {
  sources: db?.collection('sources'),
  rawSnapshots: db?.collection('rawSnapshots'),
  organizations: db?.collection('organizations'),
  signals: db?.collection('signals'),
  accountScores: db?.collection('accountScores'),
  reviewQueue: db?.collection('reviewQueue'),
  syncLogs: db?.collection('syncLogs'),
} as any;

export default db;
