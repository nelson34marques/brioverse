import { describe, expect, it } from 'vitest'
import { normalizeApp, selectApps } from './db.js'

describe('normalizeApp', () => {
  it('só deixa passar links http(s)', () => {
    const app = normalizeApp('a1', {
      title: 'Teste',
      type: 'apk',
      appUrl: 'javascript:alert(1)',
      apkUrl: 'https://cdn.example.com/app.apk',
      iconUrl: 'data:image/png;base64,abc',
      screenshots: ['https://cdn.example.com/1.png', 'javascript:alert(1)', null],
    })
    expect(app.appUrl).toBeNull()
    expect(app.apkUrl).toBe('https://cdn.example.com/app.apk')
    expect(app.iconUrl).toBeNull()
    expect(app.screenshots).toEqual(['https://cdn.example.com/1.png'])
  })

  it('preenche os valores por omissão', () => {
    const app = normalizeApp('a1', { name: 'Sem título', createdAt: 1000 })
    expect(app.title).toBe('Sem título')
    expect(app.slug).toBe('a1')
    expect(app.category).toBe('other')
    expect(app.type).toBe('pwa')
    expect(app.status).toBe('approved')
    expect(app.version).toBe('1.0')
    expect(app.versionCode).toBe(1)
    expect(app.stats).toEqual({ views: 0, clicks: 0, ratingAvg: 0, ratingCount: 0, byCountry: {} })
    expect(app.createdAt).toBe(1000)
    expect(app.releasedAt).toBe(1000)
  })

  it('normaliza o impulso do admin entre 0 e 3', () => {
    expect(normalizeApp('a', { boost: 9 }).boost).toBe(3)
    expect(normalizeApp('a', { boost: -2 }).boost).toBe(0)
    expect(normalizeApp('a', { boost: 'x' }).boost).toBe(0)
  })
})

describe('selectApps', () => {
  const apps = [
    normalizeApp('1', { title: 'Alpha', category: 'games', stats: { views: 1 }, createdAt: 1 }),
    normalizeApp('2', { title: 'Beta', category: 'games', type: 'apk', stats: { views: 100 }, createdAt: 2 }),
    normalizeApp('3', { title: 'Gama', category: 'tools', keywords: ['estudo'], createdAt: 3 }),
  ]

  it('filtra por tipo e categoria', () => {
    expect(selectApps(apps, { type: 'apk' }).map((a) => a.id)).toEqual(['2'])
    expect(selectApps(apps, { category: 'games' }).map((a) => a.id).sort()).toEqual(['1', '2'])
    expect(selectApps(apps, { category: 'games', exclude: '2' }).map((a) => a.id)).toEqual(['1'])
  })

  it('pesquisa no título, criador, descrição e palavras-chave', () => {
    expect(selectApps(apps, { q: 'ESTUDO' }).map((a) => a.id)).toEqual(['3'])
    expect(selectApps(apps, { q: 'beta' }).map((a) => a.id)).toEqual(['2'])
  })

  it('ordena por título e respeita o limite', () => {
    expect(selectApps(apps, { sort: 'title', limit: 1 }).map((a) => a.title)).toEqual(['Alpha'])
  })

  it('a ordem "trending" dá mais peso a quem tem mais views', () => {
    expect(selectApps(apps, { sort: 'trending' })[0].id).toBe('2')
  })
})
