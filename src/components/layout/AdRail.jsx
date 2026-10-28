import { AD_SLOTS } from '../../data/ads.js'
import { useT } from '../../hooks/useT.js'
import styles from './AdRail.module.css'

/**
 * Anúncios na margem esquerda, fora do conteúdo (que fica centrado como sempre).
 * Só aparecem em ecrãs largos com margem livre (≥1664px, ver AdRail.module.css).
 */
export default function AdRail() {
  const { t } = useT()
  if (!AD_SLOTS.length) return null

  return (
    <aside className={styles.rail} aria-label={t('ads.label')}>
      <span className={styles.label}>{t('ads.label')}</span>
      {AD_SLOTS.map((slot) => {
        const box = { '--ratio': `${slot.width} / ${slot.height}` }
        if (slot.imageUrl) {
          const img = <img src={slot.imageUrl} alt={slot.alt || ''} width={slot.width} height={slot.height} loading="lazy" />
          return slot.href ? (
            <a key={slot.id} className={styles.slot} style={box} href={slot.href} target="_blank" rel="noopener noreferrer sponsored">
              {img}
            </a>
          ) : (
            <div key={slot.id} className={styles.slot} style={box}>
              {img}
            </div>
          )
        }
        return (
          <div key={slot.id} className={`${styles.slot} ${styles.empty}`} style={box}>
            <span className={styles.emptyText}>{t('ads.placeholder')}</span>
            <span className={styles.size}>
              {slot.width} × {slot.height}
            </span>
          </div>
        )
      })}
    </aside>
  )
}
