import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Container from '../../components/layout/Container.jsx'
import Button from '../../components/ui/Button.jsx'
import { Notice } from '../../components/ui/Field.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import AppForm from '../../components/dev/AppForm.jsx'
import VerifyEmailNotice from '../../components/auth/VerifyEmailNotice.jsx'
import { useT } from '../../hooks/useT.js'
import { useDev } from '../../hooks/useDev.js'
import { useAuth } from '../../hooks/useAuth.js'
import { formFromApp, updateApp } from '../../lib/publish.js'
import styles from './Dev.module.css'

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 5 5L20 7" />
    </svg>
  )
}

/**
 * Actualizar app (/dev/apps/:id): mesmo formulário de Publicar, com a versão e as novidades.
 * Mudar a versão (ou escrever novidades) cria uma release e avisa quem tem o app.
 */
export default function DevEdit() {
  const { t } = useT()
  const { id } = useParams()
  const { apps, appsLoading, setApps } = useDev()
  const { emailVerified } = useAuth()
  const [saved, setSaved] = useState(null) // { app, newVersion }
  const app = apps.find((a) => a.id === id)

  async function submit(f) {
    const next = await updateApp(app, f)
    setApps((l) => l.map((a) => (a.id === next.id ? next : a)))
    setSaved({ app: next, newVersion: next.versionCode !== app.versionCode })
    window.scrollTo({ top: 0 })
  }

  if (appsLoading) {
    return (
      <Container className={styles.page}>
        <p className="muted">{t('common.loading')}</p>
      </Container>
    )
  }

  if (!app) {
    return (
      <Container className={styles.page}>
        <Notice tone="danger">{t('dev.app_not_found')}</Notice>
        <div>
          <Button variant="secondary" to="/dev/apps">
            {t('dev.my_apps')}
          </Button>
        </div>
      </Container>
    )
  }

  if (saved) {
    return (
      <Container className={styles.page}>
        <section className={`${styles.card} ${styles.success}`}>
          <span className={styles.successIcon}>
            <CheckIcon />
          </span>
          <h1 className={styles.h2}>{t('dev.edit_sent_title')}</h1>
          <p className={styles.hint}>{saved.newVersion ? t('dev.edit_sent', { app: saved.app.title, v: saved.app.version }) : t('dev.edit_sent_same', { app: saved.app.title })}</p>
          <div className={styles.chips}>
            <Button variant="cta" to="/dev/apps">
              {t('dev.my_apps')}
            </Button>
            {saved.app.status === 'approved' && (
              <Button variant="secondary" to={`/app/${saved.app.id}`}>
                {t('dev.view_in_store')}
              </Button>
            )}
          </div>
        </section>
      </Container>
    )
  }

  return (
    <Container className={styles.page}>
      <header className={styles.header}>
        <span className="eyebrow">{t('dev.eyebrow')}</span>
        <h1 className={styles.title}>{t('dev.edit_title')}</h1>
        <p className={styles.intro}>{t('dev.edit_intro')}</p>
        <div className={styles.badges}>
          <StatusBadge status={app.status} />
          <span className="muted">{t('dev.version_short', { v: app.version })}</span>
        </div>
      </header>

      {app.status === 'disabled' && (
        <Notice tone="danger">
          {t('dev.edit_disabled')} {app.disabledReason && <strong>{app.disabledReason}</strong>}
        </Notice>
      )}
      {app.status === 'rejected' && <Notice tone="warning">{t('dev.edit_rejected')}</Notice>}
      <VerifyEmailNotice reasonKey="auth.verify_publish" />

      {app.status !== 'disabled' && emailVerified && <AppForm mode="edit" initial={formFromApp(app)} current={app} cancelTo="/dev/apps" onSubmit={submit} />}
    </Container>
  )
}
