import Container from '../../components/layout/Container.jsx'
import AppIcon from '../../components/app/AppIcon.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import { useT } from '../../hooks/useT.js'
import { useDev } from '../../hooks/useDev.js'
import { compactNumber, rating1 } from '../../utils/format.js'
import styles from './Dev.module.css'

const pct = (n, d) => (d ? `${Math.round((n / d) * 1000) / 10}%` : '–')

/** Análise: totais e números por app (visualizações, cliques, taxa de clique, avaliações). */
export default function DevAnalytics() {
  const { t, lang } = useT()
  const { apps, appsLoading } = useDev()
  const views = apps.reduce((s, a) => s + (a.stats.views || 0), 0)
  const clicks = apps.reduce((s, a) => s + (a.stats.clicks || 0), 0)
  const ratings = apps.reduce((s, a) => s + (a.stats.ratingCount || 0), 0)
  const avg = ratings ? apps.reduce((s, a) => s + a.stats.ratingAvg * a.stats.ratingCount, 0) / ratings : 0
  const max = Math.max(1, ...apps.map((a) => a.stats.views || 0))
  const rows = [...apps].sort((a, b) => (b.stats.views || 0) - (a.stats.views || 0))

  return (
    <Container className={styles.page}>
      <header className={styles.header}>
        <span className="eyebrow">{t('dev.eyebrow')}</span>
        <h1 className={styles.title}>{t('dev.analytics_title')}</h1>
        <p className={styles.intro}>{t('dev.analytics_intro')}</p>
      </header>

      <ul className={styles.stats}>
        <li className={styles.stat}>
          <strong>{compactNumber(views, lang)}</strong>
          <span>{t('dev.stat_views')}</span>
        </li>
        <li className={styles.stat}>
          <strong>{compactNumber(clicks, lang)}</strong>
          <span>{t('dev.stat_clicks')}</span>
        </li>
        <li className={styles.stat}>
          <strong>{pct(clicks, views)}</strong>
          <span>{t('dev.ctr')}</span>
        </li>
        <li className={styles.stat}>
          <strong>{rating1(avg)}</strong>
          <span>{t('dev.stat_rating_n', { n: ratings })}</span>
        </li>
      </ul>

      <section className={styles.card}>
        <h2 className={styles.h2}>{t('dev.per_app')}</h2>
        {appsLoading ? (
          <p className="muted">{t('common.loading')}</p>
        ) : rows.length === 0 ? (
          <p className={styles.hint}>{t('dev.no_data')}</p>
        ) : (
          <ul className={styles.rows}>
            {rows.map((a) => (
              <li key={a.id} className={styles.arow}>
                <AppIcon app={a} size={40} />
                <div className={styles.arowBody}>
                  <span className={styles.appTitle}>
                    {a.title}
                    <StatusBadge status={a.status} />
                  </span>
                  <span className={styles.bar} aria-hidden="true">
                    <span className={styles.barFill} style={{ width: `${Math.max(2, ((a.stats.views || 0) / max) * 100)}%` }} />
                  </span>
                  <span className={styles.arowMeta}>
                    <span>
                      <strong>{compactNumber(a.stats.views, lang)}</strong> {t('dev.stat_views').toLowerCase()}
                    </span>
                    <span>
                      <strong>{compactNumber(a.stats.clicks, lang)}</strong> {t('dev.stat_clicks').toLowerCase()}
                    </span>
                    <span>
                      <strong>{pct(a.stats.clicks, a.stats.views)}</strong> {t('dev.ctr').toLowerCase()}
                    </span>
                    <span>
                      <strong>{a.stats.ratingCount ? rating1(a.stats.ratingAvg) : '–'}</strong> ★ ({a.stats.ratingCount || 0})
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className={styles.hint}>{t('dev.analytics_note')}</p>
      </section>
    </Container>
  )
}
