import { useState } from 'react'
import PropTypes from 'prop-types'
import Button from '../ui/Button.jsx'
import Modal from '../ui/Modal.jsx'
import InstallGuide from './InstallGuide.jsx'
import { useT } from '../../hooks/useT.js'
import { usePrefs } from '../../hooks/usePrefs.js'
import { useLibrary } from '../../hooks/useLibrary.js'
import { appLinks } from '../../lib/device.js'
import { trackClick } from '../../lib/stats.js'
import { sizeMb } from '../../utils/format.js'
import styles from './ActionButton.module.css'

/**
 * Botões principais da página do app: Abrir (PWA) ou Baixar (APK, com aviso),
 * e "Como instalar", que mostra o guia certo para os dispositivos da pessoa.
 */
export default function ActionButton({ app }) {
  const { t } = useT()
  const { openOnboarding } = usePrefs()
  const { add: addToLibrary } = useLibrary()
  // como na Play Store: abrir/baixar conta como "ter" o app → entra na biblioteca e recebe avisos de versão nova
  const got = () => {
    trackClick(app.id)
    addToLibrary(app)
  }
  const [modal, setModal] = useState(null) // 'install' | 'apk' | null
  const links = appLinks(app)
  const isApk = app.type === 'apk'

  return (
    <div className={styles.wrap}>
      {isApk ? (
        <Button variant="cta" size="lg" className={styles.main} onClick={() => setModal('apk')}>
          {t('app_detail.download')}
          {app.apkSizeMb && <span className={styles.sub}>{sizeMb(app.apkSizeMb)}</span>}
        </Button>
      ) : (
        <Button variant="cta" size="lg" className={styles.main} href={app.appUrl} onClick={got}>
          {t('app_detail.open')}
        </Button>
      )}

      <Button variant="secondary" size="lg" onClick={() => setModal('install')}>
        {t('app_detail.install')}
      </Button>

      <Modal
        open={modal === 'install'}
        onClose={() => setModal(null)}
        title={t('install.title')}
        footer={
          links.web ? (
            <Button
              variant="cta"
              href={links.web}
              onClick={() => {
                got()
                setModal(null)
              }}
            >
              {t('app_detail.open')}
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setModal(null)}>
              {t('common.close')}
            </Button>
          )
        }
      >
        <InstallGuide
          app={app}
          onApk={() => setModal('apk')}
          onChangeDevice={() => {
            setModal(null)
            openOnboarding()
          }}
        />
      </Modal>

      <Modal
        open={modal === 'apk'}
        onClose={() => setModal(null)}
        title={t('apk_warning.title')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="cta"
              href={links.apk}
              onClick={() => {
                got()
                setModal(null)
              }}
            >
              {t('apk_warning.confirm')}
            </Button>
          </>
        }
      >
        <p>{t('apk_warning.p1')}</p>
        <p>{t('apk_warning.p2')}</p>
        <p className="muted">
          {app.version && (
            <>
              {t('app_detail.version')}: {app.version}
              <br />
            </>
          )}
          {app.apkSizeMb && (
            <>
              {t('app_detail.size')}: {sizeMb(app.apkSizeMb)}
            </>
          )}
        </p>
      </Modal>
    </div>
  )
}

ActionButton.propTypes = {
  app: PropTypes.object.isRequired,
}
