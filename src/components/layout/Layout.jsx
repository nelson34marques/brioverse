import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import BottomNav from './BottomNav.jsx'
import InstallBanner from './InstallBanner.jsx'
import AdRail from './AdRail.jsx'
import Backdrop from '../ui/Backdrop.jsx'
import Onboarding from '../onboarding/Onboarding.jsx'
import styles from './Layout.module.css'

export default function Layout() {
  const { pathname } = useLocation()
  const variant = pathname === '/jogos' || pathname.startsWith('/jogos/') ? 'games' : 'apps'
  return (
    <div className={styles.shell}>
      <Backdrop variant={variant} />
      <Header />
      <div className={styles.body}>
        <AdRail />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
      <Footer />
      <BottomNav />
      <InstallBanner />
      <Onboarding />
    </div>
  )
}
