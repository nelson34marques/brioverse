import PropTypes from 'prop-types'
import styles from './Container.module.css'

export default function Container({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={`${styles.container} ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  )
}

Container.propTypes = {
  as: PropTypes.elementType,
  className: PropTypes.string,
  children: PropTypes.node,
}
