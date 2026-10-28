import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import AppIcon from '../app/AppIcon.jsx'
import { useT } from '../../hooks/useT.js'
import { useLibrary } from '../../hooks/useLibrary.js'
import { shortDate } from '../../utils/format.js'
import styles from './UpdatesButton.module.css'

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9a6 6 0 0 1 12 0v4l2 3H4l2-3z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  )
}

/**
 * Sino de actualizações (header da loja, PC e telemóvel): lista os apps da biblioteca
 * da pessoa que têm versão nova. Abre um painel por baixo da barra.
 */
export default function UpdatesButton({ className = '' }) {
  const { t, lang } = useT()
  const { updates, count, seen, seenAll } = useLibrary()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function go(u) {
    seen(u.app.id)
    setOpen(false)
    navigate(`/app/${u.app.id}`)
  }

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={`${className} ${styles.btn}`.trim()}
        onClick={() => setOpen((v) => !v)}
        aria-label={t('updates.aria', { n: count })}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <BellIcon />
        {count > 0 && <span className={styles.badge}>{count > 9 ? '9+' : count}</span>}
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label={t('updates.title')}>
          <div className={styles.head}>
            <span className={styles.title}>{t('updates.title')}</span>
            {count > 0 && (
              <button type="button" className={styles.link} onClick={() => seenAll()}>
                {t('updates.mark_all')}
              </button>
            )}
          </div>
          {updates.length === 0 ? (
            <p className={styles.empty}>{t('updates.empty')}</p>
          ) : (
            <ul className={styles.list}>
              {updates.map((u) => (
                <li key={u.app.id}>
                  <button type="button" className={styles.item} onClick={() => go(u)}>
                    <AppIcon app={u.app} size={40} />
                    <span className={styles.body}>
                      <span className={styles.name}>{u.app.title}</span>
                      <span className={styles.meta}>
                        {t('updates.version_date', { v: u.app.version, date: shortDate(u.app.releasedAt || u.app.updatedAt, lang) })}
                      </span>
                      {u.app.changelog && <span className={styles.notes}>{u.app.changelog}</span>}
                    </span>
                    <span className={styles.dot} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

UpdatesButton.propTypes = {
  className: PropTypes.string,
}
