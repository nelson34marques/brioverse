import PropTypes from 'prop-types'
import HScroll from '../ui/HScroll.jsx'
import { Star } from './Rating.jsx'
import { useT } from '../../hooks/useT.js'
import { shortDate } from '../../utils/format.js'
import styles from './Reviews.module.css'

function Avatar({ name, photo }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase()
  return photo ? (
    <img className={styles.avatar} src={photo} alt="" referrerPolicy="no-referrer" />
  ) : (
    <span className={`${styles.avatar} ${styles.avatarFallback}`} aria-hidden="true">
      {initial}
    </span>
  )
}

Avatar.propTypes = { name: PropTypes.string, photo: PropTypes.string }

function ReviewCard({ review: r, mine, onEdit, onDelete, className }) {
  const { t, lang } = useT()
  return (
    <article className={`${styles.item} ${mine ? styles.mine : ''} ${className}`}>
      <div className={styles.head}>
        <Avatar name={r.userName} photo={r.userPhoto} />
        <div className={styles.who}>
          <span className={styles.name}>
            {r.userName}
            {mine && <span className={styles.youTag}>{t('reviews.yours')}</span>}
          </span>
          <span className={styles.meta}>
            <span className={styles.stars} aria-label={`${r.rating}/5`}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={13} filled={i <= r.rating} />
              ))}
            </span>
            <span className={styles.date}>{shortDate(r.updatedAt, lang)}</span>
          </span>
        </div>
        {mine && (
          <span className={styles.ownActions}>
            <button type="button" className={styles.link} onClick={onEdit}>
              {t('reviews.edit_short')}
            </button>
            <button type="button" className={`${styles.link} ${styles.danger}`} onClick={onDelete}>
              {t('reviews.delete')}
            </button>
          </span>
        )}
      </div>
      {r.text && <p className={styles.text}>{r.text}</p>}
    </article>
  )
}

ReviewCard.propTypes = {
  review: PropTypes.object.isRequired,
  mine: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  className: PropTypes.string,
}

/**
 * Comentários: um só ocupa a largura toda; vários aparecem em carrossel
 * horizontal com setas. A avaliação do próprio utilizador vem primeiro.
 */
export default function ReviewList({ reviews, mineId, onEdit, onDelete }) {
  const { t } = useT()

  if (!reviews.length) return <p className={`muted ${styles.empty}`}>{t('reviews.empty')}</p>

  const ordered = mineId ? [...reviews.filter((r) => r.id === mineId), ...reviews.filter((r) => r.id !== mineId)] : reviews
  const card = (r, cls) => <ReviewCard key={r.id} review={r} mine={r.id === mineId} onEdit={onEdit} onDelete={onDelete} className={cls} />

  if (ordered.length === 1) return card(ordered[0], '')

  return <HScroll gap="sm">{ordered.map((r) => card(r, styles.slide))}</HScroll>
}

ReviewList.propTypes = {
  reviews: PropTypes.arrayOf(PropTypes.object).isRequired,
  mineId: PropTypes.string,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
}
