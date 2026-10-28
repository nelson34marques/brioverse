import { useCallback, useEffect, useMemo, useState } from 'react'
import { listReviews, summarize } from '../lib/reviews.js'

/**
 * Avaliações reais de um app + resumo (média, total, distribuição).
 * Usado pela página do app para o cabeçalho e pela secção de avaliações,
 * para mostrarem sempre os mesmos números.
 */
export function useReviews(app) {
  const appId = app?.id
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(Boolean(appId))

  const reload = useCallback(async () => {
    if (!appId) return
    try {
      setReviews(await listReviews(appId))
    } catch (err) {
      console.warn('[brioverse] reviews não carregadas:', err?.code || err?.message)
    } finally {
      setLoading(false)
    }
  }, [appId])

  useEffect(() => {
    setReviews([])
    setLoading(Boolean(appId))
    reload()
  }, [reload, appId])

  // Resumo: as reviews carregadas mandam. Se os stats do app registarem mais
  // avaliações do que as carregadas (histórico, limite de 100), usa os stats.
  const summary = useMemo(() => {
    const real = summarize(reviews)
    const s = app?.stats ?? {}
    if ((s.ratingCount ?? 0) > real.count) {
      return { avg: s.ratingAvg ?? 0, count: s.ratingCount ?? 0, distribution: real.count ? real.distribution : null }
    }
    return real
  }, [reviews, app?.stats])

  return { reviews, setReviews, loading, reload, summary }
}
