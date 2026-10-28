import { useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../../components/layout/Container.jsx'
import Button from '../../components/ui/Button.jsx'
import Modal from '../../components/ui/Modal.jsx'
import AppIcon from '../../components/app/AppIcon.jsx'
import { Notice } from '../../components/ui/Field.jsx'
import { StatusBadge, VerifiedBadge } from '../../components/ui/StatusBadge.jsx'
import { useT } from '../../hooks/useT.js'
import { useDev } from '../../hooks/useDev.js'
import { deleteApp, setAppPaused } from '../../lib/publish.js'
import { compactNumber, rating1 } from '../../utils/format.js'
import styles from './Dev.module.css'

/**
 * Os meus apps: todos os estados, com motivo quando desactivado.
 * Acções do criador: Actualizar (nova versão), Pausar/Retomar (sai/volta à loja) e Eliminar.
 */
export default function DevApps() {
  const { t, lang } = useT()
  const { apps, appsLoading, setApps } = useDev()
  const [toDelete, setToDelete] = useState(null)
  const [busy, setBusy] = useState('') // id em acção
  const [fail, setFail] = useState('')
  const list = [...apps].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))

  async function run(app, fn) {
    setBusy(app.id)
    setFail('')
    try {
      await fn()
    } catch (err) {
      console.warn('[brioverse] acção falhou:', err?.code || err?.message)
      setFail(t('dev.err_generic'))
    }
    setBusy('')
  }

  const pause = (app, paused) =>
    run(app, async () => {
      const next = await setAppPaused(app, paused)
      setApps((l) => l.map((a) => (a.id === next.id ? next : a)))
    })

  const remove = (app) =>
    run(app, async () => {
      await deleteApp(app)
      setApps((l) => l.filter((a) => a.id !== app.id))
      setToDelete(null)
    })

  return (
    <Container className={styles.page}>
      <header className={`${styles.header} ${styles.headRow}`}>
        <div>
          <span className="eyebrow">{t('dev.eyebrow')}</span>
          <h1 className={styles.title}>{t('dev.my_apps')}</h1>
        </div>
        <Button variant="cta" to="/dev/publicar">
          {t('dev.new_app')}
        </Button>
      </header>

      {fail && <Notice tone="danger">{fail}</Notice>}

      {appsLoading ? (
        <p className="muted">{t('common.loading')}</p>
      ) : list.length === 0 ? (
        <section className={styles.card}>
          <p className={styles.hint}>{t('dev.no_apps')}</p>
          <p className={styles.hint}>{t('dev.no_apps_hint')}</p>
        </section>
      ) : (
        <ul className={styles.apps}>
          {list.map((a) => (
            <li key={a.id} className={`${styles.appRow} ${styles.appRowCard} ${styles.appRowWrap}`}>
              <AppIcon app={a} size={56} />
              <div className={styles.appBody}>
                <span className={styles.appTitle}>
                  {a.status === 'approved' ? <Link to={`/app/${a.id}`}>{a.title}</Link> : a.title}
                  <StatusBadge status={a.status} />
                  {a.verified && <VerifiedBadge />}
                  {a.featured && <span className="muted">· {t('status.featured')}</span>}
                </span>
                <span className={styles.appSub}>
                  {t('dev.version_short', { v: a.version })} · {t(`categories.${a.category}`)} · {a.type === 'apk' ? 'APK' : t('search.pwa_short')} ·{' '}
                  {t('dev.views', { n: compactNumber(a.stats.views, lang) })} · {t('dev.clicks', { n: compactNumber(a.stats.clicks, lang) })} ·{' '}
                  {a.stats.ratingCount ? `${rating1(a.stats.ratingAvg)} ★ (${a.stats.ratingCount})` : t('reviews.none_short')}
                </span>
                {a.status === 'pending' && <span className={styles.appSub}>{t('dev.status_pending_hint')}</span>}
                {a.status === 'paused' && <span className={styles.appSub}>{t('dev.paused_hint')}</span>}
                {a.status === 'disabled' && a.disabledReason && (
                  <span className={styles.reason}>
                    {t('dev.disabled_reason')}: {a.disabledReason}
                  </span>
                )}
              </div>
              <div className={styles.appActions}>
                {a.status !== 'disabled' && (
                  <Button variant="secondary" size="sm" to={`/dev/apps/${a.id}`}>
                    {t('dev.update')}
                  </Button>
                )}
                {a.status === 'approved' && (
                  <Button variant="ghost" size="sm" disabled={busy === a.id} onClick={() => pause(a, true)}>
                    {t('dev.pause')}
                  </Button>
                )}
                {a.status === 'paused' && (
                  <Button variant="ghost" size="sm" disabled={busy === a.id} onClick={() => pause(a, false)}>
                    {t('dev.resume')}
                  </Button>
                )}
                <Button variant="ghost" size="sm" className={styles.dangerBtn} disabled={busy === a.id} onClick={() => setToDelete(a)}>
                  {t('dev.delete')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title={toDelete ? t('dev.delete_title', { app: toDelete.title }) : ''}
        footer={
          <>
            <Button variant="cta" className={styles.dangerCta} disabled={Boolean(busy)} onClick={() => toDelete && remove(toDelete)}>
              {busy ? t('common.loading') : t('dev.delete_confirm')}
            </Button>
            <Button variant="ghost" onClick={() => setToDelete(null)} disabled={Boolean(busy)}>
              {t('common.cancel')}
            </Button>
          </>
        }
      >
        <p>{t('dev.delete_text')}</p>
      </Modal>
    </Container>
  )
}
