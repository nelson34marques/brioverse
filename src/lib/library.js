// Biblioteca do cliente: os apps que a pessoa abriu ou baixou (como "instalados" na Play Store).
// Serve para avisar quando um app da biblioteca tem versão nova (versionCode maior que o visto).
// Com sessão: users/{uid}/library/{appId}. Sem sessão ou sem Firebase: localStorage.
import { collection, doc, documentId, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase.js'
import { normalizeApp } from './db.js'
import { localApps } from './publish.js'

export const LOCAL_LIBRARY_KEY = 'brioverse:library'

function toMillis(v) {
  if (!v) return 0
  if (typeof v === 'number') return v
  if (typeof v.toMillis === 'function') return v.toMillis()
  return new Date(v).getTime() || 0
}

function normalizeEntry(appId, d = {}) {
  return {
    appId,
    title: d.title || '',
    version: d.version || '',
    versionCode: Number(d.versionCode) || 1,
    // última versão que a pessoa viu/abriu; versionCode do app > seenCode ⇒ actualização por ver
    seenCode: Number(d.seenCode) || Number(d.versionCode) || 1,
    addedAt: toMillis(d.addedAt),
  }
}

/* ---------- local ---------- */

export function readLocalLibrary() {
  try {
    const list = JSON.parse(localStorage.getItem(LOCAL_LIBRARY_KEY)) || []
    return list.map((e) => normalizeEntry(e.appId, e))
  } catch {
    return []
  }
}

function writeLocalLibrary(list) {
  try {
    localStorage.setItem(LOCAL_LIBRARY_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

export function clearLocalLibrary() {
  writeLocalLibrary([])
}

function upsertLocal(entry) {
  const list = readLocalLibrary().filter((e) => e.appId !== entry.appId)
  list.unshift(entry)
  writeLocalLibrary(list)
  return list
}

/* ---------- API ---------- */

const remoteFor = (user) => isFirebaseConfigured && Boolean(user)

export async function listLibrary(user) {
  if (!remoteFor(user)) return readLocalLibrary()
  const snap = await getDocs(collection(db, 'users', user.uid, 'library'))
  return snap.docs.map((d) => normalizeEntry(d.id, d.data())).sort((a, b) => b.addedAt - a.addedAt)
}

/** Regista que a pessoa abriu/baixou o app na versão actual (também "actualiza" se já o tinha). */
export async function addToLibrary(user, app) {
  const entry = normalizeEntry(app.id, {
    title: app.title,
    version: app.version,
    versionCode: app.versionCode,
    seenCode: app.versionCode,
    addedAt: Date.now(),
  })
  if (!remoteFor(user)) {
    upsertLocal(entry)
    return entry
  }
  await setDoc(
    doc(db, 'users', user.uid, 'library', app.id),
    { title: entry.title, version: entry.version, versionCode: entry.versionCode, seenCode: entry.seenCode, addedAt: serverTimestamp() },
    { merge: true },
  )
  return entry
}

/** Marca a versão actual do app como vista (tira o aviso). */
export async function markSeen(user, appId, versionCode) {
  if (!remoteFor(user)) {
    const list = readLocalLibrary().map((e) => (e.appId === appId ? { ...e, seenCode: versionCode } : e))
    writeLocalLibrary(list)
    return
  }
  await updateDoc(doc(db, 'users', user.uid, 'library', appId), { seenCode: versionCode })
}

/** Dados actuais dos apps da biblioteca (só aprovados; os pausados/eliminados desaparecem). */
export async function fetchLibraryApps(ids) {
  if (!ids.length) return []
  if (!isFirebaseConfigured) {
    return localApps().filter((a) => ids.includes(a.id) && a.status === 'approved')
  }
  const out = []
  for (let i = 0; i < ids.length; i += 10) {
    const chunk = ids.slice(i, i + 10)
    const snap = await getDocs(query(collection(db, 'apps'), where(documentId(), 'in', chunk), where('status', '==', 'approved')))
    snap.forEach((d) => out.push(normalizeApp(d.id, d.data())))
  }
  return out
}
