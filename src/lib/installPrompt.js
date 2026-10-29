// Instalação da própria Brioverse como app (PWA).
// O Chrome/Edge (Android e PC) disparam `beforeinstallprompt` cedo, muitas vezes antes
// do React montar; por isso este módulo é importado em main.jsx e guarda o evento.
// No iPhone/iPad e noutros browsers não há evento: mostramos os passos manuais.

const DISMISS_KEY = 'brioverse:install-dismissed'
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000 // 14 dias

let deferred = null
let installed = false
const listeners = new Set()

function emit() {
  for (const fn of listeners) fn()
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e
    emit()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    installed = true
    emit()
  })
}

export function isStandalone() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
}

export function isInstalled() {
  return installed || isStandalone()
}

/** O browser tem o pedido nativo pronto (Chrome/Edge/Samsung). */
export function canPrompt() {
  return Boolean(deferred)
}

/** Abre o pedido nativo. Devolve true se a pessoa aceitou. */
export async function promptInstall() {
  if (!deferred) return false
  const ev = deferred
  deferred = null
  emit()
  try {
    ev.prompt()
    const { outcome } = await ev.userChoice
    return outcome === 'accepted'
  } catch {
    return false
  }
}

/**
 * Espera (até `ms`) que o browser dispare `beforeinstallprompt`. O Chrome só o dispara
 * depois de registar o service worker, por vezes segundos após a página abrir.
 */
export function waitForPrompt(ms = 3000) {
  if (deferred) return Promise.resolve(true)
  return new Promise((resolve) => {
    const stop = subscribeInstall(() => {
      if (deferred) {
        clearTimeout(timer)
        stop()
        resolve(true)
      }
    })
    const timer = setTimeout(() => {
      stop()
      resolve(false)
    }, ms)
  })
}

export function subscribeInstall(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function isDismissed() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY))
    return at > 0 && Date.now() - at < SNOOZE_MS
  } catch {
    return false
  }
}

export function dismissInstall() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  } catch {
    // sem localStorage: o banner volta na próxima visita
  }
}
