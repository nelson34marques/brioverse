import PropTypes from 'prop-types'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useT } from '../hooks/useT.js'

/** Protege rotas. `roles` vazio = basta estar autenticado. */
export default function RequireRole({ roles = [] }) {
  const { loading, isAuthenticated, role } = useAuth()
  const { t } = useT()
  const location = useLocation()

  if (loading) return <p className="muted" style={{ padding: 'var(--space-6)' }}>{t('common.loading')}</p>
  if (!isAuthenticated) return <Navigate to="/entrar" replace state={{ from: location }} />
  if (roles.length && !roles.includes(role)) return <Navigate to="/" replace />

  return <Outlet />
}

RequireRole.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string),
}
