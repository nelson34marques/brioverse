// Contadores reais: visualizações (abrir a página do app) e cliques (Abrir/Baixar).
// Best-effort: nunca bloqueia a UI; sem Firebase (loja local), não faz nada.
// Uma visualização por app por sessão do browser (sessionStorage).
import { doc, updateDoc, increment } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase.js'
import { dataSource } from './db.js'

const SEEN_KEY = 'brioverse:seen'

function seen() {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(SEEN_KEY)) || [])
  } catch {
    return new Set()
  }
}

async function bump(appId, field) {
  if (!isFirebaseConfigured || dataSource() !== 'firestore') return
  try {
    await updateDoc(doc(db, 'apps', appId), { [`stats.${field}`]: increment(1) })
  } catch (err) {
    console.warn(`[brioverse] stats.${field} não actualizado:`, err?.code || err?.message)
  }
}

export function trackView(appId) {
  if (!appId) return
  const s = seen()
  if (s.has(appId)) return
  s.add(appId)
  try {
    sessionStorage.setItem(SEEN_KEY, JSON.stringify([...s]))
  } catch {
    /* ignore */
  }
  bump(appId, 'views')
}

export function trackClick(appId) {
  if (appId) bump(appId, 'clicks')
}
