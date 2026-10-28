import { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { LibraryContext } from './contexts.js'
import { useAuth } from '../hooks/useAuth.js'
import { addToLibrary, clearLocalLibrary, fetchLibraryApps, listLibrary, markSeen, readLocalLibrary } from '../lib/library.js'
import { isFirebaseConfigured } from '../lib/firebase.js'

/**
 * Biblioteca do cliente (apps que abriu/baixou) + actualizações por ver.
 * `updates` = entradas cujo app tem versionCode maior do que o visto.
 */
export function LibraryProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [entries, setEntries] = useState([])
  const [apps, setApps] = useState({}) // appId → app actual
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    try {
      // ao entrar, o que foi guardado sem sessão passa para a conta
      if (isFirebaseConfigured && user) {
        const local = readLocalLibrary()
        if (local.length) {
          await Promise.allSettled(local.map((e) => addToLibrary(user, { id: e.appId, title: e.title, version: e.version, versionCode: e.versionCode })))
          clearLocalLibrary()
        }
      }
      const list = await listLibrary(user)
      setEntries(list)
      const found = await fetchLibraryApps(list.map((e) => e.appId))
      setApps(Object.fromEntries(found.map((a) => [a.id, a])))
    } catch (err) {
      console.warn('[brioverse] biblioteca indisponível:', err?.code || err?.message)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (authLoading) return
    reload()
  }, [authLoading, reload])

  const add = useCallback(
    async (app) => {
      setEntries((l) => [{ appId: app.id, title: app.title, version: app.version, versionCode: app.versionCode, seenCode: app.versionCode, addedAt: Date.now() }, ...l.filter((e) => e.appId !== app.id)])
      setApps((m) => ({ ...m, [app.id]: app }))
      try {
        await addToLibrary(user, app)
      } catch (err) {
        console.warn('[brioverse] biblioteca não guardada:', err?.code || err?.message)
      }
    },
    [user],
  )

  const seen = useCallback(
    async (appId) => {
      const app = apps[appId]
      if (!app) return
      setEntries((l) => l.map((e) => (e.appId === appId ? { ...e, seenCode: app.versionCode, version: app.version } : e)))
      try {
        await markSeen(user, appId, app.versionCode)
      } catch {
        /* best-effort */
      }
    },
    [apps, user],
  )

  const updates = useMemo(
    () =>
      entries
        .map((e) => ({ entry: e, app: apps[e.appId] }))
        .filter(({ entry, app }) => app && app.versionCode > entry.seenCode)
        .sort((a, b) => (b.app.releasedAt || 0) - (a.app.releasedAt || 0)),
    [entries, apps],
  )

  const value = useMemo(
    () => ({
      entries,
      loading,
      has: (appId) => entries.some((e) => e.appId === appId),
      entry: (appId) => entries.find((e) => e.appId === appId) || null,
      add,
      seen,
      seenAll: () => Promise.allSettled(updates.map((u) => seen(u.app.id))),
      updates,
      count: updates.length,
      reload,
    }),
    [entries, loading, add, seen, updates, reload],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

LibraryProvider.propTypes = {
  children: PropTypes.node,
}
