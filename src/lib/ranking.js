// Ordenação dos apps (ver docs/PLANO.md, "Ranking").
//
// score = 0.55 · nota  +  0.35 · popularidade  +  0.10 · frescura  +  0.12 · impulso
//
//  nota         média bayesiana: (C·m + soma das notas) / (C + nº de avaliações), em 0..1.
//               C = 5 avaliações "fantasma" com nota m = 3.5. Assim 1 review de 5★
//               não ultrapassa 40 reviews de 4.6★; quantas mais avaliações, mais a
//               média real pesa. Sem avaliações, nota = m.
//  popularidade log10(1 + views) relativo ao app mais visto do catálogo (0..1).
//               Logarítmico: 10× mais views não dá 10× mais pontos.
//  frescura     exp(−idade em dias / 60): bónus para apps novos que decai em ~2 meses.
//  impulso      nível 0..3 dado pelo admin no painel (app.boost). Cada nível soma 0.12,
//               o suficiente para subir um app à frente de outros com nota/views parecidas.
//
// Empates: mais avaliações primeiro, depois mais views, depois mais recente.

const PRIOR_COUNT = 5
const PRIOR_MEAN = 3.5
const W_RATING = 0.55
const W_VIEWS = 0.35
const W_FRESH = 0.1
const W_BOOST = 0.12
const MAX_BOOST = 3
const FRESH_DAYS = 60
const DAY = 24 * 60 * 60 * 1000

export function bayesianRating(stats = {}) {
  const n = Number(stats.ratingCount) || 0
  const avg = Number(stats.ratingAvg) || 0
  return (PRIOR_COUNT * PRIOR_MEAN + avg * n) / (PRIOR_COUNT + n)
}

export function rankContext(apps, now = Date.now()) {
  const maxViews = Math.max(1, ...apps.map((a) => Number(a.stats?.views) || 0))
  return { logMax: Math.log10(1 + maxViews), now }
}

export function rankScore(app, ctx) {
  const s = app.stats ?? {}
  const rating = bayesianRating(s) / 5
  const views = Number(s.views) || 0
  const popularity = ctx.logMax > 0 ? Math.log10(1 + views) / ctx.logMax : 0
  const ageDays = Math.max(0, (ctx.now - (app.createdAt || ctx.now)) / DAY)
  const freshness = Math.exp(-ageDays / FRESH_DAYS)
  const boost = Math.min(MAX_BOOST, Math.max(0, Number(app.boost) || 0))
  return W_RATING * rating + W_VIEWS * popularity + W_FRESH * freshness + W_BOOST * boost
}

function tieBreak(a, b) {
  return (
    (b.stats?.ratingCount ?? 0) - (a.stats?.ratingCount ?? 0) ||
    (b.stats?.views ?? 0) - (a.stats?.views ?? 0) ||
    (b.createdAt ?? 0) - (a.createdAt ?? 0)
  )
}

/** Comparadores prontos para `Array.sort`. `ctx` vem de `rankContext(todos os apps)`. */
export function comparators(ctx) {
  return {
    // "Em alta" / ordem por omissão
    trending: (a, b) => rankScore(b, ctx) - rankScore(a, ctx) || tieBreak(a, b),
    // "Melhor avaliados": média bayesiana, depois nº de avaliações
    rating: (a, b) => bayesianRating(b.stats) - bayesianRating(a.stats) || tieBreak(a, b),
    recent: (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0) || tieBreak(a, b),
    title: (a, b) => (a.title ?? '').localeCompare(b.title ?? ''),
  }
}
