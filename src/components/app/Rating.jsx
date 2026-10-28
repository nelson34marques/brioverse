import PropTypes from 'prop-types'
import { rating1 } from '../../utils/format.js'
import styles from './Rating.module.css'

export function Star({ size = 12, filled = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
    </svg>
  )
}

Star.propTypes = { size: PropTypes.number, filled: PropTypes.bool }

export default function Rating({ value, count, size = 'sm' }) {
  if (!value) return null
  return (
    <span className={`${styles.rating} ${styles[size]}`}>
      {rating1(value)}
      <Star size={size === 'sm' ? 12 : 16} />
      {count != null && <span className={styles.count}>({count})</span>}
    </span>
  )
}

Rating.propTypes = {
  value: PropTypes.number,
  count: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md']),
}
