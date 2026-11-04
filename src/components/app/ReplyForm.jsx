import { useState } from 'react'
import PropTypes from 'prop-types'
import Button from '../ui/Button.jsx'
import { Star } from './Rating.jsx'
import { useT } from '../../hooks/useT.js'
import { MAX_TEXT } from '../../lib/reviews.js'
import styles from './Reviews.module.css'

/** Formulário de resposta do desenvolvedor a uma avaliação: mostra a avaliação e pede o texto. */
export default function ReplyForm({ review, busy = false, error = '', onSubmit, onCancel }) {
  const { t } = useT()
  const [text, setText] = useState(review.reply?.text ?? '')
  const clean = text.trim()

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault()
        if (clean) onSubmit({ text: clean })
      }}
    >
      <blockquote className={styles.quote}>
        <span className={styles.quoteHead}>
          <span className={styles.stars} aria-label={`${review.rating}/5`}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={13} filled={i <= review.rating} />
            ))}
          </span>
          <span className={styles.quoteName}>{review.userName}</span>
        </span>
        {review.text && <p className={styles.quoteText}>{review.text}</p>}
      </blockquote>

      <label className={styles.label} htmlFor="reply-text">
        {t('reviews.reply_label')}
      </label>
      <textarea
        id="reply-text"
        className={styles.textarea}
        rows={4}
        maxLength={MAX_TEXT}
        placeholder={t('reviews.reply_placeholder')}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <p className={styles.counter}>
        {text.length}/{MAX_TEXT}
      </p>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.formActions}>
        <Button variant="ghost" type="button" onClick={onCancel} disabled={busy}>
          {t('common.cancel')}
        </Button>
        <Button variant="cta" type="submit" disabled={!clean || busy}>
          {busy ? t('reviews.saving') : review.reply ? t('reviews.reply_update') : t('reviews.reply_submit')}
        </Button>
      </div>
    </form>
  )
}

ReplyForm.propTypes = {
  review: PropTypes.shape({
    rating: PropTypes.number,
    text: PropTypes.string,
    userName: PropTypes.string,
    reply: PropTypes.shape({ text: PropTypes.string }),
  }).isRequired,
  busy: PropTypes.bool,
  error: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}
