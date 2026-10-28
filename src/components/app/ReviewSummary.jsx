import PropTypes from 'prop-types'
import { Star } from './Rating.jsx'
import { useT } from '../../hooks/useT.js'
import { rating1, compactNumber } from '../../utils/format.js'
import styles from './ReviewSummary.module.css'

/** Resumo de avaliações: nota grande + barras 5..1, só com dados reais. */
export default function ReviewSummary({ avg, count, distribution }) {
  const { t, lang } = useT()
  const dist = distribution ?? [0, 0, 0, 0, 0]
  const max = Math.max(1, ...dist)

  return (
    <div className={styles.wrap}>
      <div className={styles.big}>
        <span className={styles.num}>{count ? rating1(avg) : '–'}</span>
        <span className={styles.stars} aria-hidden="true">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={16} filled={i <= Math.round(avg)} />
          ))}
        </span>
        <span className={styles.count}>
          {count ? `${compactNumber(count, lang)} ${t(count === 1 ? 'app_detail.rating_one' : 'app_detail.ratings')}` : t('reviews.no_ratings')}
        </span>
      </div>
      <ul className={styles.bars}>
        {[5, 4, 3, 2, 1].map((n) => (
          <li key={n} className={styles.bar}>
            <span className={styles.label}>{n}</span>
            <span className={styles.track}>
              <span className={styles.fill} style={{ width: `${(dist[5 - n] / max) * 100}%` }} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}


ReviewSummary.propTypes = {
  avg: PropTypes.number,
  count: PropTypes.number,
  distribution: PropTypes.arrayOf(PropTypes.number),
}
