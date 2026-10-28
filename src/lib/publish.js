// Publicar e manter um app (modo dev): validação, criação em apps/{autoId} com status 'pending',
// actualização (nova versão + novidades), pausa pelo próprio criador e eliminação.
// Sem Firebase, guarda em localStorage (brioverse:myapps) para a demo funcionar.
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { directImageUrl } from './images.js'
import { db, isFirebaseConfigured } from './firebase.js'
import { CATEGORIES } from '../utils/categories.js'
import { normalizeApp } from './db.js'

export const LOCAL_APPS_KEY = 'brioverse:myapps'
export const APP_LIMITS = { title: 60, short: 90, full: 2000, url: 400, keywords: 10, shots: 5, shotsMin: 2, version: 20, changelog: 500, releases: 10 }

export const EMPTY_APP = {
  title: '',
  category: 'productivity',
  type: 'pwa',
  shortDescription: '',
  fullDescription: '',
  keywords: '',
  appUrl: '',
  apkUrl: '',
  apkSizeMb: '',
  webUrl: '',
  desktopUrl: '',
  iconUrl: '',
  screenshots: ['', '', '', '', ''],
  version: '1.0.0',
  changelog: '',
  confirm: false,
}

const isUrl = (s) => /^https:\/\/[^\s/]+\.[^\s]+$/i.test((s || '').trim())
const isVersion = (s) => /^\d+(\.\d+){0,3}([-+][\w.]+)?$/.test((s || '').trim())

export function slugify(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

/** Devolve { campo: chave i18n } com os erros. Em edição, as novidades são obrigatórias. */
export function validateApp(f, { editing = false } = {}) {
  const e = {}
  const apk = f.type === 'apk'
  if ((f.title || '').trim().length < 2) e.title = 'dev.err_required'
  if (!CATEGORIES.some((c) => c.key === f.category)) e.category = 'dev.err_required'
  if ((f.shortDescription || '').trim().length < 10) e.shortDescription = 'dev.err_short_desc'
  if ((f.fullDescription || '').trim().length < 40) e.fullDescription = 'dev.err_full_desc'
  if (apk) {
    if (!isUrl(f.apkUrl)) e.apkUrl = 'dev.err_url'
    else if (!/\.apk(\?.*)?$/i.test(f.apkUrl.trim())) e.apkUrl = 'dev.err_apk'
    if (f.webUrl.trim() && !isUrl(f.webUrl)) e.webUrl = 'dev.err_url'
    if (f.apkSizeMb !== '' && !(Number(f.apkSizeMb) > 0)) e.apkSizeMb = 'dev.err_number'
  } else if (!isUrl(f.appUrl)) e.appUrl = 'dev.err_url'
  if (f.desktopUrl.trim() && !isUrl(f.desktopUrl)) e.desktopUrl = 'dev.err_url'
  if (!isUrl(f.iconUrl)) e.iconUrl = 'dev.err_url'
  const shots = f.screenshots.map((s) => s.trim())
  shots.forEach((s, i) => {
    if (s && !isUrl(s)) e[`shot${i}`] = 'dev.err_url'
  })
  if (shots.filter(isUrl).length < APP_LIMITS.shotsMin) e.screenshots = 'dev.err_shots'
  if (!isVersion(f.version)) e.version = 'dev.err_version'
  if (editing && (f.changelog || '').trim().length < 3) e.changelog = 'dev.err_changelog'
  if (!f.confirm) e.confirm = 'dev.err_confirm'
  return e
}

/** Form a partir de um app guardado (para a tela Actualizar). */
export function formFromApp(app) {
  const shots = [...(app.screenshots || [])].slice(0, APP_LIMITS.shots)
  while (shots.length < APP_LIMITS.shots) shots.push('')
  return {
    ...EMPTY_APP,
    title: app.title || '',
    category: app.category || 'productivity',
    type: app.type === 'apk' ? 'apk' : 'pwa',
    shortDescription: app.shortDescription || '',
    fullDescription: app.fullDescription || '',
    keywords: (app.keywords || []).join(', '),
    appUrl: app.type === 'apk' ? '' : app.appUrl || app.webUrl || '',
    apkUrl: app.apkUrl || '',
    apkSizeMb: app.apkSizeMb ? String(app.apkSizeMb) : '',
    webUrl: app.type === 'apk' ? app.webUrl || '' : '',
    desktopUrl: app.desktopUrl || '',
    iconUrl: app.iconUrl || '',
    screenshots: shots,
    version: app.version || '1.0.0',
    changelog: '',
    confirm: true,
  }
}

/** Campos do documento que vêm do formulário (sem dono, estado nem números). */
function dataFromForm(f) {
  const apk = f.type === 'apk'
  const keywords = (f.keywords || '')
    .split(',')
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, APP_LIMITS.keywords)
  const version = f.version.trim().slice(0, APP_LIMITS.version)
  return {
    title: f.title.trim().slice(0, APP_LIMITS.title),
    slug: slugify(f.title),
    shortDescription: f.shortDescription.trim().slice(0, APP_LIMITS.short),
    fullDescription: f.fullDescription.trim().slice(0, APP_LIMITS.full),
    category: f.category,
    keywords,
    type: apk ? 'apk' : 'pwa',
    appUrl: (apk ? f.apkUrl : f.appUrl).trim(),
    apkUrl: apk ? f.apkUrl.trim() : null,
    apkVersion: apk ? version : null,
    apkSizeMb: apk && f.apkSizeMb !== '' ? Number(f.apkSizeMb) : null,
    webUrl: apk ? f.webUrl.trim() || null : f.appUrl.trim(),
    desktopUrl: f.desktopUrl.trim() || null,
    iconUrl: directImageUrl(f.iconUrl),
    screenshots: f.screenshots.map(directImageUrl).filter(isUrl).slice(0, APP_LIMITS.shots),
    version,
    changelog: (f.changelog || '').trim().slice(0, APP_LIMITS.changelog),
  }
}

/* ---------- fallback local (sem Firebase) ---------- */

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_APPS_KEY)) || []
  } catch {
    return []
  }
}

function writeLocal(list) {
  try {
    localStorage.setItem(LOCAL_APPS_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

/** Apps guardados neste browser (modo demo). */
export function localApps() {
  return readLocal().map((d) => normalizeApp(d.id, d))
}

function patchLocal(id, patch) {
  const list = readLocal()
  const i = list.findIndex((a) => a.id === id)
  if (i < 0) return null
  list[i] = { ...list[i], ...patch, updatedAt: Date.now() }
  writeLocal(list)
  return normalizeApp(id, list[i])
}

/* ---------- criar ---------- */

/** Cria o documento do app. Fica 'pending' até o admin aprovar. */
export async function createApp(user, developer, f) {
  const now = Date.now()
  const base = dataFromForm(f)
  const data = {
    developerId: user.uid,
    developerName: developer?.name || user.displayName || '',
    ...base,
    versionCode: 1,
    releases: [{ version: base.version, notes: base.changelog, at: now }],
    verified: false,
    featured: false,
    boost: 0,
    status: 'pending',
    stats: { views: 0, clicks: 0, ratingAvg: 0, ratingCount: 0, ratingSum: 0 },
  }

  if (!isFirebaseConfigured) {
    const id = `local_${now.toString(36)}`
    const list = readLocal()
    list.unshift({ ...data, id, createdAt: now, updatedAt: now, releasedAt: now })
    writeLocal(list)
    return normalizeApp(id, list[0])
  }

  const ref = await addDoc(collection(db, 'apps'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    releasedAt: serverTimestamp(),
  })
  return normalizeApp(ref.id, { ...data, createdAt: now, updatedAt: now, releasedAt: now })
}

/* ---------- actualizar ---------- */

/** Campos de versão já normalizados: apps antigos (sem versão) ganham-nos na primeira escrita, como as regras exigem. */
function versionFields(app) {
  return {
    version: app.version || '1.0',
    versionCode: app.versionCode || 1,
    changelog: app.changelog || '',
    releases: (app.releases || []).map((r) => ({ version: r.version || '', notes: r.notes || '', at: r.at || 0 })),
  }
}

/**
 * Guarda alterações do criador. Se a versão mudou ou há novidades, conta como nova
 * release: versionCode +1 (é isto que dispara o aviso a quem tem o app).
 * Um app recusado volta a 'pending'; os outros mantêm o estado.
 */
export async function updateApp(app, f) {
  const now = Date.now()
  const base = dataFromForm(f)
  const newRelease = base.version !== app.version || Boolean(base.changelog)
  const patch = {
    ...versionFields(app),
    ...base,
    status: app.status === 'rejected' ? 'pending' : app.status,
  }
  if (newRelease) {
    patch.versionCode = (app.versionCode || 1) + 1
    patch.releases = [{ version: base.version, notes: base.changelog, at: now }, ...(app.releases || [])].slice(0, APP_LIMITS.releases)
    patch.releasedAt = now
  } else {
    // sem release nova, mantém as novidades da última
    patch.changelog = app.changelog || ''
  }

  if (!isFirebaseConfigured) return patchLocal(app.id, patch)

  await updateDoc(doc(db, 'apps', app.id), {
    ...patch,
    updatedAt: serverTimestamp(),
    ...(newRelease ? { releasedAt: serverTimestamp() } : {}),
  })
  return normalizeApp(app.id, { ...app, ...patch, updatedAt: now })
}

/** O criador pausa (sai da loja) ou retoma o seu app. Só entre 'approved' e 'paused'. */
export async function setAppPaused(app, paused) {
  const status = paused ? 'paused' : 'approved'
  if (!isFirebaseConfigured) return patchLocal(app.id, { status })
  await updateDoc(doc(db, 'apps', app.id), { ...versionFields(app), status, updatedAt: serverTimestamp() })
  return normalizeApp(app.id, { ...app, status, updatedAt: Date.now() })
}

/** Elimina o app de vez. As avaliações ficam órfãs (a página deixa de existir). */
export async function deleteApp(app) {
  if (!isFirebaseConfigured) {
    writeLocal(readLocal().filter((a) => a.id !== app.id))
    return
  }
  await deleteDoc(doc(db, 'apps', app.id))
}
