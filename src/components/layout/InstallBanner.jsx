import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useLocation } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import Modal from '../ui/Modal.jsx'
import { useInstallApp } from '../../hooks/useInstallApp.js'
import { usePrefs } from '../../hooks/usePrefs.js'
import { useT } from '../../hooks/useT.js'
import styles from './InstallBanner.module.css'

/**
 * Passos para instalar a Brioverse quando o browser não tem pedido nativo
 * (iPhone/iPad, Firefox, Safari no Mac, browsers Android desconhecidos).
 */
export function InstallGuideModal({ open, onClose, device }) {
  const { t } = useT()
  const key = device.os === 'ios' ? 'ios' : device.os === 'android' ? 'android' : 'pc'
  const unsupported = device.pwa === 'no'
  const notSafari = device.os === 'ios' && device.pwa === 'safari-only'

  return (
    <Modal open={open} onClose={onClose} title={t('pwa.guide_title')}>
      {unsupported ? (
        <p className={styles.note}>{t('install.pc_unsupported')}</p>
      ) : (
        <>
          <ol className={styles.steps}>
            <li>{t(`pwa.${key}_1`)}</li>
            <li>{t(`pwa.${key}_2`)}</li>
          </ol>
          {notSafari && <p className={styles.warn}>{t('install.ios_not_safari')}</p>}
          {device.os === 'android' && device.pwa === 'unknown' && <p className={styles.warn}>{t('install.android_unknown_browser')}</p>}
        </>
      )}
      <p className={styles.note}>{t('install.no_install_ok')}</p>
    </Modal>
  )
}

InstallGuideModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  device: PropTypes.shape({ os: PropTypes.string, pwa: PropTypes.string }).isRequired,
}

/**
 * Banner "Instalar a Brioverse", como a mini-barra do Chrome / Play Store:
 * ícone, nome, domínio, botão Instalar e fechar. Só fora da app instalada,
 * nunca por cima do onboarding, e fica escondido 14 dias depois de fechado.
 */
export default function InstallBanner() {
  const { t } = useT()
  const { pathname } = useLocation()
  const { onboardingOpen } = usePrefs()
  const { status, device, dismissed, install, dismiss, guideOpen, closeGuide } = useInstallApp()
  const [ready, setReady] = useState(false)

  // pequeno atraso para não aparecer ao mesmo tempo que o conteúdo carrega
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 1500)
    return () => clearTimeout(id)
  }, [])

  const authPage = pathname === '/entrar' || pathname === '/registar'
  const show = ready && !onboardingOpen && !authPage && !dismissed && status !== 'installed' && status !== 'no'

  return (
    <>
      {show && (
        <aside className={styles.banner} role="complementary" aria-label={t('pwa.title')}>
          <img className={styles.icon} src="/web-app-manifest-192x192.png" width="44" height="44" alt="" aria-hidden="true" />
          <div className={styles.text}>
            <strong className={styles.title}>{t('pwa.title')}</strong>
            <span className={styles.sub}>{t('pwa.subtitle', { host: window.location.host })}</span>
          </div>
          <Button variant="cta" size="sm" onClick={install} className={styles.cta}>
            {t('pwa.install')}
          </Button>
          <button type="button" className={styles.close} onClick={dismiss} aria-label={t('pwa.later')} title={t('pwa.later')}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </aside>
      )}
      <InstallGuideModal open={guideOpen} onClose={closeGuide} device={device} />
    </>
  )
}
