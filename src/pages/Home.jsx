import Container from '../components/layout/Container.jsx'
import FeaturedCarousel from '../components/app/FeaturedCarousel.jsx'
import AppRow from '../components/app/AppRow.jsx'
import StackedRow from '../components/app/StackedRow.jsx'
import Button from '../components/ui/Button.jsx'
import { useT } from '../hooks/useT.js'
import { useAllApps } from '../hooks/useApps.js'
import { usePrefs } from '../hooks/usePrefs.js'
import { selectApps } from '../lib/db.js'
import styles from './Home.module.css'

/**
 * Início: montra. Só destaques + 4 secções. Filtros e categorias vivem em /apps.
 */
export default function Home() {
  const { t } = useT()
  const { apps, loading } = useAllApps()
  const { prefs, devices } = usePrefs()

  // Para ti: categorias escolhidas no onboarding; sem Android, esconde apps só-APK.
  const forYou = prefs.interests.length
    ? selectApps(
        apps.filter((a) => prefs.interests.includes(a.category) && (a.type !== 'apk' || devices.includes('android') || a.webUrl)),
        { sort: 'trending', limit: 10 },
      )
    : []

  const featured = apps.filter((a) => a.featured).length
    ? selectApps(apps.filter((a) => a.featured), { sort: 'trending', limit: 5 })
    : selectApps(apps, { sort: 'rating', limit: 5 })
  const topRated = selectApps(apps, { sort: 'rating', limit: 10 })
  const trending = selectApps(apps, { sort: 'trending', limit: 9 })
  const recent = selectApps(apps, { sort: 'recent', limit: 10 })
  const games = selectApps(apps, { category: 'games', sort: 'trending', limit: 10 })

  if (!loading && apps.length === 0) {
    return (
      <Container>
        <section className={styles.empty}>
          <span className="eyebrow">{t('home.empty_eyebrow')}</span>
          <h1 className={styles.emptyTitle}>{t('home.empty_title')}</h1>
          <p className={styles.emptyText}>{t('home.empty_text')}</p>
          <Button variant="cta" to="/dev/candidatura">
            {t('home.empty_cta')}
          </Button>
        </section>
      </Container>
    )
  }

  return (
    <Container>
      <section className={styles.hero}>
        <FeaturedCarousel apps={featured} loading={loading} />
      </section>

      {forYou.length > 0 && <AppRow eyebrow={t('home.for_you_eyebrow')} title={t('home.for_you')} to="/apps" apps={forYou} loading={loading} />}
      <AppRow eyebrow={t('home.recommended_eyebrow')} title={t('home.recommended')} to="/apps?ordem=rating" apps={topRated} loading={loading} />
      <StackedRow eyebrow={t('home.top_eyebrow')} title={t('home.trending')} to="/apps?ordem=trending" apps={trending} loading={loading} />
      <AppRow eyebrow={t('home.recent_eyebrow')} title={t('home.recent')} to="/apps?ordem=recent" apps={recent} loading={loading} />
      <AppRow eyebrow={t('home.games_eyebrow')} title={t('home.games')} to="/jogos" apps={games} loading={loading} />

    </Container>
  )
}
