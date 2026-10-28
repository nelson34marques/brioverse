import { Outlet } from 'react-router-dom'
import Backdrop from '../ui/Backdrop.jsx'
import DevHeader from './DevHeader.jsx'
import DevBottomNav from './DevBottomNav.jsx'
import { DevProvider } from '../../context/DevContext.jsx'
import styles from './DevShell.module.css'

/**
 * Casca do modo desenvolvedor (/dev/*): canvas próprio, header e bottom nav próprios,
 * sem rodapé, anúncios nem onboarding. Sai-se pelo "Voltar à loja" ou pelo Perfil.
 */
export default function DevLayout() {
  return (
    <DevProvider>
      <div className={styles.shell}>
        <Backdrop variant="dev" />
        <DevHeader />
        <main className={styles.main}>
          <Outlet />
        </main>
        <DevBottomNav />
      </div>
    </DevProvider>
  )
}
