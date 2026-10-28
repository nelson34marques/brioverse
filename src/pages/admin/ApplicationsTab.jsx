import { useState } from 'react'
import PropTypes from 'prop-types'
import Button from '../../components/ui/Button.jsx'
import DeveloperCard from './DeveloperCard.jsx'
import ReasonModal from './ReasonModal.jsx'
import { useT } from '../../hooks/useT.js'
import styles from './Admin.module.css'

/** Aba Candidaturas: pedidos de conta de desenvolvedor por analisar. */
export default function ApplicationsTab({ devs, actions }) {
  const { t } = useT()
  const [target, setTarget] = useState(null)
  const list = devs.filter((d) => d.status === 'pending').sort((a, b) => a.createdAt - b.createdAt)

  if (!list.length) return <p className={styles.empty}>{t('admin.no_applications')}</p>

  return (
    <>
      <ul className={styles.list}>
        {list.map((dev) => (
          <DeveloperCard key={dev.uid} dev={dev}>
            <Button variant="cta" size="sm" onClick={() => actions.review(dev, 'approved', '')}>
              {t('admin.approve')}
            </Button>
            <Button variant="ghost" size="sm" className={styles.danger} onClick={() => setTarget(dev)}>
              {t('admin.reject')}
            </Button>
          </DeveloperCard>
        ))}
      </ul>

      <ReasonModal
        open={Boolean(target)}
        title={t('admin.reject_title', { name: target?.name || '' })}
        text={t('admin.reject_text')}
        confirmLabel={t('admin.confirm_reject')}
        email={target?.contactEmail}
        subject={target ? t('admin.reject_title', { name: target.name }) : ''}
        onClose={() => setTarget(null)}
        onConfirm={(note) => actions.review(target, 'rejected', note)}
      />
    </>
  )
}

ApplicationsTab.propTypes = {
  devs: PropTypes.arrayOf(PropTypes.object).isRequired,
  actions: PropTypes.shape({ review: PropTypes.func.isRequired }).isRequired,
}
