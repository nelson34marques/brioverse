import { useState } from 'react'
import PropTypes from 'prop-types'
import { placeholderIcon } from '../../data/placeholders.js'
import styles from './AppIcon.module.css'

export default function AppIcon({ app, size = 64, className = '' }) {
  const [failed, setFailed] = useState(false)
  const src = !failed && app.iconUrl ? app.iconUrl : app.iconFallback || placeholderIcon(app.title, app.color)
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${styles.icon} ${className}`.trim()}
      style={{ width: size, height: size }}
    />
  )
}

AppIcon.propTypes = {
  app: PropTypes.shape({ iconUrl: PropTypes.string, iconFallback: PropTypes.string, title: PropTypes.string, color: PropTypes.string }).isRequired,
  size: PropTypes.number,
  className: PropTypes.string,
}
