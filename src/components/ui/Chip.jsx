import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import styles from './Chip.module.css'

export default function Chip({ active = false, prominent = false, outline = false, color, to, onClick, children }) {
  const cls = [styles.chip, active && styles.active, prominent && styles.prominent, outline && styles.outline].filter(Boolean).join(' ')
  const dot = color ? <span className={styles.dot} style={{ background: color }} aria-hidden="true" /> : null
  if (to) {
    return (
      <Link to={to} className={cls} aria-current={active ? 'page' : undefined}>
        {dot}
        {children}
      </Link>
    )
  }
  return (
    <button type="button" className={cls} onClick={onClick} aria-pressed={active}>
      {dot}
      {children}
    </button>
  )
}

Chip.propTypes = {
  active: PropTypes.bool,
  prominent: PropTypes.bool,
  /** borda de 2px na cor da marca (para chips em cima de superfícies) */
  outline: PropTypes.bool,
  color: PropTypes.string,
  to: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
}
