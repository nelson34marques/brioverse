import { useEffect, useRef, useState } from 'react'
import Container from '../../components/layout/Container.jsx'
import Chip from '../../components/ui/Chip.jsx'
import { Notice } from '../../components/ui/Field.jsx'
import AppsTab from './AppsTab.jsx'
import ApplicationsTab from './ApplicationsTab.jsx'
import DevsTab from './DevsTab.jsx'
import { useT } from '../../hooks/useT.js'
import { useAuth } from '../../hooks/useAuth.js'
import { isFirebaseConfigured } from '../../lib/firebase.js'
import {
  listAllApps,
  listDevelopers,
  disableApp,
  enableApp,
  approveApp,
  setFeatured,
  setBoost,
  reviewApplication,
  revokeDeveloper,
  restoreDeveloper,
  setDeveloperVerified,
} from '../../lib/admin.js'
import styles from './Admin.module.css'

const TABS = ['apps', 'applications', 'devs']

/**
 * Painel de administração (/admin, role admin).
 * Apps: destacar, impulso no ranking, desactivar (com motivo enviado ao criador), aprovar.
 * Candidaturas: aprovar/recusar pedidos de conta dev. Desenvolvedores: verificar, revogar, repor.
 */
export default function Moderation() {
  const { t } = useT()
  const { user } = useAuth()
  const [tab, setTab] = useState('apps')
  const [apps, setApps] = useState([])
  const [devs, setDevs] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const timer = useRef(null)

  useEffect(() => {
    let alive = true
    Promise.all([listAllApps(), listDevelopers()])
      .then(([a, d]) => {
        if (!alive) return
        setApps(a)
        setDevs(d)
      })
      .catch((err) => {
        console.warn('[brioverse] admin: leitura falhou:', err?.code || err?.message)
        if (alive) setToast({ ok: false, text: t('admin.error') })
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
      clearTimeout(timer.current)
    }
  }, [t])

  const by = user?.uid || ''

  function say(ok, key) {
    setToast({ ok, text: t(key) })
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(null), 2500)
  }

  const replaceApp = (next) => setApps((l) => l.map((a) => (a.id === next.id ? { ...a, ...next } : a)))
  const replaceDev = (next) => setDevs((l) => l.map((d) => (d.uid === next.uid ? { ...d, ...next } : d)))

  /** Executa a acção, aplica o resultado ao estado local e mostra o resultado. Devolve true se correu bem. */
  async function run(promise, apply) {
    try {
      const result = await promise
      apply(result)
      say(true, 'admin.saved')
      return true
    } catch (err) {
      console.warn('[brioverse] admin: acção falhou:', err?.code || err?.message)
      say(false, 'admin.error')
      return false
    }
  }

  const appActions = {
    approve: (app) => run(approveApp(app, by, devs.find((d) => d.uid === app.developerId)?.verified ?? false), replaceApp),
    feature: (app) => run(setFeatured(app, !app.featured), replaceApp),
    boost: (app, n) => run(setBoost(app, n), replaceApp),
    enable: (app) => run(enableApp(app, by), replaceApp),
    disable: (app, reason) => run(disableApp(app, reason, by), replaceApp),
  }

  const devActions = {
    review: (dev, decision, note) => run(reviewApplication(dev, decision, note, by), replaceDev),
    revoke: (dev, note) => run(revokeDeveloper(dev, note, by), replaceDev),
    restore: (dev) => run(restoreDeveloper(dev, by), replaceDev),
    verify: (dev, verified) =>
      run(setDeveloperVerified(dev, verified, by), (next) => {
        replaceDev(next)
        setApps((l) => l.map((a) => (a.developerId === next.uid ? { ...a, verified: next.verified } : a)))
      }),
  }

  const counts = {
    active: apps.filter((a) => a.status === 'approved').length,
    disabled: apps.filter((a) => a.status === 'disabled').length,
    pending: devs.filter((d) => d.status === 'pending').length,
    devs: devs.filter((d) => d.status === 'approved').length,
  }

  return (
    <Container className={styles.page}>
      <header className={styles.header}>
        <span className="eyebrow">{t('nav.admin')}</span>
        <h1 className={styles.title}>{t('admin.title')}</h1>
        <ul className={styles.stats}>
          <li className={styles.stat}>
            <strong>{counts.active}</strong> {t('admin.stat_active')}
          </li>
          <li className={styles.stat}>
            <strong>{counts.disabled}</strong> {t('admin.stat_disabled')}
          </li>
          <li className={styles.stat}>
            <strong>{counts.pending}</strong> {t('admin.stat_pending')}
          </li>
          <li className={styles.stat}>
            <strong>{counts.devs}</strong> {t('admin.stat_devs')}
          </li>
        </ul>
      </header>

      {!isFirebaseConfigured && <Notice tone="warning">{t('admin.demo')}</Notice>}

      <div className={styles.tabs} role="tablist">
        {TABS.map((k) => (
          <Chip key={k} outline active={tab === k} onClick={() => setTab(k)}>
            {t(`admin.tab_${k}`)}
            {k === 'applications' && counts.pending ? ` (${counts.pending})` : ''}
          </Chip>
        ))}
      </div>

      <p className={`${styles.toast} ${toast ? (toast.ok ? styles.ok : styles.bad) : ''}`} role="status" aria-live="polite">
        {toast?.text || ''}
      </p>

      {loading ? (
        <p className="muted">{t('common.loading')}</p>
      ) : tab === 'apps' ? (
        <AppsTab apps={apps} devs={devs} actions={appActions} />
      ) : tab === 'applications' ? (
        <ApplicationsTab devs={devs} actions={devActions} />
      ) : (
        <DevsTab devs={devs} actions={devActions} />
      )}
    </Container>
  )
}
