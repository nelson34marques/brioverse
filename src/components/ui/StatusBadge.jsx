import PropTypes from 'prop-types'
import Badge from './Badge.jsx'
import VerifiedIcon from './VerifiedIcon.jsx'
import { useT } from '../../hooks/useT.js'

const TONE = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  revoked: 'danger',
  disabled: 'danger',
  paused: 'warning',
}

/** Estado de um app ou de um criador (pending/approved/rejected/revoked/disabled). */
export function StatusBadge({ status }) {
  const { t } = useT()
  if (!TONE[status]) return null
  return <Badge tone={TONE[status]}>{t(`status.${status}`)}</Badge>
}

StatusBadge.propTypes = {
  status: PropTypes.string,
}

export function VerifiedBadge() {
  const { t } = useT()
  return (
    <Badge tone="brand">
      <VerifiedIcon size={12} />
      {t('status.verified')}
    </Badge>
  )
}
