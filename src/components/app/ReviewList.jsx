import PropTypes from 'prop-types'
import HScroll from '../ui/HScroll.jsx'
import { Star } from './Rating.jsx'
import { useT } from '../../hooks/useT.js'
import { shortDate } from '../../utils/format.js'
import styles from './Reviews.module.css'

function Avatar({ name, photo, small = false }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase()
  const cls = `${styles.avatar} ${small ? styles.avatarSm : ''}`
  return photo ? (
    <img className={cls} src={photo} alt="" referrerPolicy="no-referrer" />
  ) : (
    <span className={`${cls} ${styles.avatarFallback}`} aria-hidden="true">
      {initial}
    </span>
  )
}

Avatar.propTypes = { name: PropTypes.string, photo: PropTypes.string, small: PropTypes.bool }

/** Resposta do desenvolvedor, aninhada no cartão da avaliação. */
function Reply({ reply, canReply, onEdit, onDelete }) {
  const { t, lang } = useT()
  return (
    <div className={styles.reply}>
      <div className={styles.head}>
        <Avatar name={reply.userName} photo={reply.userPhoto} small />
        <div className={styles.who}>
          <span className={styles.name}>
            <span className={styles.nameText}>{reply.userName}</span>
            <span className={styles.devTag}>{t('reviews.reply_dev_tag')}</span>
          </span>
          <span className={styles.meta}>
            <span className={styles.date}>
              {t('reviews.reply_from')} · {shortDate(reply.updatedAt, lang)}
            </span>
          </span>
        </div>
        {canReply && (
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
      <p className={styles.text}>{reply.text}</p>
    </div>
  )
}

Reply.propTypes = {
  reply: PropTypes.object.isRequired,
  canReply: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
}

function ReviewCard({ review: r, mine, canReply, onEdit, onDelete, onReply, onDeleteReply, className }) {
  const { t, lang } = useT()
  return (
    <article className={`${styles.item} ${mine ? styles.mine : ''} ${className}`}>
      <div className={styles.head}>
        <Avatar name={r.userName} photo={r.userPhoto} />
        <div className={styles.who}>
          <span className={styles.name}>
            <span className={styles.nameText}>{r.userName}</span>
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

      {r.reply ? (
        <Reply reply={r.reply} canReply={canReply} onEdit={() => onReply(r)} onDelete={() => onDeleteReply(r)} />
      ) : (
        canReply && (
          <div className={styles.replyCta}>
            <button type="button" className={styles.link} onClick={() => onReply(r)}>
              {t('reviews.reply')}
            </button>
          </div>
        )
      )}
    </article>
  )
}

ReviewCard.propTypes = {
  review: PropTypes.object.isRequired,
  mine: PropTypes.bool,
  canReply: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onReply: PropTypes.func,
  onDeleteReply: PropTypes.func,
  className: PropTypes.string,
}

/**
 * Comentários: um só ocupa a largura toda; vários aparecem em carrossel
 * horizontal com setas. A avaliação do próprio utilizador vem primeiro.
 * `canReply` (criador do app) mostra "Responder" e as acções sobre a resposta.
 */
export default function ReviewList({ reviews, mineId, canReply = false, onEdit, onDelete, onReply, onDeleteReply }) {
  const { t } = useT()

  if (!reviews.length) return <p className={`muted ${styles.empty}`}>{t('reviews.empty')}</p>

  const ordered = mineId ? [...reviews.filter((r) => r.id === mineId), ...reviews.filter((r) => r.id !== mineId)] : reviews
  const card = (r, cls) => (
    <ReviewCard
      key={r.id}
      review={r}
      mine={r.id === mineId}
      canReply={canReply}
      onEdit={onEdit}
      onDelete={onDelete}
      onReply={onReply}
      onDeleteReply={onDeleteReply}
      className={cls}
    />
  )

  if (ordered.length === 1) return card(ordered[0], '')

  return <HScroll gap="sm">{ordered.map((r) => card(r, styles.slide))}</HScroll>
}

ReviewList.propTypes = {
  reviews: PropTypes.arrayOf(PropTypes.object).isRequired,
  mineId: PropTypes.string,
  canReply: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onReply: PropTypes.func,
  onDeleteReply: PropTypes.func,
}
