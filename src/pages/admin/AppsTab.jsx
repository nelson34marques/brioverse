import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import AppIcon from '../../components/app/AppIcon.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import Chip from '../../components/ui/Chip.jsx'
import SortSelect from '../../components/ui/SortSelect.jsx'
import { StatusBadge, VerifiedBadge } from '../../components/ui/StatusBadge.jsx'
import ReasonModal from './ReasonModal.jsx'
import { useT } from '../../hooks/useT.js'
import { MAX_BOOST } from '../../lib/admin.js'
import styles from './Admin.module.css'

const FILTERS = ['all', 'active', 'pending', 'disabled', 'featured']

function matches(app, filter) {
  switch (filter) {
    case 'active':
      return app.status === 'approved'
    case 'pending':
      return app.status === 'pending'
    case 'disabled':
      return app.status === 'disabled'
    case 'featured':
      return Boolean(app.featured)
    default:
      return true
  }
}

/** Aba Apps: pesquisar, destacar, dar impulso no ranking, desactivar/reactivar, aprovar pendentes. */
export default function AppsTab({ apps, devs, actions }) {
  const { t } = useT()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [target, setTarget] = useState(null) // app a desactivar

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return apps
      .filter((a) => matches(a, filter))
      .filter((a) => !needle || a.title.toLowerCase().includes(needle) || (a.developerName || '').toLowerCase().includes(needle))
      .sort((a, b) => a.title.localeCompare(b.title))
  }, [apps, q, filter])

  const boostOptions = Array.from({ length: MAX_BOOST + 1 }, (_, n) => ({
    value: String(n),
    label: n ? t('admin.boost_n', { n }) : t('admin.boost_0'),
  }))
  const devEmail = (app) => devs.find((d) => d.uid === app.developerId)?.contactEmail || ''

  return (
    <>
      <div className={styles.toolbar}>
        <input className={styles.search} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('admin.search')} aria-label={t('admin.search')} />
        <div className={styles.chips}>
          {FILTERS.map((f) => (
            <Chip key={f} outline active={filter === f} onClick={() => setFilter(f)}>
              {t(`admin.filter_${f}`)}
            </Chip>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className={styles.empty}>{t('admin.no_apps')}</p>
      ) : (
        <ul className={styles.list}>
          {list.map((app) => (
            <li key={app.id} className={`${styles.row} ${app.status === 'disabled' ? styles.off : ''}`}>
              <AppIcon app={app} size={56} />
              <div className={styles.body}>
                <div className={styles.titleLine}>
                  <Link to={`/app/${app.id}`} className={styles.name}>
                    {app.title}
                  </Link>
                  <StatusBadge status={app.status} />
                  {app.verified && <VerifiedBadge />}
                  {app.featured && <Badge tone="brand">{t('status.featured')}</Badge>}
                  {app.boost > 0 && <Badge>{t('admin.boost_badge', { n: app.boost })}</Badge>}
                </div>
                <span className={styles.sub}>
                  {app.developerName} · {t(`categories.${app.category}`)} · {app.type === 'apk' ? 'APK' : t('search.pwa_short')} ·{' '}
                  {t('dev.views', { n: app.stats.views })}
                </span>
                {app.status === 'disabled' && app.disabledReason && (
                  <span className={styles.reason}>
                    {t('admin.reason_label')}: {app.disabledReason}
                  </span>
                )}
              </div>
              <div className={styles.actions}>
                {app.status === 'pending' && (
                  <Button variant="cta" size="sm" onClick={() => actions.approve(app)}>
                    {t('admin.approve')}
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => actions.feature(app)}>
                  {app.featured ? t('admin.unfeature') : t('admin.feature')}
                </Button>
                <SortSelect label={t('status.boost')} value={String(app.boost || 0)} options={boostOptions} onChange={(v) => actions.boost(app, Number(v))} />
                {app.status === 'disabled' ? (
                  <Button variant="secondary" size="sm" onClick={() => actions.enable(app)}>
                    {t('admin.enable')}
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" className={styles.danger} onClick={() => setTarget(app)}>
                    {t('admin.disable')}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ReasonModal
        open={Boolean(target)}
        title={t('admin.disable_title', { app: target?.title || '' })}
        text={t('admin.disable_text')}
        confirmLabel={t('admin.confirm_disable')}
        email={target ? devEmail(target) : ''}
        subject={target ? t('admin.disable_title', { app: target.title }) : ''}
        onClose={() => setTarget(null)}
        onConfirm={(reason) => actions.disable(target, reason)}
      />
    </>
  )
}

AppsTab.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.object).isRequired,
  devs: PropTypes.arrayOf(PropTypes.object).isRequired,
  actions: PropTypes.shape({
    approve: PropTypes.func.isRequired,
    feature: PropTypes.func.isRequired,
    boost: PropTypes.func.isRequired,
    enable: PropTypes.func.isRequired,
    disable: PropTypes.func.isRequired,
  }).isRequired,
}
