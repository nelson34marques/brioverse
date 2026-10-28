// Firebase: só Auth + Firestore. Sem Storage (ver docs/PLANO.md).
// Só inicializa quando as variáveis VITE_FIREBASE_* existem, para a app
// arrancar em modo "vitrine" mesmo sem .env.local.
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId)

let app = null
let auth = null
let db = null
let googleProvider = null

if (isFirebaseConfigured) {
  app = getApps().length ? getApps()[0] : initializeApp(config)
  auth = getAuth(app)
  db = getFirestore(app)
  googleProvider = new GoogleAuthProvider()
}

export { app, auth, db, googleProvider }

export function requireFirebase() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase não configurado. Copia .env.example para .env.local e preenche as chaves.')
  }
}
