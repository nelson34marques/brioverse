import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import { Textarea } from '../../components/ui/Field.jsx'
import { useT } from '../../hooks/useT.js'
import { LIMITS } from '../../lib/developers.js'
import form from '../../components/ui/Form.module.css'
import styles from './Admin.module.css'

/** Folha com um motivo obrigatório (desactivar app, recusar candidatura, revogar acesso). */
export default function ReasonModal({ open, title, text, confirmLabel, email, subject, onClose, onConfirm }) {
  const { t } = useT()
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) setReason('')
  }, [open])

  async function confirm() {
    if (!reason.trim()) return
    setBusy(true)
    const ok = await onConfirm(reason.trim())
    setBusy(false)
    if (ok) onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="cta" onClick={confirm} disabled={busy || !reason.trim()}>
            {busy ? t('common.loading') : confirmLabel}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            {t('common.cancel')}
          </Button>
        </>
      }
    >
      <div className={form.form}>
        <p>{text}</p>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          maxLength={LIMITS.note}
          placeholder={t('admin.reason_ph')}
          aria-label={t('admin.reason_label')}
        />
        <span className={form.counter}>
          {reason.length}/{LIMITS.note}
        </span>
        {email && (
          <a className={styles.mail} href={`mailto:${email}?subject=${encodeURIComponent(subject || '')}`}>
            {t('admin.email')} · {email}
          </a>
        )}
      </div>
    </Modal>
  )
}

ReasonModal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  text: PropTypes.string,
  confirmLabel: PropTypes.string.isRequired,
  email: PropTypes.string,
  subject: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  /** recebe o motivo; devolve true para fechar */
  onConfirm: PropTypes.func.isRequired,
}
