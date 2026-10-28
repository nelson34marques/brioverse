import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import AppIcon from './AppIcon.jsx'
import Rating from './Rating.jsx'
import styles from './AppCard.module.css'

/** Card vertical sem caixa, como o Google Play: ícone, nome, criador, rating. */
export default function AppCard({ app }) {
  return (
    <Link to={`/app/${app.id}`} className={styles.card}>
      <AppIcon app={app} size={128} className={styles.icon} />
      <span className={styles.title}>{app.title}</span>
      <span className={styles.sub}>{app.developerName}</span>
      <span className={styles.meta}>
        <Rating value={app.stats.ratingAvg} />
      </span>
    </Link>
  )
}

AppCard.propTypes = {
  app: PropTypes.object.isRequired,
}
