import PropTypes from 'prop-types'
import styles from './SortSelect.module.css'

function Caret() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

/** Selector de ordem com aspecto de chip ("Ordenar: Popularidade ▾"), usa <select> nativo. */
export default function SortSelect({ label, value, options, onChange }) {
  const current = options.find((o) => o.value === value)?.label ?? ''
  return (
    <label className={styles.wrap}>
      <span className={styles.label}>{label}:</span>
      <span className={styles.value}>{current}</span>
      <Caret />
      <select className={styles.select} value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

SortSelect.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, label: PropTypes.string })).isRequired,
  onChange: PropTypes.func.isRequired,
}
