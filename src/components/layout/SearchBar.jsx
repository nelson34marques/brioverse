import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useT } from '../../hooks/useT.js'
import styles from './SearchBar.module.css'

export function SearchIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

SearchIcon.propTypes = { size: PropTypes.number }

/** Barra de pesquisa em pílula. Submete para /pesquisa?q= */
export default function SearchBar({ autoFocus = false, size = 'md', className = '' }) {
  const { t } = useT()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [value, setValue] = useState(params.get('q') ?? '')

  useEffect(() => {
    setValue(params.get('q') ?? '')
  }, [params])

  function submit(e) {
    e.preventDefault()
    const q = value.trim()
    navigate(q ? `/pesquisa?q=${encodeURIComponent(q)}` : '/pesquisa')
  }

  return (
    <form role="search" className={`${styles.form} ${styles[size]} ${className}`.trim()} onSubmit={submit}>
      <span className={styles.icon}>
        <SearchIcon />
      </span>
      <input
        type="search"
        className={styles.input}
        placeholder={t('search.placeholder')}
        aria-label={t('search.title')}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus={autoFocus}
        enterKeyHint="search"
      />
      {value && (
        <button type="button" className={styles.clear} onClick={() => setValue('')} aria-label={t('common.cancel')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      )}
    </form>
  )
}

SearchBar.propTypes = {
  autoFocus: PropTypes.bool,
  size: PropTypes.oneOf(['md', 'lg']),
  className: PropTypes.string,
}
