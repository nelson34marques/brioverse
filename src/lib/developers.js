// Conta de desenvolvedor: candidatura em developers/{uid}, apps do criador e avisos.
// Sem Firebase configurado, a candidatura e os avisos ficam só neste browser (demo).
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase.js'
import { normalizeApp } from './db.js'
import { localApps } from './publish.js'

const LOCAL_KEY = 'brioverse:developer'
const LOCAL_NOTIF_KEY = 'brioverse:notifications'

export const DEV_KINDS = ['individual', 'company']
export const DEV_STATUS = ['pending', 'approved', 'rejected', 'revoked']
export const LIMITS = {
  name: 80,
  descriptionMin: 80,
  descriptionMax: 1000,
  url: 300,
  email: 120,
  note: 500,
}

function toMillis(v) {
  if (!v) return 0
  if (typeof v === 'number') return v
  if (typeof v.toMillis === 'function') return v.toMillis()
  return new Date(v).getTime() || 0
}

export function normalizeDeveloper(uid, d = {}) {
  return {
    uid,
    kind: d.kind === 'company' ? 'company' : 'individual',
    name: d.name || '',
    legalName: d.legalName || '',
    registration: d.registration || '',
    description: d.description || '',
    website: d.website || '',
    repo: d.repo || '',
    sampleUrl: d.sampleUrl || '',
    contactEmail: d.contactEmail || '',
    userName: d.userName || '',
    userEmail: d.userEmail || '',
    status: DEV_STATUS.includes(d.status) ? d.status : 'pending',
    verified: Boolean(d.verified),
    note: typeof d.note === 'string' ? d.note : '',
    createdAt: toMillis(d.createdAt),
    updatedAt: toMillis(d.updatedAt),
    reviewedAt: toMillis(d.reviewedAt),
  }
}

const isUrl = (s) => /^https?:\/\/[^\s/]+\.[^\s]+$/i.test((s || '').trim())
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || '').trim())

/** Validação do formulário de candidatura. Devolve { campo: chave i18n }. */
export function validateApplication(f) {
  const errors = {}
  if (!DEV_KINDS.includes(f.kind)) errors.kind = 'dev.err_required'
  if ((f.name || '').trim().length < 2) errors.name = 'dev.err_required'
  if (f.kind === 'company' && (f.legalName || '').trim().length < 2) errors.legalName = 'dev.err_required'
  if ((f.description || '').trim().length < LIMITS.descriptionMin) errors.description = 'dev.err_short'
  if (!isUrl(f.website)) errors.website = 'dev.err_url'
  if ((f.repo || '').trim() && !isUrl(f.repo)) errors.repo = 'dev.err_url'
  if (!isUrl(f.sampleUrl)) errors.sampleUrl = 'dev.err_url'
  if (!isEmail(f.contactEmail)) errors.contactEmail = 'dev.err_email'
  if (!f.accept) errors.accept = 'dev.err_accept'
  return errors
}

/* ---------- fallback local (sem Firebase) ---------- */

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

/** Candidatura guardada neste browser (modo demo). Usado também pelo painel admin. */
export function localDeveloper() {
  const d = readJson(LOCAL_KEY, null)
  return d && d.uid ? normalizeDeveloper(d.uid, d) : null
}

export function updateLocalDeveloper(patch) {
  const d = readJson(LOCAL_KEY, null)
  if (!d) return null
  const next = { ...d, ...patch, updatedAt: Date.now() }
  writeJson(LOCAL_KEY, next)
  return normalizeDeveloper(next.uid, next)
}

/* ---------- candidatura ---------- */

export async function getDeveloper(uid) {
  if (!uid) return null
  if (!isFirebaseConfigured) {
    const d = localDeveloper()
    return d && d.uid === uid ? d : null
  }
  const snap = await getDoc(doc(db, 'developers', uid))
  return snap.exists() ? normalizeDeveloper(uid, snap.data()) : null
}

/** Cria ou actualiza a candidatura do utilizador. Uma candidatura recusada volta a "pending". */
export async function saveApplication(user, form, existing = null) {
  const company = form.kind === 'company'
  const data = {
    kind: company ? 'company' : 'individual',
    name: form.name.trim().slice(0, LIMITS.name),
    legalName: company ? form.legalName.trim().slice(0, LIMITS.name) : '',
    registration: company ? (form.registration || '').trim().slice(0, LIMITS.name) : '',
    description: form.description.trim().slice(0, LIMITS.descriptionMax),
    website: form.website.trim().slice(0, LIMITS.url),
    repo: (form.repo || '').trim().slice(0, LIMITS.url),
    sampleUrl: form.sampleUrl.trim().slice(0, LIMITS.url),
    contactEmail: form.contactEmail.trim().slice(0, LIMITS.email),
    userName: user.displayName || '',
    userEmail: user.email || '',
  }
  const status = existing ? (existing.status === 'rejected' ? 'pending' : existing.status) : 'pending'

  if (!isFirebaseConfigured) {
    const now = Date.now()
    const prev = readJson(LOCAL_KEY, null) || {}
    const next = {
      ...prev,
      ...data,
      uid: user.uid,
      status,
      verified: Boolean(prev.verified),
      note: prev.note || '',
      createdAt: prev.createdAt || now,
      updatedAt: now,
    }
    writeJson(LOCAL_KEY, next)
    return normalizeDeveloper(user.uid, next)
  }

  const ref = doc(db, 'developers', user.uid)
  if (existing) {
    await updateDoc(ref, { ...data, status, updatedAt: serverTimestamp() })
  } else {
    await setDoc(ref, {
      ...data,
      uid: user.uid,
      status: 'pending',
      verified: false,
      note: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
  return getDeveloper(user.uid)
}

/** Apps do criador, em qualquer estado (pending/approved/disabled/rejected). */
export async function listMyApps(uid) {
  if (!uid) return []
  if (!isFirebaseConfigured) return localApps().filter((a) => a.developerId === uid)
  const snap = await getDocs(query(collection(db, 'apps'), where('developerId', '==', uid)))
  return snap.docs
    .map((d) => normalizeApp(d.id, d.data()))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
}

/* ---------- avisos (notifications/{id}) ---------- */

function normalizeNotification(id, d) {
  return {
    id,
    uid: d.uid,
    type: d.type || 'info',
    appId: d.appId || '',
    appTitle: d.appTitle || '',
    reason: d.reason || '',
    read: Boolean(d.read),
    createdAt: toMillis(d.createdAt) || Date.now(),
  }
}

export async function listNotifications(uid) {
  if (!uid) return []
  let list
  if (!isFirebaseConfigured) {
    list = readJson(LOCAL_NOTIF_KEY, [])
      .filter((n) => n.uid === uid)
      .map((n) => normalizeNotification(n.id, n))
  } else {
    const snap = await getDocs(query(collection(db, 'notifications'), where('uid', '==', uid)))
    list = snap.docs.map((d) => normalizeNotification(d.id, d.data()))
  }
  return list.sort((a, b) => b.createdAt - a.createdAt)
}

export async function markNotificationRead(id) {
  if (!isFirebaseConfigured) {
    const list = readJson(LOCAL_NOTIF_KEY, []).map((n) => (n.id === id ? { ...n, read: true } : n))
    writeJson(LOCAL_NOTIF_KEY, list)
    return
  }
  await updateDoc(doc(db, 'notifications', id), { read: true })
}

/** Cria um aviso para um utilizador (só o admin tem permissão no Firestore). */
export async function pushNotification(n) {
  if (!isFirebaseConfigured) {
    const list = readJson(LOCAL_NOTIF_KEY, [])
    list.push({ ...n, id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, read: false, createdAt: Date.now() })
    writeJson(LOCAL_NOTIF_KEY, list)
    return
  }
  await addDoc(collection(db, 'notifications'), { ...n, read: false, createdAt: serverTimestamp() })
}
