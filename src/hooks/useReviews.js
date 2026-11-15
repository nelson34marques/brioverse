import { useCallback, useEffect, useMemo, useState } from 'react'
import { subscribeReviews, summarize } from '../lib/reviews.js'

export const REVIEWS_PAGE = 100

/**
 * Avaliações reais de um app em tempo real + resumo (média, total, distribuição).
 * Usado pela página do app para o cabeçalho e pela secção de avaliações,
 * para mostrarem sempre os mesmos números. `max` cresce de 100 em 100 ao
 * clicar em "Carregar mais" (sem índice composto appId + createdAt).
 */
export function useReviews(app) {
  const appId = app?.id
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(Boolean(appId))
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [limit, setLimit] = useState(REVIEWS_PAGE)
  const [reloadKey, setReloadKey] = useState(0)

  // troca de app: repõe a primeira página
  useEffect(() => {
    setLimit(REVIEWS_PAGE)
    setReviews([])
    setHasMore(false)
    setLoading(Boolean(appId))
  }, [appId])

  useEffect(() => {
    if (!appId) return undefined
    setLoading(true)
    const unsubscribe = subscribeReviews(
      appId,
      limit,
      (list) => {
        setReviews(list)
        setHasMore(list.length >= limit)
        setLoading(false)
        setLoadingMore(false)
      },
      () => {
        setLoading(false)
        setLoadingMore(false)
      },
    )
    return unsubscribe
  }, [appId, limit, reloadKey])

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return
    setLoadingMore(true)
    setLimit((value) => value + REVIEWS_PAGE)
  }, [hasMore, loadingMore])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  // Resumo: as reviews carregadas mandam. Se os stats do app registarem mais
  // avaliações do que as carregadas (histórico), usa os stats.
  const summary = useMemo(() => {
    const real = summarize(reviews)
    const s = app?.stats ?? {}
    if ((s.ratingCount ?? 0) > real.count) {
      return { avg: s.ratingAvg ?? 0, count: s.ratingCount ?? 0, distribution: real.count ? real.distribution : null }
    }
    return real
  }, [reviews, app?.stats])

  return { reviews, setReviews, loading, loadingMore, hasMore, loadMore, reload, summary }
}
