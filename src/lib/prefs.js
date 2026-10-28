// Preferências do utilizador (dispositivos e gostos) definidas no onboarding.
// Guardadas em localStorage; se houver sessão, também em users/{uid}.prefs.
import { doc, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase.js'
import { DEVICES } from './device.js'

const KEY = 'brioverse:prefs'

export const DEFAULT_PREFS = { onboarded: false, devices: [], interests: [], updatedAt: 0 }

function clean(p) {
  if (!p || typeof p !== 'object') return { ...DEFAULT_PREFS }
  return {
    onboarded: Boolean(p.onboarded),
    devices: Array.isArray(p.devices) ? p.devices.filter((d) => DEVICES.includes(d)) : [],
    interests: Array.isArray(p.interests) ? p.interests.filter((s) => typeof s === 'string') : [],
    updatedAt: Number(p.updatedAt) || 0,
  }
}

export function readPrefs() {
  try {
    return clean(JSON.parse(localStorage.getItem(KEY)))
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

export function writePrefs(prefs) {
  const p = clean(prefs)
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* modo privado ou storage bloqueado: fica só em memória */
  }
  return p
}

export function cleanPrefs(p) {
  return clean(p)
}

/** Best-effort: nunca bloqueia a UI nem lança. */
export async function syncPrefsToCloud(uid, prefs) {
  if (!isFirebaseConfigured || !uid) return
  try {
    await setDoc(doc(db, 'users', uid), { prefs: clean(prefs) }, { merge: true })
  } catch (err) {
    console.warn('[brioverse] não foi possível guardar prefs em users/{uid}:', err?.code || err?.message)
  }
}
