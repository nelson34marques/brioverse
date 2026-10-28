import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Button from '../ui/Button.jsx'
import Chip from '../ui/Chip.jsx'
import { usePrefs } from '../../hooks/usePrefs.js'
import { useT } from '../../hooks/useT.js'
import { DEVICES } from '../../lib/device.js'
import { CATEGORIES } from '../../utils/categories.js'
import styles from './Onboarding.module.css'

const ICONS = {
  android: (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M10 18.5h4" />
    </svg>
  ),
  ios: (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="2.5" width="12" height="19" rx="3" />
      <path d="M10 5h4" />
    </svg>
  ),
  pc: (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="12" rx="2" />
      <path d="M2 19.5h20" />
    </svg>
  ),
}

/**
 * Onboarding (primeira visita): 1) dispositivos que a pessoa usa, 2) gostos.
 * Define o guia "Como instalar" certo e a secção "Para ti" no Início.
 */
export default function Onboarding() {
  const { t } = useT()
  const { prefs, detected, onboardingOpen, completeOnboarding, skipOnboarding, closeOnboarding } = usePrefs()
  const [step, setStep] = useState(0)
  const [devices, setDevices] = useState(() => (prefs.devices.length ? prefs.devices : [detected.os]))
  const [interests, setInterests] = useState(prefs.interests)

  useEffect(() => {
    if (!onboardingOpen) return undefined
    setStep(0)
    setDevices(prefs.devices.length ? prefs.devices : [detected.os])
    setInterests(prefs.interests)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
    // repõe o estado só quando abre
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingOpen])

  if (!onboardingOpen) return null

  const toggle = (list, set, key) => set(list.includes(key) ? list.filter((k) => k !== key) : [...list, key])
  const editing = prefs.onboarded

  return createPortal(
    <div className={styles.screen} role="dialog" aria-modal="true" aria-label={t('onboarding.welcome')}>
      <div className={styles.top}>
        <span className={styles.step}>{t('onboarding.step', { n: step + 1 })}</span>
        <Button variant="ghost" size="sm" onClick={editing ? closeOnboarding : skipOnboarding}>
          {editing ? t('common.cancel') : t('onboarding.skip')}
        </Button>
      </div>

      <div className={styles.card}>
        {step === 0 ? (
          <>
            <p className="eyebrow">{t('onboarding.welcome')}</p>
            <h1 className={styles.title}>{t('onboarding.devices_title')}</h1>
            <p className={styles.sub}>{t('onboarding.devices_sub')}</p>

            <div className={styles.devices}>
              {DEVICES.map((d) => {
                const on = devices.includes(d)
                return (
                  <button
                    key={d}
                    type="button"
                    className={`${styles.device} ${on ? styles.on : ''}`}
                    onClick={() => toggle(devices, setDevices, d)}
                    aria-pressed={on}
                  >
                    <span className={styles.icon}>{ICONS[d]}</span>
                    <span className={styles.name}>{t(`onboarding.${d}`)}</span>
                    <span className={styles.hint}>{t(`onboarding.${d}_hint`)}</span>
                    {detected.os === d && <span className={styles.detected}>{t('onboarding.detected')}</span>}
                    <span className={styles.check} aria-hidden="true">
                      {on ? '✓' : ''}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className={styles.actions}>
              <Button variant="cta" size="lg" disabled={!devices.length} onClick={() => setStep(1)}>
                {t('onboarding.continue')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="eyebrow">{t('onboarding.welcome')}</p>
            <h1 className={styles.title}>{t('onboarding.interests_title')}</h1>
            <p className={styles.sub}>{t('onboarding.interests_sub')}</p>

            <div className={styles.chips}>
              {CATEGORIES.map((c) => (
                <Chip key={c.key} prominent active={interests.includes(c.key)} onClick={() => toggle(interests, setInterests, c.key)}>
                  {t(`categories.${c.key}`)}
                </Chip>
              ))}
            </div>

            <div className={styles.actions}>
              <Button variant="secondary" size="lg" onClick={() => setStep(0)}>
                {t('onboarding.back')}
              </Button>
              <Button variant="cta" size="lg" onClick={() => completeOnboarding({ devices, interests })}>
                {t('onboarding.finish')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
