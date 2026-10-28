import { useState } from 'react'
import PropTypes from 'prop-types'
import Button from '../ui/Button.jsx'
import Chip from '../ui/Chip.jsx'
import { usePrefs } from '../../hooks/usePrefs.js'
import { useT } from '../../hooks/useT.js'
import { appLinks } from '../../lib/device.js'
import { sizeMb } from '../../utils/format.js'
import styles from './InstallGuide.module.css'

/**
 * Conteúdo do modal "Como instalar". Mostra só os dispositivos que a pessoa
 * escolheu no onboarding (ou o detectado), com o guia certo para cada um:
 * PWA (browser), APK (Android) ou instalador para computador.
 */
export default function InstallGuide({ app, onApk, onChangeDevice }) {
  const { t } = useT()
  const { devices, detected } = usePrefs()
  const links = appLinks(app)
  const [active, setActive] = useState(() => (devices.includes(detected.os) ? detected.os : devices[0]))
  const current = devices.includes(active) ? active : devices[0]
  const isHere = current === detected.os

  const Steps = ({ keys }) => (
    <ol className={styles.steps}>
      {keys.map((k) => (
        <li key={k}>{t(`install.${k}`)}</li>
      ))}
    </ol>
  )
  Steps.propTypes = { keys: PropTypes.arrayOf(PropTypes.string).isRequired }

  const deviceName = t(`install.device_${current}`)

  function renderAndroid() {
    if (!links.web && !links.apk) return <p className={styles.note}>{t('install.not_available', { device: deviceName })}</p>
    return (
      <>
        {links.web && (
          <section className={styles.block}>
            <h3 className={styles.h}>{t('install.pwa_heading')}</h3>
            <Steps keys={['android_1', 'android_2']} />
            {isHere && detected.pwa === 'unknown' && (
              <p className={styles.warn}>{t(links.apk ? 'install.android_unknown_browser_apk' : 'install.android_unknown_browser')}</p>
            )}
          </section>
        )}
        {links.apk && (
          <section className={styles.block}>
            <h3 className={styles.h}>{links.web ? t('install.apk_heading_alt') : t('install.apk_heading')}</h3>
            <Steps keys={['apk_1', 'apk_2', 'apk_3']} />
            <Button variant={links.web ? 'secondary' : 'cta'} onClick={onApk} className={styles.dl}>
              {t('app_detail.download')}
              {app.apkSizeMb ? <span className={styles.size}>{sizeMb(app.apkSizeMb)}</span> : null}
            </Button>
          </section>
        )}
      </>
    )
  }

  function renderIos() {
    if (!links.web) {
      return <p className={styles.note}>{t(links.apk ? 'install.not_android' : 'install.not_available', { device: deviceName })}</p>
    }
    return (
      <section className={styles.block}>
        <h3 className={styles.h}>{t('install.pwa_heading')}</h3>
        <Steps keys={['ios_1', 'ios_2']} />
        {isHere && detected.pwa === 'safari-only' && <p className={styles.warn}>{t('install.ios_not_safari')}</p>}
      </section>
    )
  }

  function renderPc() {
    if (!links.web && !links.desktop) {
      return <p className={styles.note}>{t(links.apk ? 'install.not_android' : 'install.not_available', { device: deviceName })}</p>
    }
    return (
      <>
        {links.web && (
          <section className={styles.block}>
            <h3 className={styles.h}>{t('install.pwa_heading')}</h3>
            <Steps keys={['pc_1', 'pc_2']} />
            {isHere && detected.pwa === 'no' && <p className={styles.warn}>{t('install.pc_unsupported')}</p>}
          </section>
        )}
        {links.desktop && (
          <section className={styles.block}>
            <h3 className={styles.h}>{t('install.desktop_heading')}</h3>
            <Steps keys={['desktop_1']} />
            <Button variant={links.web ? 'secondary' : 'cta'} href={links.desktop} className={styles.dl}>
              {t('install.download_desktop')}
            </Button>
          </section>
        )}
      </>
    )
  }

  const body = { android: renderAndroid, ios: renderIos, pc: renderPc }[current]()

  return (
    <div className={styles.wrap}>
      <p className={styles.intro}>{t(links.web ? 'install.intro_pwa' : 'install.intro_apk')}</p>

      {devices.length > 1 && (
        <div className={styles.tabs} role="tablist" aria-label={t('onboarding.devices_title')}>
          {devices.map((d) => (
            <Chip key={d} active={d === current} onClick={() => setActive(d)}>
              {t(`onboarding.${d}`)}
            </Chip>
          ))}
        </div>
      )}
      {devices.length === 1 && <p className="eyebrow">{t('install.on_device', { device: deviceName })}</p>}

      {body}

      {links.web && <p className={styles.note}>{t('install.no_install_ok')}</p>}

      <button type="button" className={styles.change} onClick={onChangeDevice}>
        {t('install.change_device')}
      </button>
    </div>
  )
}

InstallGuide.propTypes = {
  app: PropTypes.object.isRequired,
  onApk: PropTypes.func.isRequired,
  onChangeDevice: PropTypes.func.isRequired,
}
