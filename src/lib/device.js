// Detecção leve do dispositivo/browser a partir do user agent.
// Serve para pré-seleccionar o onboarding e escolher o guia de instalação certo.

export const DEVICES = ['android', 'ios', 'pc']

export function detectDevice() {
  if (typeof navigator === 'undefined') return { os: 'pc', browser: 'other', pwa: 'yes', standalone: false }
  const ua = navigator.userAgent || ''
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  const ios = /iPhone|iPad|iPod/i.test(ua) || iPadOS
  const android = /Android/i.test(ua)
  const os = ios ? 'ios' : android ? 'android' : 'pc'

  let browser = 'other'
  if (/Edg(e|A|iOS)?\//.test(ua)) browser = 'edge'
  else if (/SamsungBrowser/.test(ua)) browser = 'samsung'
  else if (/OPR\/|Opera/.test(ua)) browser = 'opera'
  else if (/Firefox|FxiOS/.test(ua)) browser = 'firefox'
  else if (/CriOS|Chrome\//.test(ua)) browser = 'chrome'
  else if (/Safari\//.test(ua)) browser = 'safari'

  // Capacidade de instalar PWAs:
  //  yes          - o browser mostra a opção de instalar
  //  safari-only  - iOS: só o Safari instala
  //  unknown      - Android com browser desconhecido (pode não suportar)
  //  no           - PC com browser sem instalação (Firefox, Safari)
  let pwa = 'yes'
  if (os === 'ios') pwa = browser === 'safari' ? 'yes' : 'safari-only'
  else if (os === 'android') pwa = ['chrome', 'edge', 'samsung', 'opera', 'firefox'].includes(browser) ? 'yes' : 'unknown'
  else pwa = ['chrome', 'edge', 'opera'].includes(browser) ? 'yes' : 'no'

  const standalone =
    (typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches) || navigator.standalone === true

  return { os, browser, pwa, standalone }
}

/** Links de distribuição de um app, normalizados por plataforma. */
export function appLinks(app) {
  const isApk = app.type === 'apk'
  return {
    web: isApk ? app.webUrl || null : app.appUrl || null,
    apk: app.apkUrl || (isApk ? app.appUrl : null) || null,
    desktop: app.desktopUrl || null,
  }
}
