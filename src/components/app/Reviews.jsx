import VerifyEmailNotice from '../auth/VerifyEmailNotice.jsx'
import { useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import Modal from '../ui/Modal.jsx'
import ReviewSummary from './ReviewSummary.jsx'
import ReviewForm from './ReviewForm.jsx'
import ReviewList from './ReviewList.jsx'
import { useT } from '../../hooks/useT.js'
import { useAuth } from '../../hooks/useAuth.js'
import { saveReview, deleteReview, reviewId } from '../../lib/reviews.js'
import { isFirebaseConfigured } from '../../lib/firebase.js'
import styles from './Reviews.module.css'

/**
 * Secção "Avaliações" da página do app: resumo, botão para avaliar
 * (só autenticados, 1 por utilizador) e comentários reais em carrossel.
 * O estado das reviews vem de `useReviews` na página, partilhado com o cabeçalho.
 */
export default function Reviews({ app, state }) {
  const { t } = useT()
  const { user, isAuthenticated, emailVerified } = useAuth()
  const { reviews, setReviews, loading, reload, summary } = state
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const mineId = user ? reviewId(app.id, user.uid) : null
  const mine = mineId ? reviews.find((r) => r.id === mineId) : null

  async function submit({ rating, text }) {
    setBusy(true)
    setError('')
    try {
      const saved = await saveReview({ app, user, rating, text, previous: mine })
      setReviews((prev) => [saved, ...prev.filter((r) => r.id !== saved.id)])
      setOpen(false)
      reload()
    } catch (err) {
      console.warn('[brioverse] review não guardada:', err?.code || err?.message)
      setError(t('reviews.error'))
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    setBusy(true)
    try {
      await deleteReview({ app, user, previous: mine })
      setReviews((prev) => prev.filter((r) => r.id !== mineId))
      setConfirmDelete(false)
      reload()
    } catch (err) {
      console.warn('[brioverse] review não eliminada:', err?.code || err?.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.section}>
      <ReviewSummary avg={summary.avg} count={summary.count} distribution={summary.distribution ?? undefined} />

      <div className={styles.cta}>
        {isAuthenticated && !emailVerified ? (
          <VerifyEmailNotice reasonKey="auth.verify_review" />
        ) : isAuthenticated ? (
          <Button variant="secondary" onClick={() => setOpen(true)}>
            {mine ? t('reviews.edit') : t('app_detail.write_review')}
          </Button>
        ) : (
          <p className="muted">
            <Link to="/entrar">{t('app_detail.login_to_review')}</Link>
          </p>
        )}
        {!isFirebaseConfigured && <p className={`muted ${styles.note}`}>{t('reviews.local_note')}</p>}
      </div>

      {loading ? (
        <p className="muted">{t('common.loading')}</p>
      ) : (
        <ReviewList reviews={reviews} mineId={mineId} onEdit={() => setOpen(true)} onDelete={() => setConfirmDelete(true)} />
      )}

      <Modal open={open} onClose={() => !busy && setOpen(false)} title={t('reviews.form_title', { app: app.title })}>
        {open && <ReviewForm key={mine?.updatedAt ?? 'new'} initial={mine ?? undefined} busy={busy} error={error} onSubmit={submit} onCancel={() => setOpen(false)} />}
      </Modal>

      <Modal
        open={confirmDelete}
        onClose={() => !busy && setConfirmDelete(false)}
        title={t('reviews.confirm_delete')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)} disabled={busy}>
              {t('common.cancel')}
            </Button>
            <Button variant="cta" onClick={remove} disabled={busy}>
              {t('reviews.delete')}
            </Button>
          </>
        }
      >
        <p>{t('reviews.confirm_delete_text')}</p>
      </Modal>
    </div>
  )
}

Reviews.propTypes = {
  app: PropTypes.object.isRequired,
  state: PropTypes.shape({
    reviews: PropTypes.array.isRequired,
    setReviews: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    reload: PropTypes.func.isRequired,
    summary: PropTypes.object.isRequired,
  }).isRequired,
}
