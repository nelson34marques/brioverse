import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import styles from './Button.module.css'

export default function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  className = '',
  children,
  ...rest
}) {
  const cls = [styles.btn, styles[variant], styles[size], className].filter(Boolean).join(' ')

  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  )
}

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'cta']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  to: PropTypes.string,
  href: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
}
