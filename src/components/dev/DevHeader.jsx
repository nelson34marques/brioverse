import { Link, NavLink } from 'react-router-dom'
import Container from '../layout/Container.jsx'
import Logo from '../layout/Logo.jsx'
import Button from '../ui/Button.jsx'
import { useT } from '../../hooks/useT.js'
import { useTheme } from '../../hooks/useTheme.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useDev } from '../../hooks/useDev.js'
import { ExitIcon, SunIcon, MoonIcon, PlusIcon } from './DevIcons.jsx'
import styles from './DevShell.module.css'

/**
 * Header do modo dev. PC: logo+Dev · Início / Apps / Análise / Avisos · Publicar · tema · perfil · Voltar à loja.
 * Mobile: logo+Dev · tema · perfil (a navegação está na bottom nav).
 */
export default function DevHeader() {
  const { t } = useT()
  const { isDark, toggle } = useTheme()
  const { profile, user } = useAuth()
  const { active, unread, developer } = useDev()
  const navCls = ({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`.trim()
  const initial = (developer?.name || profile?.name || user?.email || '?').charAt(0).toUpperCase()

  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <div className={styles.bar}>
        <span className={styles.brand}>
          <Logo to="/dev" />
          <span className={styles.modeTag}>{t('devnav.mode')}</span>
        </span>

        {active && (
          <nav className={styles.nav} aria-label={t('devnav.mode')}>
            <NavLink to="/dev" end className={navCls}>
              {t('devnav.home')}
            </NavLink>
            <NavLink to="/dev/apps" className={navCls}>
              {t('devnav.apps')}
            </NavLink>
            <NavLink to="/dev/analise" className={navCls}>
              {t('devnav.analytics')}
            </NavLink>
            <NavLink to="/dev/avisos" className={navCls}>
              {t('devnav.notices')}
              {unread > 0 && <span className={styles.badge}>{unread}</span>}
            </NavLink>
          </nav>
        )}

        <div className={styles.actions}>
          {active && (
            <Button variant="cta" size="sm" to="/dev/publicar" className={styles.publish}>
              <PlusIcon size={16} />
              {t('devnav.publish')}
            </Button>
          )}
          <button type="button" className={styles.iconBtn} onClick={toggle} aria-label={t('theme.toggle')}>
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <Link to="/conta" className={styles.exit}>
            <ExitIcon />
            {t('devnav.exit')}
          </Link>
          <Link to={active ? '/dev/perfil' : '/conta'} className={styles.account} aria-label={t('devnav.profile')}>
            {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" referrerPolicy="no-referrer" /> : initial}
          </Link>
        </div>
        </div>
      </Container>
    </header>
  )
}
