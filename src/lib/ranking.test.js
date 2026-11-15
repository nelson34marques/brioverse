import { describe, expect, it } from 'vitest'
import { bayesianRating, comparators, rankContext, rankScore } from './ranking.js'

const app = (over = {}) => ({
  title: 'App',
  createdAt: 0,
  boost: 0,
  stats: { views: 0, ratingAvg: 0, ratingCount: 0 },
  ...over,
})

describe('bayesianRating', () => {
  it('sem avaliações vale a média pré-definida (3.5)', () => {
    expect(bayesianRating({ ratingCount: 0, ratingAvg: 0 })).toBe(3.5)
  })

  it('muitas avaliações pesam mais que uma única nota alta', () => {
    const uma = bayesianRating({ ratingCount: 1, ratingAvg: 5 })
    const muitas = bayesianRating({ ratingCount: 40, ratingAvg: 4.6 })
    expect(uma).toBeLessThan(muitas)
  })
})

describe('rankScore', () => {
  const ctx = rankContext([app({ stats: { views: 100, ratingAvg: 0, ratingCount: 0 } })], 0)

  it('combina nota, popularidade e frescura', () => {
    const fresh = app({ stats: { views: 100, ratingAvg: 0, ratingCount: 0 } })
    const score = rankScore(fresh, ctx)
    expect(score).toBeCloseTo(0.55 * 0.7 + 0.35 + 0.1, 5)
  })

  it('o impulso do admin soma 0.12 por nível', () => {
    const base = app()
    const boosted = app({ boost: 2 })
    expect(rankScore(boosted, ctx) - rankScore(base, ctx)).toBeCloseTo(0.24, 5)
  })

  it('apps mais antigos perdem o bónus de frescura', () => {
    const day = 24 * 60 * 60 * 1000
    const old = app({ createdAt: -120 * day })
    const recent = app({ createdAt: -1 * day })
    expect(rankScore(old, ctx)).toBeLessThan(rankScore(recent, ctx))
  })
})

describe('comparators', () => {
  const ctx = rankContext([], 0)

  it('rating ordena pela média bayesiana', () => {
    const a = app({ title: 'A', stats: { views: 0, ratingCount: 1, ratingAvg: 5 } })
    const b = app({ title: 'B', stats: { views: 0, ratingCount: 40, ratingAvg: 4.6 } })
    expect([a, b].sort(comparators(ctx).rating)[0].title).toBe('B')
  })

  it('recent ordena pela data de criação (mais nova primeiro)', () => {
    const a = app({ title: 'A', createdAt: 10 })
    const b = app({ title: 'B', createdAt: 20 })
    expect([a, b].sort(comparators(ctx).recent)[0].title).toBe('B')
  })
})
