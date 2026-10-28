import PropTypes from 'prop-types'
import { useParams, Navigate } from 'react-router-dom'
import Container from '../components/layout/Container.jsx'
import CategoryChips from '../components/app/CategoryChips.jsx'
import AppListItem from '../components/app/AppListItem.jsx'
import ListEnd from '../components/app/ListEnd.jsx'
import { useT } from '../hooks/useT.js'
import { useApps } from '../hooks/useApps.js'
import { categoryBySlug } from '../utils/categories.js'
import styles from './Browse.module.css'

/** Categoria: título + chips para trocar de categoria + lista. Sem filtros extra. */
export default function Category({ slug: fixedSlug }) {
  const { t } = useT()
  const params = useParams()
  const slug = fixedSlug ?? params.slug
  const cat = categoryBySlug(slug)
  const { apps, loading } = useApps({ category: cat?.key, sort: 'trending' })

  if (!cat) return <Navigate to="/404" replace />
  if (cat.key === 'games') return <Navigate to="/jogos" replace />

  return (
    <Container className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t(`categories.${cat.key}`)}</h1>
        {!loading && <span className={styles.count}>{t('category.count', { n: apps.length })}</span>}
      </header>

      <div className={styles.chips}>
        <CategoryChips activeKey={cat.key} allTo="/apps" prominent={false} exclude={['games']} />
      </div>

      {!loading && apps.length === 0 && <p className={styles.empty}>{t('search.no_results', { q: t(`categories.${cat.key}`) })}</p>}

      <ul className={styles.list}>
        {apps.map((app) => (
          <li key={app.id}>
            <AppListItem app={app} />
          </li>
        ))}
      </ul>
      {!loading && apps.length > 0 && <ListEnd />}
    </Container>
  )
}

Category.propTypes = {
  slug: PropTypes.string,
}
