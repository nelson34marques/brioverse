import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth.js'
import { getDeveloper } from '../lib/developers.js'

/** Candidatura/conta de desenvolvedor do utilizador actual (developers/{uid}). */
export function useDeveloper() {
  const { user, loading: authLoading } = useAuth()
  const [developer, setDeveloper] = useState(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (authLoading) return
    if (!user) {
      setDeveloper(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setDeveloper(await getDeveloper(user.uid))
    } catch (err) {
      console.warn('[brioverse] developers/{uid} indisponível:', err?.code || err?.message)
      setDeveloper(null)
    }
    setLoading(false)
  }, [user, authLoading])

  useEffect(() => {
    reload()
  }, [reload])

  return { developer, loading, reload, setDeveloper }
}
