import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import styles from './Logo.module.css'

/** Cada letra num span, com atraso crescente para a animação de entrada. */
function letters(text, offset) {
  return text.split('').map((ch, i) => (
    <span key={offset + i} className={styles.letter} style={{ '--i': offset + i }}>
      {ch}
    </span>
  ))
}

export default function Logo({ compact = false, to = '/' }) {
  return (
    <Link to={to} className={styles.logo} aria-label="BrioVerse">
      <img className={styles.mark} src="/logo-mark.png" width="36" height="36" alt="" aria-hidden="true" />
      {!compact && (
        <span className={styles.word} aria-hidden="true">
          {letters('Brio', 0)}
          <span className={styles.verse}>{letters('Verse', 4)}</span>
        </span>
      )}
    </Link>
  )
}

Logo.propTypes = {
  compact: PropTypes.bool,
  to: PropTypes.string,
}
