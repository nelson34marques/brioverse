import { afterEach, describe, expect, it, vi } from 'vitest'
import { appLinks, detectDevice } from './device.js'

const ua = (userAgent) => vi.stubGlobal('navigator', { userAgent, platform: '', maxTouchPoints: 0 })

describe('detectDevice', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('sem navigator assume computador sem dados de instalação', () => {
    vi.stubGlobal('navigator', undefined)
    expect(detectDevice()).toEqual({ os: 'pc', browser: 'other', pwa: 'yes', standalone: false })
  })

  it('reconhece Android com Chrome', () => {
    ua('Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/124.0 Mobile Safari/537.36')
    expect(detectDevice()).toMatchObject({ os: 'android', browser: 'chrome', pwa: 'yes' })
  })

  it('no iPhone só o Safari instala PWAs', () => {
    ua('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Version/17.4 Mobile/15E148 Safari/604.1')
    expect(detectDevice()).toMatchObject({ os: 'ios', browser: 'safari', pwa: 'yes' })

    ua('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 CriOS/124.0 Mobile/15E148 Safari/604.1')
    expect(detectDevice()).toMatchObject({ os: 'ios', browser: 'chrome', pwa: 'safari-only' })
  })

  it('no computador, Firefox e Safari não instalam', () => {
    ua('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0')
    expect(detectDevice()).toMatchObject({ os: 'pc', browser: 'firefox', pwa: 'no' })
  })
})

describe('appLinks', () => {
  it('PWA: web é o appUrl e o APK é opcional', () => {
    expect(appLinks({ type: 'pwa', appUrl: 'https://app.example.com', apkUrl: 'https://cdn.example.com/a.apk' })).toEqual({
      web: 'https://app.example.com',
      apk: 'https://cdn.example.com/a.apk',
      desktop: null,
    })
  })

  it('APK: o apkUrl tem prioridade e a versão web é o webUrl', () => {
    expect(
      appLinks({
        type: 'apk',
        appUrl: 'https://cdn.example.com/a.apk',
        apkUrl: 'https://cdn.example.com/b.apk',
        webUrl: 'https://app.example.com',
      }),
    ).toEqual({
      web: 'https://app.example.com',
      apk: 'https://cdn.example.com/b.apk',
      desktop: null,
    })
  })

  it('APK antigo sem apkUrl usa o appUrl', () => {
    expect(appLinks({ type: 'apk', appUrl: 'https://cdn.example.com/a.apk' }).apk).toBe('https://cdn.example.com/a.apk')
  })
})
