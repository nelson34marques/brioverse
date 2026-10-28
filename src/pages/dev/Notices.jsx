import Container from '../../components/layout/Container.jsx'
import Button from '../../components/ui/Button.jsx'
import { useT } from '../../hooks/useT.js'
import { useDev } from '../../hooks/useDev.js'
import { shortDate } from '../../utils/format.js'
import styles from './Dev.module.css'

/** Avisos do admin para o criador (app desactivado, candidatura, selo…). */
export default function DevNotices() {
  const { t, lang } = useT()
  const { notifications, unread, markRead, markAllRead } = useDev()

  return (
    <Container className={styles.page}>
      <header className={`${styles.header} ${styles.headRow}`}>
        <div>
          <span className="eyebrow">{t('dev.eyebrow')}</span>
          <h1 className={styles.title}>{t('dev.notices')}</h1>
        </div>
        {unread > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            {t('dev.mark_all')}
          </Button>
        )}
      </header>

      {notifications.length === 0 ? (
        <section className={styles.card}>
          <p className={styles.hint}>{t('dev.no_notices')}</p>
        </section>
      ) : (
        <ul className={styles.notifs}>
          {notifications.map((n) => (
            <li key={n.id} className={`${styles.notif} ${n.read ? styles.read : styles.unread}`}>
              <span className={styles.dot} aria-hidden="true" />
              <div className={styles.notifBody}>
                <p className={styles.notifTitle}>{t(`notif.${n.type}`, { app: n.appTitle })}</p>
                {n.reason && <p className={styles.notifReason}>{n.reason}</p>}
                <p className={styles.notifMeta}>{shortDate(n.createdAt, lang)}</p>
              </div>
              {!n.read && (
                <button type="button" className={styles.linkBtn} onClick={() => markRead(n.id)}>
                  {t('dev.mark_read')}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Container>
  )
}
