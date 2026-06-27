import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
}

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

/**
 * Local development runs against the Firebase Emulator Suite so the console
 * works end-to-end without the production `@grantmaster.nl` domain gate.
 * Toggle with `VITE_USE_EMULATOR=true` in console/.env.
 */
export const usingEmulator =
  import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true'

if (usingEmulator) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9100', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8180)
}
