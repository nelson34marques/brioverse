// Acesso a dados. Lê apps aprovados do Firestore (cache local primeiro, depois servidor).
// Sem Firebase configurado a loja fica vazia (não há dados de demonstração).
import { collection, getDocs, getDocsFromCache, query, where, doc, getDoc } from 'firebase/firestore'
import { directImageUrl } from './images.js'
import { db, isFirebaseConfigured } from './firebase.js'
import { comparators, rankContext } from './ranking.js'

let cache = null
let inflight = null
let source = 'none' // 'firestore' | 'none'
let failed = false // a última leitura ao servidor falhou (rede lenta/sem ligação)
const listeners = new Set()

// Redes móveis lentas demoram bem mais de 4 s na primeira ligação ao Firestore;
// um limite curto fazia a loja aparecer vazia.
const SERVER_TIMEOUT = 20000

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout após ${ms}ms`)), ms)
    promise.then(
      (v) => {
        clearTimeout(timer)
        resolve(v)
      },
      (e) => {
        clearTimeout(timer)
        reject(e)
      },
    )
  })
}

function notify() {
  for (const fn of listeners) fn(cache)
}

function toMillis(v) {
  if (!v) return 0
  if (typeof v === 'number') return v
  if (typeof v.toMillis === 'function') return v.toMillis()
  return new Date(v).getTime() || 0
}

// só http(s): um link javascript: ou data: num href nunca chega ao DOM
const webUrl = (s) => (typeof s === 'string' && /^https?:\/\/\S+$/i.test(s.trim()) ? s.trim() : null)
const imageUrl = (s) => webUrl(directImageUrl(s))

export function normalizeApp(id, d) {
  return {
    id,
    ...d,
    appUrl: webUrl(d.appUrl),
    apkUrl: webUrl(d.apkUrl),
    webUrl: webUrl(d.webUrl),
    desktopUrl: webUrl(d.desktopUrl),
    title: d.title || d.name || id,
    slug: d.slug || id,
    category: d.category || 'other',
    type: d.type === 'apk' ? 'apk' : 'pwa',
    developerName: d.developerName || '',
    shortDescription: d.shortDescription || '',
    iconUrl: imageUrl(d.iconUrl),
    screenshots: Array.isArray(d.screenshots) ? d.screenshots.map(imageUrl).filter(Boolean) : [],
    keywords: Array.isArray(d.keywords) ? d.keywords : [],
    status: d.status || 'approved',
    verified: Boolean(d.verified),
    featured: Boolean(d.featured),
    // impulso dado pelo admin (0..3), soma ao score do ranking
    boost: Math.min(3, Math.max(0, Number(d.boost) || 0)),
    disabledReason: d.disabledReason || '',
    // versão visível + contador interno (sobe a cada release; quem tem o app é avisado quando sobe)
    version: d.version || d.apkVersion || '1.0',
    versionCode: Math.max(1, Number(d.versionCode) || 1),
    changelog: typeof d.changelog === 'string' ? d.changelog : '',
    releases: Array.isArray(d.releases) ? d.releases.map((r) => ({ version: r?.version || '', notes: r?.notes || '', at: toMillis(r?.at) })) : [],
    releasedAt: toMillis(d.releasedAt) || toMillis(d.updatedAt ?? d.createdAt),
    stats: { views: 0, clicks: 0, ratingAvg: 0, ratingCount: 0, ...(d.stats ?? {}) },
    createdAt: toMillis(d.createdAt),
    updatedAt: toMillis(d.updatedAt ?? d.createdAt),
  }
}

export function dataSource() {
  return source
}

/** Lista já carregada (ou null antes da primeira leitura). */
export function cachedApps() {
  return cache
}

/** A última leitura ao servidor falhou e não há nada guardado. */
export function loadFailed() {
  return failed && !cache
}

/** Avisa quando a lista muda (ex.: cache local substituída pelo servidor). */
export function subscribeApps(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

const approvedQuery = () => query(collection(db, 'apps'), where('status', '==', 'approved'))

async function fetchFromServer() {
  const snap = await withTimeout(getDocs(approvedQuery()), SERVER_TIMEOUT)
  cache = snap.docs.map((d) => normalizeApp(d.id, d.data()))
  source = 'firestore'
  failed = false
  notify()
  return cache
}

/**
 * Carrega todos os apps aprovados. Primeiro a cache local (instantâneo), depois o servidor.
 * Uma falha não fica guardada: a próxima chamada (ou `force`) volta a tentar.
 */
export async function loadApps({ force = false } = {}) {
  if (cache && !force) return cache
  if (inflight) return inflight

  inflight = (async () => {
    if (!isFirebaseConfigured) {
      cache = []
      source = 'none'
      return cache
    }

    // 1) o que o telefone guardou da última visita: mostra já e actualiza por trás
    if (!cache) {
      try {
        const local = await getDocsFromCache(approvedQuery())
        if (!local.empty) {
          cache = local.docs.map((d) => normalizeApp(d.id, d.data()))
          source = 'firestore'
          notify()
          fetchFromServer().catch((err) => console.warn('[brioverse] sem actualização do servidor:', err?.message))
          return cache
        }
      } catch {
        // sem cache local (primeira visita ou sem IndexedDB)
      }
    }

    // 2) servidor
    try {
      return await fetchFromServer()
    } catch (err) {
      console.warn('[brioverse] Firestore indisponível:', err?.message)
      failed = true
      return cache ?? []
    }
  })().finally(() => {
    inflight = null
  })

  return inflight
}

export async function getApp(id) {
  const apps = await loadApps()
  const found = apps.find((a) => a.id === id || a.slug === id)
  if (found) return found
  if (!isFirebaseConfigured) return null
  try {
    const snap = await withTimeout(getDoc(doc(db, 'apps', id)), SERVER_TIMEOUT)
    return snap.exists() && snap.data().status === 'approved' ? normalizeApp(snap.id, snap.data()) : null
  } catch {
    return null
  }
}

/** Filtra/ordena em memória. */
export function selectApps(apps, { type, category, excludeCategory, q, sort = 'trending', limit, exclude } = {}) {
  let out = apps
  if (type) out = out.filter((a) => a.type === type)
  if (category) out = out.filter((a) => a.category === category)
  if (excludeCategory) out = out.filter((a) => a.category !== excludeCategory)
  if (exclude) out = out.filter((a) => a.id !== exclude)
  if (q) {
    const needle = q.trim().toLowerCase()
    if (needle) {
      const has = (s) => typeof s === 'string' && s.toLowerCase().includes(needle)
      out = out.filter(
        (a) => has(a.title) || has(a.developerName) || has(a.shortDescription) || (a.keywords ?? []).some(has),
      )
    }
  }
  // O contexto (app mais visto) é calculado sobre TODO o catálogo, não só o filtrado,
  // para a popularidade ser comparável entre páginas.
  const sorters = comparators(rankContext(apps))
  out = [...out].sort(sorters[sort] ?? sorters.trending)
  if (limit) out = out.slice(0, limit)
  return out
}
