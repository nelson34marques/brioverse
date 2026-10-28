import PropTypes from 'prop-types'
import Container from '../../components/layout/Container.jsx'
import Button from '../../components/ui/Button.jsx'
import { StatusBadge, VerifiedBadge } from '../../components/ui/StatusBadge.jsx'
import { useT } from '../../hooks/useT.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useDev } from '../../hooks/useDev.js'
import { shortDate } from '../../utils/format.js'
import styles from './Dev.module.css'

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

/** Perfil de criador: dados da candidatura, editar e sair do modo dev. */
export default function DevProfile() {
  const { t, lang } = useT()
  const { profile, user } = useAuth()
  const { developer } = useDev()
  const name = developer?.name || profile?.name || user?.displayName || ''

  return (
    <Container className={styles.page}>
      <header className={styles.header}>
        <span className="eyebrow">{t('dev.eyebrow')}</span>
        <h1 className={styles.title}>{name}</h1>
        {developer && (
          <div className={styles.badges}>
            <StatusBadge status={developer.status} />
            {developer.verified && <VerifiedBadge />}
          </div>
        )}
      </header>

      {developer ? (
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.h2}>{t('dev.profile')}</h2>
            <Button variant="secondary" size="sm" to="/dev/candidatura">
              {t('dev.edit')}
            </Button>
          </div>
          <dl className={styles.dl}>
            <Row label={t('dev.kind')}>{t(`dev.${developer.kind}`)}</Row>
            <Row label={t('dev.name')}>{developer.name}</Row>
            <Row label={t('dev.legal_name')}>{developer.legalName}</Row>
            <Row label={t('dev.registration_short')}>{developer.registration}</Row>
            <Row label={t('dev.description_short')}>
              <span className={styles.pre}>{developer.description}</span>
            </Row>
            <Row label={t('dev.website')}>{developer.website && <Ext href={developer.website} />}</Row>
            <Row label={t('dev.sample_short')}>{developer.sampleUrl && <Ext href={developer.sampleUrl} />}</Row>
            <Row label={t('dev.repo')}>{developer.repo && <Ext href={developer.repo} />}</Row>
            <Row label={t('dev.contact')}>{developer.contactEmail}</Row>
            <Row label={t('dev.applied_at')}>{shortDate(developer.createdAt, lang)}</Row>
            <Row label={t('dev.reviewed_at')}>{developer.reviewedAt ? shortDate(developer.reviewedAt, lang) : ''}</Row>
          </dl>
        </section>
      ) : (
        <section className={styles.card}>
          <p className={styles.hint}>{t('dev.admin_no_profile')}</p>
        </section>
      )}

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2 className={styles.h2}>{t('devnav.exit')}</h2>
            <p className={styles.hint}>{t('dev.exit_hint')}</p>
          </div>
          <Button variant="secondary" size="sm" to="/conta">
            {t('devnav.exit')}
          </Button>
        </div>
      </section>
    </Container>
  )
}
