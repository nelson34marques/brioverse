import Container from '../components/layout/Container.jsx'
import FeaturedCarousel from '../components/app/FeaturedCarousel.jsx'
import StackedRow from '../components/app/StackedRow.jsx'
import AppListItem from '../components/app/AppListItem.jsx'
import ListEnd from '../components/app/ListEnd.jsx'
import { useT } from '../hooks/useT.js'
import { useAllApps } from '../hooks/useApps.js'
import { selectApps } from '../lib/db.js'
import styles from './Games.module.css'

/**
 * Jogos: secção própria (como o separador "Jogos" da Play Store).
 * Destaques, "Em alta" (top pelo ranking: avaliações, visualizações e novidade)
 * e "Todos os jogos". Só a categoria games.
 */
export default function Games() {
  const { t } = useT()
  const { apps: all, loading } = useAllApps()
  const games = all.filter((a) => a.category === 'games')

  const featuredPool = games.filter((a) => a.featured)
  const featured = selectApps(featuredPool.length ? featuredPool : games, { sort: 'trending', limit: 5 })
  const trending = selectApps(games, { sort: 'trending', limit: 9 })
  const list = selectApps(games, { sort: 'title' })

  return (
    <Container className={styles.page}>
      <header className={styles.header}>
        <span className="eyebrow">{t('games.eyebrow')}</span>
        <h1 className={styles.title}>{t('games.title')}</h1>
        <p className={styles.sub}>{t('games.subtitle')}</p>
      </header>

      <section className={styles.hero}>
        <FeaturedCarousel apps={featured} loading={loading} />
      </section>

      <StackedRow eyebrow={t('games.trending_eyebrow')} title={t('games.trending')} apps={trending} loading={loading} />

      <section className={styles.all}>
        <header className={styles.allHeader}>
          <h2 className={styles.h2}>{t('games.all')}</h2>
          {!loading && <span className={styles.count}>{t('category.count', { n: list.length })}</span>}
        </header>
        {!loading && list.length === 0 && <p className={styles.empty}>{t('games.empty')}</p>}
        <ul className={styles.list}>
          {list.map((app) => (
            <li key={app.id}>
              <AppListItem app={app} />
            </li>
          ))}
        </ul>
        {!loading && list.length > 0 && <ListEnd />}
      </section>
    </Container>
  )
}
