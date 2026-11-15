import { useEffect } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Prende o foco dentro de um diálogo enquanto `active` for true:
 * foca o primeiro elemento, roda o Tab e devolve o foco a quem abriu ao fechar.
 */
export function useFocusTrap(active, ref) {
  useEffect(() => {
    if (!active || !ref.current) return undefined
    const root = ref.current
    const opener = document.activeElement

    const focusables = () =>
      Array.from(root.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.getAttribute('aria-hidden') !== 'true' && (el.offsetWidth > 0 || el.offsetHeight > 0),
      )

    const first = focusables()[0]
    ;(first || root).focus()

    const onKey = (e) => {
      if (e.key !== 'Tab') return
      const items = focusables()
      if (!items.length) {
        e.preventDefault()
        root.focus()
        return
      }
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === firstEl || document.activeElement === root)) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (opener && typeof opener.focus === 'function') opener.focus()
    }
  }, [active, ref])
}
