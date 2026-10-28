import { useState } from 'react'
import PropTypes from 'prop-types'
import Button from '../ui/Button.jsx'
import { Star } from './Rating.jsx'
import { useT } from '../../hooks/useT.js'
import { MAX_TEXT } from '../../lib/reviews.js'
import styles from './Reviews.module.css'

/** Formulário de avaliação: estrelas 1..5 + comentário opcional. */
export default function ReviewForm({ initial, busy = false, error = '', onSubmit, onCancel }) {
  const { t } = useT()
  const [rating, setRating] = useState(initial?.rating ?? 0)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState(initial?.text ?? '')
  const shown = hover || rating

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault()
        if (rating) onSubmit({ rating, text })
      }}
    >
      <p className={styles.label}>{t('reviews.your_rating')}</p>
      <div className={styles.picker} role="radiogroup" aria-label={t('reviews.your_rating')}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} – ${t(`reviews.star_${n}`)}`}
            className={`${styles.pick} ${n <= shown ? styles.pickOn : ''}`}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
          >
            <Star size={32} filled={n <= shown} />
          </button>
        ))}
        <span className={styles.pickLabel}>{shown ? t(`reviews.star_${shown}`) : ''}</span>
      </div>

      <label className={styles.label} htmlFor="review-text">
        {t('reviews.comment')}
      </label>
      <textarea
        id="review-text"
        className={styles.textarea}
        rows={4}
        maxLength={MAX_TEXT}
        placeholder={t('reviews.placeholder')}
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
        <Button variant="cta" type="submit" disabled={!rating || busy}>
          {busy ? t('reviews.saving') : initial ? t('reviews.update') : t('reviews.submit')}
        </Button>
      </div>
    </form>
  )
}

ReviewForm.propTypes = {
  initial: PropTypes.shape({ rating: PropTypes.number, text: PropTypes.string }),
  busy: PropTypes.bool,
  error: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}
