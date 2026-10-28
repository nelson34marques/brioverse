import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Container from '../components/layout/Container.jsx'
import { useT } from '../hooks/useT.js'
import { SITE } from '../config/site.js'
import { LEGAL } from '../data/legal.js'
import styles from './Legal.module.css'

/** Termos de utilização / Política de privacidade. Texto em src/data/legal.js (PT e EN). */
export default function Legal({ kind }) {
  const { t, lang } = useT()
  const doc = LEGAL[lang]?.[kind] ?? LEGAL.pt[kind]
  const date = new Intl.DateTimeFormat(lang === 'pt' ? 'pt-PT' : 'en', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(SITE.legalUpdated),
  )
  const fill = (s) => s.replaceAll('{name}', SITE.name).replaceAll('{operator}', SITE.operator).replaceAll('{email}', SITE.supportEmail)

  return (
    <Container className={styles.page}>
      <header className={styles.header}>
        <span className="eyebrow">{t('legal.eyebrow')}</span>
        <h1 className={styles.title}>{t(kind === 'terms' ? 'legal.terms_title' : 'legal.privacy_title')}</h1>
        <p className={styles.updated}>{t('legal.updated', { date })}</p>
        <p className={styles.intro}>{fill(doc.intro)}</p>
      </header>

      <nav className={styles.toc} aria-label={t('legal.contents')}>
        <ol>
          {doc.sections.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`}>
                {i + 1}. {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <article className={styles.body}>
        {doc.sections.map((s, i) => (
          <section key={s.id} id={s.id} className={styles.section}>
            <h2 className={styles.h2}>
              {i + 1}. {s.title}
            </h2>
            {s.paragraphs.map((p, j) =>
              Array.isArray(p) ? (
                <ul key={j} className={styles.list}>
                  {p.map((item, k) => (
                    <li key={k}>{fill(item)}</li>
                  ))}
                </ul>
              ) : (
                <p key={j}>{fill(p)}</p>
              ),
            )}
          </section>
        ))}
      </article>

      <p className={styles.other}>
        {kind === 'terms' ? (
          <Link to="/privacidade">{t('legal.privacy_title')} →</Link>
        ) : (
          <Link to="/termos">{t('legal.terms_title')} →</Link>
        )}
      </p>
    </Container>
  )
}

Legal.propTypes = {
  kind: PropTypes.oneOf(['terms', 'privacy']).isRequired,
}
