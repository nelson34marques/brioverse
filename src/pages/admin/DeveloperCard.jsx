import PropTypes from 'prop-types'
import { StatusBadge, VerifiedBadge } from '../../components/ui/StatusBadge.jsx'
import { useT } from '../../hooks/useT.js'
import { shortDate } from '../../utils/format.js'
import styles from './Admin.module.css'

function Row({ label, children }) {
  if (!children) return null
  return (
    <>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </>
  )
}

Row.propTypes = {
  label: PropTypes.node.isRequired,
  children: PropTypes.node,
}

function Ext({ href }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {href}
    </a>
  )
}

Ext.propTypes = {
  href: PropTypes.string.isRequired,
}

/** Cartão com todos os dados de um criador (candidatura ou conta activa) e as acções passadas em `children`. */
export default function DeveloperCard({ dev, children }) {
  const { t, lang } = useT()
  return (
    <li className={styles.card}>
      <div className={styles.cardHead}>
        <h3 className={styles.h2}>
          {dev.name}
          <StatusBadge status={dev.status} />
          {dev.verified && <VerifiedBadge />}
        </h3>
        <span className={styles.sub}>{t('admin.applied', { date: shortDate(dev.createdAt, lang) })}</span>
      </div>
      <dl className={styles.dl}>
        <Row label={t('dev.kind')}>{t(`dev.${dev.kind}`)}</Row>
        <Row label={t('dev.legal_name')}>{dev.legalName}</Row>
        <Row label={t('dev.registration_short')}>{dev.registration}</Row>
        <Row label={t('dev.description_short')}>{dev.description}</Row>
        <Row label={t('dev.website')}>{dev.website && <Ext href={dev.website} />}</Row>
        <Row label={t('dev.sample_short')}>{dev.sampleUrl && <Ext href={dev.sampleUrl} />}</Row>
        <Row label={t('dev.repo')}>{dev.repo && <Ext href={dev.repo} />}</Row>
        <Row label={t('dev.contact')}>{dev.contactEmail && <a href={`mailto:${dev.contactEmail}`}>{dev.contactEmail}</a>}</Row>
        <Row label={t('admin.account')}>{[dev.userName, dev.userEmail].filter(Boolean).join(' · ')}</Row>
        <Row label={t('admin.note')}>{dev.status !== 'approved' ? dev.note : ''}</Row>
      </dl>
      {children && <div className={styles.actions}>{children}</div>}
    </li>
  )
}

DeveloperCard.propTypes = {
  dev: PropTypes.object.isRequired,
  children: PropTypes.node,
}
