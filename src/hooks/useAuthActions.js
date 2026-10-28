import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, authErrorKey } from '../lib/auth.js'

/** Estado de submissão + acções de auth com redirect para a página de origem. */
export function useAuthActions() {
  const navigate = useNavigate()
  const location = useLocation()
  const [busy, setBusy] = useState(false)
  const [errorKey, setErrorKey] = useState(null)
  const [info, setInfo] = useState(null)

  const from = location.state?.from?.pathname || '/'

  const run = useCallback(
    async (fn, { redirect = true } = {}) => {
      setBusy(true)
      setErrorKey(null)
      setInfo(null)
      try {
        const user = await fn()
        // user === null quando caiu para signInWithRedirect: a página vai recarregar
        if (user && redirect) navigate(from, { replace: true })
        return user
      } catch (err) {
        console.warn('[brioverse] auth:', err?.code || err?.message)
        setErrorKey(authErrorKey(err))
        return null
      } finally {
        setBusy(false)
      }
    },
    [navigate, from],
  )

  const google = useCallback(() => run(loginWithGoogle), [run])
  const login = useCallback((email, password) => run(() => loginWithEmail(email, password)), [run])
  const register = useCallback((data) => run(() => registerWithEmail(data)), [run])
  const forgot = useCallback(
    async (email) => {
      const ok = await run(() => resetPassword(email).then(() => null), { redirect: false })
      if (ok === null && !errorKey) setInfo('auth.reset_sent')
    },
    [run, errorKey],
  )

  return { busy, errorKey, info, google, login, register, forgot, clearError: () => setErrorKey(null) }
}
