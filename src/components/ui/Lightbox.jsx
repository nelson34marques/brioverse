import { useCallback, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { createPortal } from 'react-dom'
import { useT } from '../../hooks/useT.js'
import styles from './Lightbox.module.css'

/**
 * Imagem completa por cima da página (sem sair dela), com X para fechar.
 * `index` null = fechado. Com várias imagens: setas, teclas ← → e deslizar com o dedo.
 * Fecha com o X, Esc ou toque fora da imagem.
 */
export default function Lightbox({ images, index, onIndex, onClose, alt = '' }) {
  const { t } = useT()
  const closeRef = useRef(null)
  const touchX = useRef(null)
  const open = index != null && index >= 0 && index < images.length
  const many = images.length > 1

  const go = useCallback((step) => onIndex((index + step + images.length) % images.length), [index, images.length, onIndex])

  // trava o scroll da página e devolve o foco a quem abriu
  useEffect(() => {
    if (!open) return undefined
    const opener = document.activeElement
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
      opener?.focus?.()
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (many && e.key === 'ArrowLeft') go(-1)
      else if (many && e.key === 'ArrowRight') go(1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, many, go, onClose])

  if (!open) return null

  const stop = (fn) => (e) => {
    e.stopPropagation()
    fn()
  }
  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e) => {
    const x = e.changedTouches[0].clientX
    const dx = x - (touchX.current ?? x)
    touchX.current = null
    if (many && Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
  }

  return createPortal(
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label={alt} onClick={onClose} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <img key={images[index]} className={styles.img} src={images[index]} alt={`${alt} ${index + 1}`.trim()} referrerPolicy="no-referrer" onClick={(e) => e.stopPropagation()} />

      <button ref={closeRef} type="button" className={`${styles.btn} ${styles.close}`} onClick={stop(onClose)} aria-label={t('common.close')} title={t('common.close')}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>

      {many && (
        <>
          <span className={styles.count}>
            {index + 1} / {images.length}
          </span>
          <button type="button" className={`${styles.btn} ${styles.prev}`} onClick={stop(() => go(-1))} aria-label={t('common.previous')}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 6-6 6 6 6" />
            </svg>
          </button>
          <button type="button" className={`${styles.btn} ${styles.next}`} onClick={stop(() => go(1))} aria-label={t('common.next')}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </>
      )}
    </div>,
    document.body,
  )
}

Lightbox.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  /** imagem aberta; null = fechado */
  index: PropTypes.number,
  onIndex: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  alt: PropTypes.string,
}
