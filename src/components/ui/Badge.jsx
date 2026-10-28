import PropTypes from 'prop-types'
import styles from './Badge.module.css'

export default function Badge({ tone = 'neutral', children }) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>
}

Badge.propTypes = {
  tone: PropTypes.oneOf(['neutral', 'brand', 'success', 'warning', 'danger']),
  children: PropTypes.node,
}
