import { useT } from '../../hooks/useT.js'
import styles from './ListEnd.module.css'

/** Marca o fim de uma lista: "É tudo por agora. Mais apps em breve." */
export default function ListEnd() {
  const { t } = useT()
  return (
    <div className={styles.end} role="status">
      <span className={styles.dot} aria-hidden="true" />
      <p className={styles.title}>{t('search.end_title')}</p>
      <p className={styles.text}>{t('search.end_text')}</p>
    </div>
  )
}
