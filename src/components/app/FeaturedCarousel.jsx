import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import HScroll from '../ui/HScroll.jsx'
import AppIcon from './AppIcon.jsx'
import { useT } from '../../hooks/useT.js'
import styles from './FeaturedCarousel.module.css'

/** Cards editoriais (estilo "Today" da App Store): imagem, legenda, título grande, faixa com o app. */
export default function FeaturedCarousel({ apps, loading = false }) {
  const { t } = useT()
  if (!loading && apps.length === 0) return null

  return (
    <HScroll layout="featured" gap="lg" autoplay={6000} className={styles.row}>
      {loading
        ? Array.from({ length: 3 }, (_, i) => <div key={i} className={`${styles.card} ${styles.skeleton}`} />)
        : apps.map((app, i) => {
            // Apps publicados pelo formulário não têm banner: usa a 1.ª captura, senão o ícone ampliado e desfocado.
            const art = app.bannerUrl || app.screenshots?.[0] || ''
            const icon = !art && app.iconUrl
            return (
            <Link key={app.id} to={`/app/${app.id}`} className={styles.card} style={{ '--accent-art': app.color || 'var(--accent)' }}>
              <div className={styles.art}>
                {art ? <img src={art} alt="" loading={i === 0 ? 'eager' : 'lazy'} referrerPolicy="no-referrer" /> : null}
                {icon ? <img className={styles.artIconBg} src={app.iconUrl} alt="" loading="lazy" referrerPolicy="no-referrer" /> : null}
                {icon ? <img className={styles.artIcon} src={app.iconUrl} alt="" loading="lazy" referrerPolicy="no-referrer" /> : null}
                <div className={styles.overlay}>
                  <span className={styles.kicker}>{app.featuredLabel || t(`categories.${app.category}`)}</span>
                  <span className={styles.headline}>{app.featuredTitle || app.title}</span>
                  <span className={styles.tagline}>{app.shortDescription}</span>
                </div>
              </div>
              <div className={styles.strip}>
                <AppIcon app={app} size={44} />
                <span className={styles.stripText}>
                  <span className={styles.stripTitle}>{app.title}</span>
                  <span className={styles.stripSub}>{app.developerName}</span>
                </span>
                <span className={styles.get}>{app.type === 'apk' ? t('app_detail.download_short') : t('app_detail.open_short')}</span>
              </div>
            </Link>
            )
          })}
    </HScroll>
  )
}

FeaturedCarousel.propTypes = {
  apps: PropTypes.array.isRequired,
  loading: PropTypes.bool,
}
