import { useEffect, useMemo, useState } from 'react'
import { loadApps, selectApps, getApp } from '../lib/db.js'

let shared = null

/** Todos os apps aprovados (carregados uma vez e partilhados). */
export function useAllApps() {
  const [apps, setApps] = useState(shared ?? [])
  const [loading, setLoading] = useState(!shared)

  useEffect(() => {
    let alive = true
    loadApps().then((list) => {
      shared = list
      if (alive) {
        setApps(list)
        setLoading(false)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  return { apps, loading }
}

/** Lista filtrada. `opts` = { type, category, q, sort, limit, exclude } */
export function useApps(opts = {}) {
  const { apps, loading } = useAllApps()
  const key = JSON.stringify(opts)
  const list = useMemo(() => selectApps(apps, JSON.parse(key)), [apps, key])
  return { apps: list, loading }
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
