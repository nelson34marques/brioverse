import PropTypes from 'prop-types'
import HScroll from '../ui/HScroll.jsx'
import { useMediaQuery } from '../../hooks/useMediaQuery.js'
import styles from './AppGallery.module.css'

/**
 * Capturas de ecrã. Em PC (≥1100px) com até 5 capturas, mostra-as todas
 * lado a lado sem setas (a secção estende-se para a direita, ver AppDetail).
 * Caso contrário, fila com scroll horizontal e setas.
 */
export default function AppGallery({ screenshots, title }) {
  const wide = useMediaQuery('(min-width: 1100px)')
  if (!screenshots?.length) return null

  if (wide && screenshots.length <= 5) {
    return (
      <div className={styles.grid} style={{ '--n': screenshots.length }}>
        {screenshots.map((src, i) => (
          <a key={src} href={src} target="_blank" rel="noopener noreferrer" className={`${styles.shot} ${styles.fit}`}>
            <img src={src} alt={`${title} ${i + 1}`} loading="lazy" referrerPolicy="no-referrer" />
          </a>
        ))}
      </div>
    )
  }

  return (
    <HScroll gap="sm">
      {screenshots.map((src, i) => (
        <a key={src} href={src} target="_blank" rel="noopener noreferrer" className={styles.shot}>
          <img src={src} alt={`${title} ${i + 1}`} loading="lazy" referrerPolicy="no-referrer" />
        </a>
      ))}
    </HScroll>
  )
}

AppGallery.propTypes = {
  screenshots: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string,
}
