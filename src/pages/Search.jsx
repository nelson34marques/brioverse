import { useSearchParams } from 'react-router-dom'
import Container from '../components/layout/Container.jsx'
import SearchBar from '../components/layout/SearchBar.jsx'
import AppListItem from '../components/app/AppListItem.jsx'
import ListEnd from '../components/app/ListEnd.jsx'
import { useT } from '../hooks/useT.js'
import { useApps } from '../hooks/useApps.js'
import styles from './Browse.module.css'

/** Pesquisa: só a barra e os resultados. Para navegar por filtros existe /apps. */
export default function Search() {
  const { t } = useT()
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const { apps, loading } = useApps({ q, sort: 'trending' })

  const countLabel = apps.length === 1 ? t('search.result') : t('search.results', { n: apps.length })

  return (
    <Container className={styles.page}>
      <div className={styles.searchBar}>
        <SearchBar size="lg" autoFocus={!q} />
      </div>

      {q ? (
        <>
          <header className={styles.header}>
            <h1 className={styles.title}>{q}</h1>
            {!loading && <span className={styles.count}>{countLabel}</span>}
          </header>
          {!loading && apps.length === 0 && <p className={styles.empty}>{t('search.no_results', { q })}</p>}
          <ul className={styles.list}>
            {apps.map((app) => (
              <li key={app.id}>
                <AppListItem app={app} />
              </li>
            ))}
          </ul>
          {!loading && apps.length > 0 && <ListEnd />}
        </>
      ) : (
        <p className={styles.empty}>{t('search.empty_hint')}</p>
      )}
    </Container>
  )
}
