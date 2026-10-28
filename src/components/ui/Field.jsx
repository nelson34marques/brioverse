import PropTypes from 'prop-types'
import styles from './Form.module.css'

/** Rótulo + controlo + ajuda/erro. */
export function Field({ label, htmlFor, help, error, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? <p className={styles.error}>{error}</p> : help ? <p className={styles.help}>{help}</p> : null}
    </div>
  )
}

Field.propTypes = {
  label: PropTypes.node.isRequired,
  htmlFor: PropTypes.string,
  help: PropTypes.node,
  error: PropTypes.node,
  children: PropTypes.node,
}

export function Input({ invalid = false, className = '', ...rest }) {
  return <input className={`${styles.input} ${invalid ? styles.invalid : ''} ${className}`.trim()} aria-invalid={invalid || undefined} {...rest} />
}

Input.propTypes = {
  invalid: PropTypes.bool,
  className: PropTypes.string,
}

export function Textarea({ invalid = false, className = '', ...rest }) {
  return (
    <textarea className={`${styles.textarea} ${invalid ? styles.invalid : ''} ${className}`.trim()} aria-invalid={invalid || undefined} {...rest} />
  )
}

Textarea.propTypes = {
  invalid: PropTypes.bool,
  className: PropTypes.string,
}

export function Notice({ tone = 'info', children }) {
  return (
    <div className={`${styles.notice} ${styles[tone]}`} role={tone === 'danger' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}

Notice.propTypes = {
  tone: PropTypes.oneOf(['info', 'success', 'warning', 'danger']),
  children: PropTypes.node,
}
