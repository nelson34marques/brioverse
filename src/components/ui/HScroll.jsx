import { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import styles from './HScroll.module.css'

function Arrow({ dir }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === 'prev' ? <path d="m15 6-6 6 6 6" /> : <path d="m9 6 6 6-6 6" />}
    </svg>
  )
}

Arrow.propTypes = { dir: PropTypes.oneOf(['prev', 'next']).isRequired }

/**
 * Fila horizontal com scroll, snap e setas.
 * layout="apps"      → N cards inteiros por largura (3/4/6/8)
 * layout="featured"  → 1/2/3 banners inteiros por largura
 * layout="free"      → cada filho mantém a sua largura (chips, galeria)
 */
export default function HScroll({ layout = 'free', gap = 'md', arrows = true, autoplay = 0, className = '', children }) {
  const ref = useRef(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft < max - 4)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    update()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    ro?.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [update, children])

  function scroll(dir) {
    const el = ref.current
    if (!el) return
    const page = el.clientWidth - parseFloat(getComputedStyle(el).paddingLeft) * 2
    el.scrollBy({ left: dir * page, behavior: 'smooth' })
  }

  // Autoplay: avança uma "página" a cada `autoplay` ms e volta ao início no fim.
  // Pausa enquanto a pessoa toca/arrasta/passa o rato/foca, e com a aba escondida.
  useEffect(() => {
    const el = ref.current
    if (!el || !autoplay) return undefined
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined
    let paused = false
    let timer = 0
    const tick = () => {
      if (paused || document.hidden) return
      const max = el.scrollWidth - el.clientWidth
      if (max <= 4) return
      if (el.scrollLeft >= max - 4) el.scrollTo({ left: 0, behavior: 'smooth' })
      else scroll(1)
    }
    const start = () => {
      clearInterval(timer)
      timer = setInterval(tick, autoplay)
    }
    const pause = () => {
      paused = true
    }
    const resume = () => {
      paused = false
      start() // reinicia a contagem depois de uma interacção
    }
    el.addEventListener('pointerenter', pause)
    el.addEventListener('pointerleave', resume)
    el.addEventListener('pointerdown', pause)
    el.addEventListener('pointerup', resume)
    el.addEventListener('pointercancel', resume)
    el.addEventListener('touchstart', pause, { passive: true })
    el.addEventListener('touchend', resume, { passive: true })
    el.addEventListener('focusin', pause)
    el.addEventListener('focusout', resume)
    start()
    return () => {
      clearInterval(timer)
      el.removeEventListener('pointerenter', pause)
      el.removeEventListener('pointerleave', resume)
      el.removeEventListener('pointerdown', pause)
      el.removeEventListener('pointerup', resume)
      el.removeEventListener('pointercancel', resume)
      el.removeEventListener('touchstart', pause)
      el.removeEventListener('touchend', resume)
      el.removeEventListener('focusin', pause)
      el.removeEventListener('focusout', resume)
    }
  }, [autoplay, children])

  const rowCls = [styles.row, styles[layout], styles[gap], className].filter(Boolean).join(' ')

  return (
    <div className={styles.wrap}>
      <div ref={ref} className={rowCls} onScroll={update}>
        {children}
      </div>
      {arrows && (
        <>
          <button
            type="button"
            className={`${styles.arrow} ${styles.prev} ${canPrev ? styles.show : ''}`}
            onClick={() => scroll(-1)}
            aria-label="Anterior"
            tabIndex={canPrev ? 0 : -1}
          >
            <Arrow dir="prev" />
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.next} ${canNext ? styles.show : ''}`}
            onClick={() => scroll(1)}
            aria-label="Seguinte"
            tabIndex={canNext ? 0 : -1}
          >
            <Arrow dir="next" />
          </button>
        </>
      )}
    </div>
  )
}

HScroll.propTypes = {
  layout: PropTypes.oneOf(['apps', 'featured', 'free']),
  gap: PropTypes.oneOf(['sm', 'md', 'lg']),
  arrows: PropTypes.bool,
  /** ms entre avanços automáticos; 0 desliga */
  autoplay: PropTypes.number,
  className: PropTypes.string,
  children: PropTypes.node,
}
