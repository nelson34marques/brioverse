import { NavLink } from 'react-router-dom'
import { useT } from '../../hooks/useT.js'
import styles from './BottomNav.module.css'

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </svg>
  )
}

function AppsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function GameIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 9h12a4 4 0 0 1 4 4v2a4 4 0 0 1-7 2.6L14 17h-4l-1 .6A4 4 0 0 1 2 15v-2a4 4 0 0 1 4-4z" />
      <path d="M7 12v3M5.5 13.5h3M16 12.5h.01M18.5 14.5h.01" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

/** Bottom nav (mobile): Início · Apps · Jogos · Pesquisar. A conta fica no header. */
export default function BottomNav() {
  const { t } = useT()
  const cls = ({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`.trim()

  return (
    <nav className={styles.nav} aria-label="principal (móvel)">
      <NavLink to="/" end className={cls}>
        <HomeIcon />
        <span>{t('nav.home')}</span>
      </NavLink>
      <NavLink to="/apps" className={cls}>
        <AppsIcon />
        <span>{t('nav.apps')}</span>
      </NavLink>
      <NavLink to="/jogos" className={cls}>
        <GameIcon />
        <span>{t('nav.games')}</span>
      </NavLink>
      <NavLink to="/pesquisa" className={cls}>
        <SearchIcon />
        <span>{t('nav.search')}</span>
      </NavLink>
    </nav>
  )
}
