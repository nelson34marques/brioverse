import { useState } from 'react'
import Container from '../../components/layout/Container.jsx'
import Button from '../../components/ui/Button.jsx'
import { Notice } from '../../components/ui/Field.jsx'
import AppForm from '../../components/dev/AppForm.jsx'
import VerifyEmailNotice from '../../components/auth/VerifyEmailNotice.jsx'
import { useT } from '../../hooks/useT.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useDev } from '../../hooks/useDev.js'
import { EMPTY_APP, createApp } from '../../lib/publish.js'
import { isFirebaseConfigured } from '../../lib/firebase.js'
import styles from './Dev.module.css'

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 5 5L20 7" />
    </svg>
  )
}

/** Publicar app: formulário único (ver AppForm). Fica pendente até o admin aprovar. */
export default function DevPublish() {
  const { t } = useT()
  const { user, emailVerified } = useAuth()
  const { developer, setApps } = useDev()
  const [sent, setSent] = useState(null)
  const [formKey, setFormKey] = useState(0)

  async function submit(f) {
    const app = await createApp(user, developer, f)
    setApps((l) => [app, ...l])
    setSent(app)
    window.scrollTo({ top: 0 })
  }

  if (sent) {
    return (
      <Container className={styles.page}>
        <section className={`${styles.card} ${styles.success}`}>
          <span className={styles.successIcon}>
            <CheckIcon />
          </span>
          <h1 className={styles.h2}>{t('dev.publish_sent_title')}</h1>
          <p className={styles.hint}>{t('dev.publish_sent', { app: sent.title })}</p>
          <div className={styles.chips}>
            <Button variant="cta" to="/dev/apps">
              {t('dev.my_apps')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSent(null)
                setFormKey((k) => k + 1)
              }}
            >
              {t('dev.publish_another')}
            </Button>
          </div>
        </section>
      </Container>
    )
  }

  return (
    <Container className={styles.page}>
      <header className={styles.header}>
        <span className="eyebrow">{t('dev.eyebrow')}</span>
        <h1 className={styles.title}>{t('dev.publish_title')}</h1>
        <p className={styles.intro}>{t('dev.publish_intro')}</p>
      </header>

      {!isFirebaseConfigured && <Notice tone="warning">{t('dev.publish_not_configured')}</Notice>}
      <VerifyEmailNotice reasonKey="auth.verify_publish" />

      {emailVerified && <AppForm key={formKey} mode="create" initial={EMPTY_APP} cancelTo="/dev/apps" onSubmit={submit} />}
    </Container>
  )
}
