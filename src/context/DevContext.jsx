import { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { DevContext } from './contexts.js'
import { useAuth } from '../hooks/useAuth.js'
import { useDeveloper } from '../hooks/useDeveloper.js'
import { listMyApps, listNotifications, markNotificationRead } from '../lib/developers.js'

/**
 * Dados do modo desenvolvedor, partilhados por todas as telas /dev/*:
 * candidatura/conta do criador, os apps dele (todos os estados) e os avisos.
 */
export function DevProvider({ children }) {
  const { user, role } = useAuth()
  const { developer, loading, setDeveloper, reload } = useDeveloper()
  const [apps, setApps] = useState([])
  const [notifications, setNotifications] = useState([])
  const [appsLoading, setAppsLoading] = useState(true)

  const reloadApps = useCallback(async () => {
    if (!user) return
    try {
      setApps(await listMyApps(user.uid))
    } catch (err) {
      console.warn('[brioverse] apps do criador indisponíveis:', err?.code || err?.message)
    }
    setAppsLoading(false)
  }, [user])

  const reloadNotifications = useCallback(async () => {
    if (!user) return
    try {
      setNotifications(await listNotifications(user.uid))
    } catch {
      /* best-effort */
    }
  }, [user])

  useEffect(() => {
    reloadApps()
    reloadNotifications()
  }, [reloadApps, reloadNotifications])

  const markRead = useCallback(async (id) => {
    setNotifications((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n)))
    try {
      await markNotificationRead(id)
    } catch {
      /* best-effort */
    }
  }, [])

  const markAllRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read)
    setNotifications((l) => l.map((n) => ({ ...n, read: true })))
    await Promise.allSettled(unread.map((n) => markNotificationRead(n.id)))
  }, [notifications])

  const value = useMemo(
    () => ({
      developer,
      setDeveloper,
      reloadDeveloper: reload,
      loading,
      // acesso ao modo dev completo: conta aprovada (ou admin sem candidatura)
      active: developer?.status === 'approved' || (role === 'admin' && !developer),
      apps,
      appsLoading,
      setApps,
      reloadApps,
      notifications,
      unread: notifications.filter((n) => !n.read).length,
      markRead,
      markAllRead,
    }),
    [developer, setDeveloper, reload, loading, role, apps, appsLoading, reloadApps, notifications, markRead, markAllRead],
  )

  return <DevContext.Provider value={value}>{children}</DevContext.Provider>
}

DevProvider.propTypes = {
  children: PropTypes.node,
}
