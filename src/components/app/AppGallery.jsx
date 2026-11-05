import { useState } from 'react'
import PropTypes from 'prop-types'
import HScroll from '../ui/HScroll.jsx'
import Lightbox from '../ui/Lightbox.jsx'
import { useMediaQuery } from '../../hooks/useMediaQuery.js'
import { useT } from '../../hooks/useT.js'
import styles from './AppGallery.module.css'

/**
 * Capturas de ecrã. Em PC (≥1100px) com até 5 capturas, mostra-as todas
 * lado a lado sem setas (a secção estende-se para a direita, ver AppDetail).
 * Caso contrário, fila com scroll horizontal e setas.
 * Tocar numa captura abre-a completa por cima da página (Lightbox), sem sair da loja.
 */
export default function AppGallery({ screenshots, title }) {
  const { t } = useT()
  const wide = useMediaQuery('(min-width: 1100px)')
  const [open, setOpen] = useState(null)
  if (!screenshots?.length) return null

  const fit = wide && screenshots.length <= 5
  const shots = screenshots.map((src, i) => (
    <button key={src} type="button" className={`${styles.shot} ${fit ? styles.fit : ''}`.trim()} onClick={() => setOpen(i)} aria-label={t('app_detail.shot_open', { n: i + 1 })}>
      <img src={src} alt={`${title} ${i + 1}`} loading="lazy" referrerPolicy="no-referrer" />
    </button>
  ))

  return (
    <>
      {fit ? (
        <div className={styles.grid} style={{ '--n': screenshots.length }}>
          {shots}
        </div>
      ) : (
        <HScroll gap="sm">{shots}</HScroll>
      )}
      <Lightbox images={screenshots} index={open} onIndex={setOpen} onClose={() => setOpen(null)} alt={title} />
    </>
  )
}

AppGallery.propTypes = {
  screenshots: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string,
}
