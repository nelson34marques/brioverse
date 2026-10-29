import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadApps, selectApps, getApp, cachedApps, loadFailed, subscribeApps } from '../lib/db.js'

/**
 * Todos os apps aprovados (carregados uma vez e partilhados).
 * `error` = sem ligação e nada guardado; `retry` volta a tentar sem recarregar a página.
 */
export function useAllApps() {
  const [apps, setApps] = useState(() => cachedApps() ?? [])
  const [loading, setLoading] = useState(() => !cachedApps())
  const [error, setError] = useState(false)

  useEffect(() => {
    let alive = true
    const unsub = subscribeApps((list) => {
      if (alive) setApps(list)
    })
    if (!cachedApps()) {
      loadApps().then((list) => {
        if (!alive) return
        setApps(list)
        setError(loadFailed())
        setLoading(false)
      })
    }
    return () => {
      alive = false
      unsub()
    }
  }, [])

  const retry = useCallback(() => {
    setLoading(true)
    setError(false)
    return loadApps({ force: true }).then((list) => {
      setApps(list)
      setError(loadFailed())
      setLoading(false)
    })
  }, [])

  return { apps, loading, error, retry }
}

/** Lista filtrada. `opts` = { type, category, q, sort, limit, exclude } */
export function useApps(opts = {}) {
  const { apps, loading, error, retry } = useAllApps()
  const key = JSON.stringify(opts)
  const list = useMemo(() => selectApps(apps, JSON.parse(key)), [apps, key])
  return { apps: list, loading, error, retry }
}

export function useApp(id) {
  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setNotFound(false)
    getApp(id).then((a) => {
      if (!alive) return
      setApp(a)
      setNotFound(!a)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [id])

  return { app, loading, notFound }
}
