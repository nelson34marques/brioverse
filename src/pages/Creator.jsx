import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import Container from '../components/layout/Container.jsx'
import AppListItem from '../components/app/AppListItem.jsx'
import ListEnd from '../components/app/ListEnd.jsx'
import VerifiedIcon from '../components/ui/VerifiedIcon.jsx'
import { useT } from '../hooks/useT.js'
import { useApps } from '../hooks/useApps.js'
import { getCreator } from '../lib/creators.js'
import browse from './Browse.module.css'
import styles from './Creator.module.css'

const hostname = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/**
 * Página pública do criador (/criador/:uid): quem é (foto, nome, descrição), contacto de suporte
 * e os apps dele na loja. O perfil vem de creators/{uid}; sem perfil, mostra só o nome e os apps.
 */
export default function Creator() {
  const { t } = useT()
  const { uid } = useParams()
  const { apps: all, loading } = useApps({ sort: 'recent' })
  const apps = useMemo(() => all.filter((a) => a.developerId === uid), [all, uid])
  const [creator, setCreator] = useState(undefined) // undefined = a carregar; null = sem perfil
  const [photoBroken, setPhotoBroken] = useState(false)

  useEffect(() => {
    let alive = true
    setCreator(undefined)
    setPhotoBroken(false)
    getCreator(uid).then((c) => {
      if (alive) setCreator(c)
    })
    return () => {
      alive = false
    }
  }, [uid])

  const name = creator?.name || apps[0]?.developerName || ''
  const ready = !loading && creator !== undefined

  if (ready && !creator && apps.length === 0) return <Navigate to="/404" replace />
  if (!name) {
    return (
      <Container className={browse.page}>
        <p className={browse.empty}>{t('common.loading')}</p>
      </Container>
    )
  }

  const verified = apps.some((a) => a.verified)
  const countLabel = apps.length === 1 ? t('creator.app_count_one') : t('creator.app_count', { n: apps.length })

  return (
    <Container className={browse.page}>
      <header className={styles.head}>
        <span className={styles.avatar} aria-hidden="true">
          {creator?.photoUrl && !photoBroken ? <img src={creator.photoUrl} alt="" referrerPolicy="no-referrer" onError={() => setPhotoBroken(true)} /> : name.trim().charAt(0).toUpperCase()}
        </span>
        <div className={styles.headText}>
          <h1 className={styles.name}>
            {name}
            {verified && (
              <span className={styles.verified} title={t('app_detail.verified')}>
                <VerifiedIcon size={20} />
                <span className="sr-only">{t('app_detail.verified')}</span>
              </span>
            )}
          </h1>
          <p className={styles.meta}>
            {creator && <span>{t(`creator.kind_${creator.kind === 'company' ? 'company' : 'individual'}`)}</span>}
            {!loading && <span>{countLabel}</span>}
          </p>
        </div>
      </header>

      {creator && (creator.description || creator.contactEmail || creator.website) && (
        <div className={styles.info}>
          {creator.description && (
            <section className={styles.block}>
              <h2 className={styles.h2}>{t('creator.about')}</h2>
              <p className={styles.desc}>{creator.description}</p>
            </section>
          )}

          {(creator.contactEmail || creator.website) && (
            <section className={styles.block}>
              <h2 className={styles.h2}>{t('creator.contact')}</h2>
              <ul className={styles.contacts}>
                {creator.contactEmail && (
                  <li>
                    <a className={styles.contact} href={`mailto:${creator.contactEmail}`}>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="5" width="18" height="14" rx="2.5" />
                        <path d="m4 7 8 6 8-6" />
                      </svg>
                      <span>
                        <span className={styles.contactLabel}>{t('creator.email')}</span>
                        <span className={styles.contactValue}>{creator.contactEmail}</span>
                      </span>
                    </a>
                  </li>
                )}
                {creator.website && (
                  <li>
                    <a className={styles.contact} href={creator.website} target="_blank" rel="noopener noreferrer">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
                      </svg>
                      <span>
                        <span className={styles.contactLabel}>{t('creator.website')}</span>
                        <span className={styles.contactValue}>{hostname(creator.website)}</span>
                      </span>
                    </a>
                  </li>
                )}
              </ul>
            </section>
          )}
        </div>
      )}

      <section>
        <h2 className={styles.h2}>{t('creator.apps', { name })}</h2>
        {!loading && apps.length === 0 && <p className={browse.empty}>{t('creator.no_apps')}</p>}
        <ul className={browse.list}>
          {apps.map((app) => (
            <li key={app.id}>
              <AppListItem app={app} />
            </li>
          ))}
        </ul>
        {!loading && apps.length > 0 && <ListEnd />}
      </section>
    </Container>
  )
}
