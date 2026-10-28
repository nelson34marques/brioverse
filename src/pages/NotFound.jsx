import Container from '../components/layout/Container.jsx'
import Button from '../components/ui/Button.jsx'
import { useT } from '../hooks/useT.js'

export default function NotFound() {
  const { t } = useT()
  return (
    <Container style={{ textAlign: 'center', paddingBlock: 'var(--space-12)' }}>
      <h1>{t('not_found.title')}</h1>
      <p className="muted" style={{ marginBlock: 'var(--space-4) var(--space-6)' }}>
        {t('not_found.text')}
      </p>
      <Button to="/">{t('not_found.back_home')}</Button>
    </Container>
  )
}
