import { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { AuthContext } from './contexts.js'
import { isFirebaseConfigured } from '../lib/firebase.js'
import { observeAuth, fetchProfile, finishRedirectLogin, profileFromUser, reloadUser } from '../lib/auth.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  // sem Firebase (demo) conta como confirmado; com Google vem sempre confirmado
  const [emailVerified, setEmailVerified] = useState(!isFirebaseConfigured)

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined

    // Conclui um login por redirect (fallback do popup), se houver.
    finishRedirectLogin()

    return observeAuth(async (u) => {
      setUser(u)
      setEmailVerified(!u || Boolean(u.emailVerified))
      if (u) {
        try {
          setProfile((await fetchProfile(u.uid)) ?? profileFromUser(u))
        } catch {
          setProfile(profileFromUser(u))
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
  }, [])

  // depois de a pessoa abrir o link do email: volta a ler o utilizador e actualiza o estado
  const refreshVerified = useCallback(async () => {
    try {
      const u = await reloadUser()
      const ok = Boolean(u?.emailVerified)
      setEmailVerified(ok)
      return ok
    } catch {
      return false
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      profile,
      emailVerified,
      refreshVerified,
      role: profile?.role ?? null,
      loading,
      isAuthenticated: Boolean(user),
      configured: isFirebaseConfigured,
    }),
    [user, profile, loading, emailVerified, refreshVerified],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node,
}
