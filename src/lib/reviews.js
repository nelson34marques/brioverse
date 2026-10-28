// Avaliações (reviews): 1 por utilizador por app, id = `${appId}_${uid}`.
// Lê/escreve no Firestore; sem Firebase configurado, guarda só neste browser (demo).
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  limit,
  setDoc,
  deleteDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase.js'

const LOCAL_KEY = 'brioverse:reviews'
export const MAX_TEXT = 1000

export function reviewId(appId, uid) {
  return `${appId}_${uid}`
}

function toMillis(v) {
  if (!v) return 0
  if (typeof v === 'number') return v
  if (typeof v.toMillis === 'function') return v.toMillis()
  return new Date(v).getTime() || 0
}

function normalize(id, d) {
  return {
    id,
    appId: d.appId,
    userId: d.userId,
    userName: d.userName || '',
    userPhoto: d.userPhoto || '',
    rating: Number(d.rating) || 0,
    text: typeof d.text === 'string' ? d.text : '',
    createdAt: toMillis(d.createdAt) || Date.now(),
    updatedAt: toMillis(d.updatedAt) || toMillis(d.createdAt) || Date.now(),
  }
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout após ${ms}ms`)), ms)
    promise.then(
      (v) => (clearTimeout(timer), resolve(v)),
      (e) => (clearTimeout(timer), reject(e)),
    )
  })
}

/* ---------- fallback local (sem Firebase) ---------- */
function localAll() {
  try {
    const v = JSON.parse(localStorage.getItem(LOCAL_KEY))
    return v && typeof v === 'object' ? v : {}
  } catch {
    return {}
  }
}

function localWrite(all) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}

/* ---------- API ---------- */

export function authorFromUser(user) {
  return {
    userName: user.displayName || user.email?.split('@')[0] || 'Utilizador',
    userPhoto: user.photoURL || '',
  }
}

/** Avaliações de um app, mais recentes primeiro. */
export async function listReviews(appId) {
  if (!isFirebaseConfigured) {
    return Object.entries(localAll())
      .map(([id, d]) => normalize(id, d))
      .filter((r) => r.appId === appId)
      .sort((a, b) => b.createdAt - a.createdAt)
  }
  // Só `where` (sem orderBy) para não exigir índice composto; ordena no cliente.
  const q = query(collection(db, 'reviews'), where('appId', '==', appId), limit(100))
  const snap = await withTimeout(getDocs(q), 6000)
  return snap.docs.map((d) => normalize(d.id, d.data())).sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * Cria ou actualiza a avaliação do utilizador. Depois tenta actualizar
 * `apps/{id}.stats` por transacção (best-effort: falha silenciosa se o app
 * não existir no Firestore).
 */
export async function saveReview({ app, user, rating, text, previous }) {
  const id = reviewId(app.id, user.uid)
  const clean = {
    appId: app.id,
    userId: user.uid,
    ...authorFromUser(user),
    rating: Math.max(1, Math.min(5, Math.round(rating))),
    text: String(text || '')
      .trim()
      .slice(0, MAX_TEXT),
  }

  if (!isFirebaseConfigured) {
    const all = localAll()
    const now = Date.now()
    all[id] = { ...clean, createdAt: all[id]?.createdAt ?? now, updatedAt: now }
    localWrite(all)
    return normalize(id, all[id])
  }

  const ref = doc(db, 'reviews', id)
  await setDoc(ref, {
    ...clean,
    createdAt: previous ? previous.createdAt : serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  await bumpStats(app.id, previous ? previous.rating : null, clean.rating)
  return normalize(id, { ...clean, createdAt: previous?.createdAt ?? Date.now(), updatedAt: Date.now() })
}

export async function deleteReview({ app, user, previous }) {
  const id = reviewId(app.id, user.uid)
  if (!isFirebaseConfigured) {
    const all = localAll()
    delete all[id]
    localWrite(all)
    return
  }
  await deleteDoc(doc(db, 'reviews', id))
  await bumpStats(app.id, previous?.rating ?? null, null)
}

/** Ajusta ratingCount/ratingSum/ratingAvg do app de forma incremental. */
async function bumpStats(appId, oldRating, newRating) {
  const appRef = doc(db, 'apps', appId)
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(appRef)
      if (!snap.exists()) return
      const s = snap.data().stats ?? {}
      const count0 = Number(s.ratingCount) || 0
      const sum0 = Number.isFinite(s.ratingSum) ? s.ratingSum : (Number(s.ratingAvg) || 0) * count0
      const count = Math.max(0, count0 + (oldRating == null ? 1 : 0) - (newRating == null ? 1 : 0))
      const sum = Math.max(0, sum0 - (oldRating ?? 0) + (newRating ?? 0))
      tx.update(appRef, {
        'stats.ratingCount': count,
        'stats.ratingSum': sum,
        'stats.ratingAvg': count ? Math.round((sum / count) * 100) / 100 : 0,
      })
    })
  } catch (err) {
    console.warn('[brioverse] stats do app não actualizadas:', err?.code || err?.message)
  }
}

/** Média, total e distribuição [5,4,3,2,1] a partir de uma lista de reviews. */
export function summarize(reviews) {
  const dist = [0, 0, 0, 0, 0]
  let sum = 0
  for (const r of reviews) {
    const s = Math.max(1, Math.min(5, Math.round(r.rating)))
    dist[5 - s] += 1
    sum += s
  }
  const count = reviews.length
  return { avg: count ? sum / count : 0, count, distribution: dist }
}
