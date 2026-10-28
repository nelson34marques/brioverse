import { useEffect, useState } from 'react'

/** true quando a media query bate (actualiza ao redimensionar). */
export function useMediaQuery(query) {
  const get = () => typeof window !== 'undefined' && window.matchMedia?.(query).matches
  const [matches, setMatches] = useState(get)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatches(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return Boolean(matches)
}
