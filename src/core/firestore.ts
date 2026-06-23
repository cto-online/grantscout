import * as admin from 'firebase-admin';
import { config } from './config.js';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: config.gcpProjectId,
  });
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

// Typed collection references
export const collections = {
  sources: db.collection('sources'),
  rawSnapshots: db.collection('rawSnapshots'),
  organizations: db.collection('organizations'),
  signals: db.collection('signals'),
  accountScores: db.collection('accountScores'),
  reviewQueue: db.collection('reviewQueue'),
  syncLogs: db.collection('syncLogs'),
};

export default db;
