import { Navigate, Outlet } from 'react-router-dom'
import { useDev } from '../../hooks/useDev.js'
import { useT } from '../../hooks/useT.js'

/** Telas do modo dev só para contas aprovadas (ou admin). Sem acesso, volta ao início do /dev. */
export default function RequireDev() {
  const { loading, active } = useDev()
  const { t } = useT()
  if (loading) return <p className="muted" style={{ padding: 'var(--s-6)' }}>{t('common.loading')}</p>
  if (!active) return <Navigate to="/dev" replace />
  return <Outlet />
}
