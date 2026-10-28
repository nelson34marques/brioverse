import { useState } from 'react'
import PropTypes from 'prop-types'
import Button from '../../components/ui/Button.jsx'
import DeveloperCard from './DeveloperCard.jsx'
import ReasonModal from './ReasonModal.jsx'
import { useT } from '../../hooks/useT.js'
import styles from './Admin.module.css'

const ORDER = { approved: 0, revoked: 1, rejected: 2 }

/** Aba Desenvolvedores: contas aprovadas, revogadas e recusadas. Verificar, revogar, repor. */
export default function DevsTab({ devs, actions }) {
  const { t } = useT()
  const [target, setTarget] = useState(null)
  const list = devs
    .filter((d) => d.status !== 'pending')
    .sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9) || a.name.localeCompare(b.name))

  if (!list.length) return <p className={styles.empty}>{t('admin.no_devs')}</p>

  return (
    <>
      <ul className={styles.list}>
        {list.map((dev) => (
          <DeveloperCard key={dev.uid} dev={dev}>
            {dev.status === 'approved' && (
              <>
                <Button variant="secondary" size="sm" onClick={() => actions.verify(dev, !dev.verified)}>
                  {dev.verified ? t('admin.unverify') : t('admin.verify')}
                </Button>
                <Button variant="ghost" size="sm" className={styles.danger} onClick={() => setTarget(dev)}>
                  {t('admin.revoke')}
                </Button>
              </>
            )}
            {dev.status === 'revoked' && (
              <Button variant="secondary" size="sm" onClick={() => actions.restore(dev)}>
                {t('admin.restore')}
              </Button>
            )}
            {dev.status === 'rejected' && (
              <Button variant="cta" size="sm" onClick={() => actions.review(dev, 'approved', '')}>
                {t('admin.approve')}
              </Button>
            )}
          </DeveloperCard>
        ))}
      </ul>

      <ReasonModal
        open={Boolean(target)}
        title={t('admin.revoke_title', { name: target?.name || '' })}
        text={t('admin.revoke_text')}
        confirmLabel={t('admin.confirm_revoke')}
        email={target?.contactEmail}
        subject={target ? t('admin.revoke_title', { name: target.name }) : ''}
        onClose={() => setTarget(null)}
        onConfirm={(note) => actions.revoke(target, note)}
      />
    </>
  )
}

DevsTab.propTypes = {
  devs: PropTypes.arrayOf(PropTypes.object).isRequired,
  actions: PropTypes.shape({
    verify: PropTypes.func.isRequired,
    revoke: PropTypes.func.isRequired,
    restore: PropTypes.func.isRequired,
    review: PropTypes.func.isRequired,
  }).isRequired,
}
