import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import AppIcon from './AppIcon.jsx'
import Rating from './Rating.jsx'
import { useT } from '../../hooks/useT.js'
import { sizeMb } from '../../utils/format.js'
import styles from './AppListItem.module.css'

/** Linha horizontal: ícone à esquerda, texto, acção à direita (listas e pesquisa). */
export default function AppListItem({ app }) {
  const { t } = useT()
  const typeLabel = app.type === 'apk' ? 'APK' : t('search.pwa_short')
  const extra = app.type === 'apk' ? sizeMb(app.apkSizeMb) : null

  return (
    <Link to={`/app/${app.id}`} className={styles.item}>
      <AppIcon app={app} size={64} />
      <span className={styles.body}>
        <span className={styles.title}>{app.title}</span>
        <span className={styles.sub}>
          {app.developerName}
          <span aria-hidden="true"> · </span>
          {t(`categories.${app.category}`)}
        </span>
        <span className={styles.meta}>
          <Rating value={app.stats.ratingAvg} />
          <span aria-hidden="true">·</span>
          <span>{typeLabel}</span>
          {extra && (
            <>
              <span aria-hidden="true">·</span>
              <span>{extra}</span>
            </>
          )}
        </span>
      </span>
      <span className={styles.action}>{app.type === 'apk' ? t('app_detail.download_short') : t('app_detail.open_short')}</span>
    </Link>
  )
}

AppListItem.propTypes = {
  app: PropTypes.object.isRequired,
}
