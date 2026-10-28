import { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { PrefsContext } from './contexts.js'
import { useAuth } from '../hooks/useAuth.js'
import { detectDevice } from '../lib/device.js'
import { readPrefs, writePrefs, cleanPrefs, syncPrefsToCloud } from '../lib/prefs.js'

/**
 * Preferências (dispositivos + gostos) e estado do onboarding.
 * O onboarding abre na primeira visita e pode ser reaberto para editar.
 */
export function PrefsProvider({ children }) {
  const { user, profile } = useAuth()
  const [prefs, setPrefsState] = useState(() => readPrefs())
  const [forcedOpen, setForcedOpen] = useState(false)
  const detected = useMemo(() => detectDevice(), [])

  // Sessão com prefs na nuvem mais recentes do que as locais: adopta-as.
  useEffect(() => {
    const cloud = profile?.prefs
    if (!cloud?.onboarded) return
    setPrefsState((local) => {
      if (local.onboarded && local.updatedAt >= (cloud.updatedAt || 0)) return local
      return writePrefs(cleanPrefs(cloud))
    })
  }, [profile])

  const save = useCallback(
    (patch) => {
      setPrefsState((prev) => {
        const next = writePrefs({ ...prev, ...patch, updatedAt: Date.now() })
        if (user?.uid) syncPrefsToCloud(user.uid, next)
        return next
      })
    },
    [user],
  )

  const value = useMemo(
    () => ({
      prefs,
      detected,
      /** Dispositivos a considerar: os escolhidos ou, sem onboarding, o detectado. */
      devices: prefs.devices.length ? prefs.devices : [detected.os],
      onboardingOpen: !prefs.onboarded || forcedOpen,
      completeOnboarding: ({ devices, interests }) => {
        save({ onboarded: true, devices, interests })
        setForcedOpen(false)
      },
      skipOnboarding: () => {
        save({ onboarded: true, devices: prefs.devices.length ? prefs.devices : [detected.os] })
        setForcedOpen(false)
      },
      openOnboarding: () => setForcedOpen(true),
      closeOnboarding: () => setForcedOpen(false),
    }),
    [prefs, detected, forcedOpen, save],
  )

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
}

PrefsProvider.propTypes = {
  children: PropTypes.node,
}
