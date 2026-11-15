import { useT } from '../../hooks/useT.js'

/** Fallback dos chunks de página (lazy), mostrado dentro da casca actual. */
export default function PageLoading() {
  const { t } = useT()
  return (
    <p className="muted" style={{ padding: 'var(--s-6)' }}>
      {t('common.loading')}
    </p>
  )
}
