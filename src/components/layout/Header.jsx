import { NavLink } from 'react-router-dom'
import Container from './Container.jsx'
import Logo from './Logo.jsx'
import SearchBar from './SearchBar.jsx'
import UpdatesButton from './UpdatesButton.jsx'
import { useT } from '../../hooks/useT.js'
import { useTheme } from '../../hooks/useTheme.js'
import { useAuth } from '../../hooks/useAuth.js'
import styles from './Header.module.css'

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}

/**
 * Header: logo · Início / Apps / Jogos / Categorias · pesquisa · idioma · tema · conta.
 * Em mobile: nome + tema + conta (a pesquisa está na bottom nav).
 */
export default function Header() {
  const { t, lang, setLang } = useT()
  const { isDark, toggle } = useTheme()
  const { isAuthenticated, profile } = useAuth()
  const nextLang = lang === 'pt' ? 'en' : 'pt'
  const navCls = ({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`.trim()

  const account = isAuthenticated ? (
    <NavLink to="/conta" className={styles.account} aria-label={t('nav.account')}>
      {profile?.avatarUrl ? (
        <img src={profile.avatarUrl} alt="" className={styles.avatar} referrerPolicy="no-referrer" />
      ) : (
        <span className={styles.avatarFallback}>{(profile?.name || '?').charAt(0).toUpperCase()}</span>
      )}
    </NavLink>
  ) : (
    <>
      <NavLink to="/entrar" className={`${styles.login} ${styles.desktopOnly}`}>
        {t('nav.login')}
      </NavLink>
      <NavLink to="/entrar" className={`${styles.iconBtn} ${styles.mobileOnly}`} aria-label={t('nav.login')}>
        <UserIcon />
      </NavLink>
    </>
  )

  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <div className={styles.bar}>
        <Logo />

        <nav className={styles.nav} aria-label="principal">
          <NavLink to="/" end className={navCls}>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/apps" className={navCls}>
            {t('nav.apps')}
          </NavLink>
          <NavLink to="/jogos" className={navCls}>
            {t('nav.games')}
          </NavLink>
        </nav>

        <div className={styles.search}>
          <SearchBar />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.desktopOnly}`}
            onClick={() => setLang(nextLang)}
            aria-label={t('lang.toggle')}
            title={t(`lang.${nextLang}`)}
          >
            {lang.toUpperCase()}
          </button>
          <UpdatesButton className={styles.iconBtn} />
          <button type="button" className={styles.iconBtn} onClick={toggle} aria-label={t('theme.toggle')}>
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          {account}
        </div>
        </div>
      </Container>
    </header>
  )
}
