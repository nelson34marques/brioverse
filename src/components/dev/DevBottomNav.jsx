import { NavLink } from 'react-router-dom'
import { useT } from '../../hooks/useT.js'
import { useDev } from '../../hooks/useDev.js'
import { HomeIcon, AppsIcon, PlusIcon, ChartIcon, BellIcon } from './DevIcons.jsx'
import styles from './DevShell.module.css'

/** Bottom nav do modo dev (mobile): Início · Apps · Publicar (central) · Análise · Avisos. */
export default function DevBottomNav() {
  const { t } = useT()
  const { active, unread } = useDev()
  if (!active) return null
  const cls = ({ isActive }) => `${styles.item} ${isActive ? styles.itemActive : ''}`.trim()
  const fabCls = ({ isActive }) => `${styles.item} ${styles.fab} ${isActive ? styles.fabActive : ''}`.trim()

  return (
    <nav className={styles.bottom} aria-label={`${t('devnav.mode')} (móvel)`}>
      <NavLink to="/dev" end className={cls}>
        <HomeIcon />
        <span>{t('devnav.home')}</span>
      </NavLink>
      <NavLink to="/dev/apps" className={cls}>
        <AppsIcon />
        <span>{t('devnav.apps')}</span>
      </NavLink>
      <NavLink to="/dev/publicar" className={fabCls}>
        <span className={styles.fabIcon}>
          <PlusIcon />
        </span>
        <span>{t('devnav.publish')}</span>
      </NavLink>
      <NavLink to="/dev/analise" className={cls}>
        <ChartIcon />
        <span>{t('devnav.analytics')}</span>
      </NavLink>
      <NavLink to="/dev/avisos" className={cls}>
        <BellIcon />
        {unread > 0 && <span className={styles.badge}>{unread}</span>}
        <span>{t('devnav.notices')}</span>
      </NavLink>
    </nav>
  )
}
