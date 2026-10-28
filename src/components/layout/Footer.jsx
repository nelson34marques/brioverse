import { Link } from 'react-router-dom'
import Container from './Container.jsx'
import { useT } from '../../hooks/useT.js'
import styles from './Footer.module.css'

export default function Footer() {
  const { t } = useT()
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <p className={styles.eco}>{t('footer.ecosystem')}</p>
        <p className="muted">
          © {year} {t('footer.rights')}
          <span className={styles.sep} aria-hidden="true">
            ·
          </span>
          <Link to="/termos">{t('legal.terms_title')}</Link>
          <span className={styles.sep} aria-hidden="true">
            ·
          </span>
          <Link to="/privacidade">{t('legal.privacy_title')}</Link>
        </p>
      </Container>
    </footer>
  )
}
