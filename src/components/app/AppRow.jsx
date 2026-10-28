import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import HScroll from '../ui/HScroll.jsx'
import AppCard from './AppCard.jsx'
import { useT } from '../../hooks/useT.js'
import styles from './AppRow.module.css'

/** Secção com título grande + "Ver tudo" e fila de cards (estilo Play). */
export default function AppRow({ eyebrow, title, subtitle, to, apps, loading = false }) {
  const { t } = useT()
  if (!loading && apps.length === 0) return null

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div className={styles.titles}>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {to && (
          <Link to={to} className={styles.more}>
            {t('common.see_all')}
          </Link>
        )}
      </header>

      <HScroll layout="apps" gap="lg">
        {loading
          ? Array.from({ length: 8 }, (_, i) => <div key={i} className={styles.skeleton} />)
          : apps.map((app) => <AppCard key={app.id} app={app} />)}
      </HScroll>
    </section>
  )
}

AppRow.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  to: PropTypes.string,
  apps: PropTypes.array.isRequired,
  loading: PropTypes.bool,
}
