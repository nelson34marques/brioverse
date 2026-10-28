// Acções de administração (role 'admin', ver firestore.rules).
// Sem Firebase, as listas vêm dos dados mock/locais e as acções só alteram o estado em memória (demo).
import { collection, doc, getDocs, query, where, writeBatch, serverTimestamp } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase.js'
import { localApps } from './publish.js'
import { normalizeApp } from './db.js'
import { normalizeDeveloper, localDeveloper, updateLocalDeveloper, pushNotification } from './developers.js'

export const MAX_BOOST = 3

export async function listAllApps() {
  if (!isFirebaseConfigured) return localApps()
  const snap = await getDocs(collection(db, 'apps'))
  return snap.docs.map((d) => normalizeApp(d.id, d.data()))
}

export async function listDevelopers() {
  if (!isFirebaseConfigured) {
    const d = localDeveloper()
    return d ? [d] : []
  }
  const snap = await getDocs(collection(db, 'developers'))
  return snap.docs.map((d) => normalizeDeveloper(d.id, d.data()))
}

function addNotification(batch, n) {
  batch.set(doc(collection(db, 'notifications')), { ...n, read: false, createdAt: serverTimestamp() })
}

/** Executa `fn(batch)` no Firestore; sem Firebase, só regista o aviso localmente. */
async function commit(fn, notification) {
  if (!isFirebaseConfigured) {
    if (notification) await pushNotification(notification)
    return
  }
  const batch = writeBatch(db)
  fn(batch)
  if (notification) addNotification(batch, notification)
  await batch.commit()
}

/* ---------- apps ---------- */

export async function disableApp(app, reason, by) {
  const n = { uid: app.developerId, type: 'app_disabled', appId: app.id, appTitle: app.title, reason, by }
  await commit((b) => {
    b.update(doc(db, 'apps', app.id), {
      status: 'disabled',
      disabledReason: reason,
      disabledAt: serverTimestamp(),
      disabledBy: by,
    })
  }, n)
  return { ...app, status: 'disabled', disabledReason: reason }
}

export async function enableApp(app, by) {
  const n = { uid: app.developerId, type: 'app_enabled', appId: app.id, appTitle: app.title, reason: '', by }
  await commit((b) => {
    b.update(doc(db, 'apps', app.id), { status: 'approved', disabledReason: '' })
  }, n)
  return { ...app, status: 'approved', disabledReason: '' }
}

export async function approveApp(app, by, verified = false) {
  const n = { uid: app.developerId, type: 'app_approved', appId: app.id, appTitle: app.title, reason: '', by }
  await commit((b) => {
    b.update(doc(db, 'apps', app.id), { status: 'approved', verified, approvedAt: serverTimestamp() })
  }, n)
  return { ...app, status: 'approved', verified }
}

export async function setFeatured(app, featured) {
  await commit((b) => {
    b.update(doc(db, 'apps', app.id), { featured: Boolean(featured) })
  })
  return { ...app, featured: Boolean(featured) }
}

export async function setBoost(app, level) {
  const boost = Math.min(MAX_BOOST, Math.max(0, Math.round(Number(level) || 0)))
  await commit((b) => {
    b.update(doc(db, 'apps', app.id), { boost })
  })
  return { ...app, boost }
}

/* ---------- desenvolvedores ---------- */

function patchDev(batch, dev, patch) {
  batch.update(doc(db, 'developers', dev.uid), { ...patch, reviewedAt: serverTimestamp() })
}

/** Aprova ou recusa uma candidatura. Aprovar dá o role 'developer'. */
export async function reviewApplication(dev, decision, note, by) {
  const approved = decision === 'approved'
  const n = { uid: dev.uid, type: approved ? 'dev_approved' : 'dev_rejected', reason: note, by }
  await commit((b) => {
    patchDev(b, dev, { status: decision, note, reviewedBy: by })
    if (approved) b.update(doc(db, 'users', dev.uid), { role: 'developer' })
  }, n)
  if (!isFirebaseConfigured) updateLocalDeveloper({ status: decision, note, reviewedAt: Date.now() })
  return { ...dev, status: decision, note, reviewedAt: Date.now() }
}

export async function revokeDeveloper(dev, note, by) {
  const n = { uid: dev.uid, type: 'dev_revoked', reason: note, by }
  await commit((b) => {
    patchDev(b, dev, { status: 'revoked', note, reviewedBy: by })
    b.update(doc(db, 'users', dev.uid), { role: 'consumer' })
  }, n)
  if (!isFirebaseConfigured) updateLocalDeveloper({ status: 'revoked', note, reviewedAt: Date.now() })
  return { ...dev, status: 'revoked', note, reviewedAt: Date.now() }
}

export async function restoreDeveloper(dev, by) {
  const n = { uid: dev.uid, type: 'dev_restored', reason: '', by }
  await commit((b) => {
    patchDev(b, dev, { status: 'approved', note: '', reviewedBy: by })
    b.update(doc(db, 'users', dev.uid), { role: 'developer' })
  }, n)
  if (!isFirebaseConfigured) updateLocalDeveloper({ status: 'approved', note: '', reviewedAt: Date.now() })
  return { ...dev, status: 'approved', note: '', reviewedAt: Date.now() }
}

/** Selo "Verificado": no criador e, por desnormalização, em todos os apps dele. */
export async function setDeveloperVerified(dev, verified, by) {
  const n = { uid: dev.uid, type: verified ? 'dev_verified' : 'dev_unverified', reason: '', by }
  let appRefs = []
  if (isFirebaseConfigured) {
    const snap = await getDocs(query(collection(db, 'apps'), where('developerId', '==', dev.uid)))
    appRefs = snap.docs.map((d) => d.ref)
  }
  await commit((b) => {
    b.update(doc(db, 'developers', dev.uid), { verified: Boolean(verified) })
    appRefs.forEach((ref) => b.update(ref, { verified: Boolean(verified) }))
  }, n)
  if (!isFirebaseConfigured) updateLocalDeveloper({ verified: Boolean(verified) })
  return { ...dev, verified: Boolean(verified) }
}
