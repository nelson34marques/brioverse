import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import HScroll from '../ui/HScroll.jsx'
import AppIcon from './AppIcon.jsx'
import Rating from './Rating.jsx'
import { useT } from '../../hooks/useT.js'
import styles from './StackedRow.module.css'

/**
 * Lista empilhada (estilo App Store "Top Apps"): colunas de 3 apps, numeradas,
 * cada linha com ícone, nome, criador e botão "Obter".
 */
export default function StackedRow({ eyebrow, title, to, apps, numbered = true, loading = false }) {
  const { t } = useT()
  if (!loading && apps.length === 0) return null

  const columns = []
  for (let i = 0; i < apps.length; i += 3) columns.push(apps.slice(i, i + 3))

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2 className={styles.title}>{title}</h2>
        </div>
        {to && (
          <Link to={to} className={styles.more}>
            {t('common.see_all')}
          </Link>
        )}
      </header>

      <HScroll layout="featured" gap="lg">
        {loading
          ? Array.from({ length: 3 }, (_, c) => (
              <div key={c} className={styles.column}>
                {[0, 1, 2].map((r) => (
                  <div key={r} className={styles.skeleton} />
                ))}
              </div>
            ))
          : columns.map((col, c) => (
              <div key={c} className={styles.column}>
                {col.map((app, r) => (
                  <Link key={app.id} to={`/app/${app.id}`} className={styles.item}>
                    {numbered && <span className={styles.num}>{c * 3 + r + 1}</span>}
                    <AppIcon app={app} size={64} />
                    <span className={styles.body}>
                      <span className={styles.name}>{app.title}</span>
                      <span className={styles.sub}>{app.shortDescription || app.developerName}</span>
                      <Rating value={app.stats.ratingAvg} />
                    </span>
                    <span className={styles.get}>{app.type === 'apk' ? t('app_detail.download_short') : t('app_detail.open_short')}</span>
                  </Link>
                ))}
              </div>
            ))}
      </HScroll>
    </section>
  )
}

StackedRow.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  to: PropTypes.string,
  apps: PropTypes.array.isRequired,
  numbered: PropTypes.bool,
  loading: PropTypes.bool,
}
