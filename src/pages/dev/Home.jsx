import { Link } from 'react-router-dom'
import Container from '../../components/layout/Container.jsx'
import Button from '../../components/ui/Button.jsx'
import AppIcon from '../../components/app/AppIcon.jsx'
import { Notice } from '../../components/ui/Field.jsx'
import { StatusBadge, VerifiedBadge } from '../../components/ui/StatusBadge.jsx'
import { useT } from '../../hooks/useT.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useDev } from '../../hooks/useDev.js'
import { compactNumber, rating1 } from '../../utils/format.js'
import styles from './Dev.module.css'

/** Entrada do modo dev sem conta aprovada: estado da candidatura e o que fazer a seguir. */
function Gate() {
  const { t } = useT()
  const { developer } = useDev()
  return (
    <Container className={styles.page}>
      <header className={styles.header}>
        <span className="eyebrow">{t('dev.eyebrow')}</span>
        <h1 className={styles.title}>{t('account.dev')}</h1>
        {developer && (
          <div className={styles.badges}>
            <StatusBadge status={developer.status} />
          </div>
        )}
      </header>
      <section className={styles.card}>
        {!developer && (
          <>
            <p className={styles.hint}>{t('account.dev_intro')}</p>
            <div>
              <Button variant="cta" to="/dev/candidatura">
                {t('account.dev_apply')}
              </Button>
            </div>
          </>
        )}
        {developer?.status === 'pending' && (
          <>
            <Notice tone="info">{t('account.dev_pending')}</Notice>
            <div>
              <Button variant="secondary" to="/dev/candidatura">
                {t('account.dev_view')}
              </Button>
            </div>
          </>
        )}
        {developer?.status === 'rejected' && (
          <>
            <Notice tone="danger">
              {t('account.dev_rejected')} {developer.note && <strong>{developer.note}</strong>}
            </Notice>
            <div>
              <Button variant="cta" to="/dev/candidatura">
                {t('account.dev_resubmit')}
              </Button>
            </div>
          </>
        )}
        {developer?.status === 'revoked' && (
          <Notice tone="danger">
            {t('account.dev_revoked')} {developer.note && <strong>{developer.note}</strong>}
          </Notice>
        )}
        <div>
          <Button variant="ghost" to="/conta">
            {t('devnav.exit')}
          </Button>
        </div>
      </section>
    </Container>
  )
}

/** Início do modo dev: números, avisos por ler e os últimos apps. */
export default function DevHome() {
  const { t, lang } = useT()
  const { profile, user } = useAuth()
  const { developer, loading, active, apps, appsLoading, unread } = useDev()

  if (loading) {
    return (
      <Container className={styles.page}>
        <p className="muted">{t('common.loading')}</p>
      </Container>
    )
  }
  if (!active) return <Gate />

  const name = developer?.name || profile?.name || user?.displayName || ''
  const live = apps.filter((a) => a.status === 'approved')
  const views = apps.reduce((s, a) => s + (a.stats.views || 0), 0)
  const clicks = apps.reduce((s, a) => s + (a.stats.clicks || 0), 0)
  const rated = apps.filter((a) => a.stats.ratingCount > 0)
  const avg = rated.length ? rated.reduce((s, a) => s + a.stats.ratingAvg * a.stats.ratingCount, 0) / rated.reduce((s, a) => s + a.stats.ratingCount, 0) : 0
  const latest = [...apps].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 3)

  return (
    <Container className={styles.page}>
      <header className={styles.header}>
        <span className="eyebrow">{t('dev.eyebrow')}</span>
        <h1 className={styles.title}>{t('dev.hello', { name })}</h1>
        <div className={styles.badges}>
          {developer && <StatusBadge status={developer.status} />}
          {developer?.verified && <VerifiedBadge />}
        </div>
      </header>

      <ul className={styles.stats}>
        <li className={styles.stat}>
          <strong>{live.length}</strong>
          <span>{t('dev.stat_apps')}</span>
        </li>
        <li className={styles.stat}>
          <strong>{compactNumber(views, lang)}</strong>
          <span>{t('dev.stat_views')}</span>
        </li>
        <li className={styles.stat}>
          <strong>{compactNumber(clicks, lang)}</strong>
          <span>{t('dev.stat_clicks')}</span>
        </li>
        <li className={styles.stat}>
          <strong>{rating1(avg)}</strong>
          <span>{t('dev.stat_rating')}</span>
        </li>
      </ul>

      {unread > 0 && (
        <Notice tone="info">
          {t('dev.unread', { n: unread })} <Link to="/dev/avisos">{t('devnav.notices')}</Link>
        </Notice>
      )}

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.h2}>{t('dev.latest')}</h2>
          {apps.length > 0 && (
            <Link to="/dev/apps" className={styles.linkBtn}>
              {t('dev.see_all')}
            </Link>
          )}
        </div>
        {appsLoading ? (
          <p className="muted">{t('common.loading')}</p>
        ) : latest.length ? (
          <ul className={styles.apps}>
            {latest.map((a) => (
              <li key={a.id} className={styles.appRow}>
                <AppIcon app={a} size={48} />
                <div className={styles.appBody}>
                  <span className={styles.appTitle}>
                    {a.title}
                    <StatusBadge status={a.status} />
                  </span>
                  <span className={styles.appSub}>
                    {t(`categories.${a.category}`)} · {t('dev.views', { n: compactNumber(a.stats.views, lang) })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <p className={styles.hint}>{t('dev.no_apps')}</p>
            <div>
              <Button variant="cta" to="/dev/publicar">
                {t('dev.no_apps_cta')}
              </Button>
            </div>
          </>
        )}
      </section>
    </Container>
  )
}
