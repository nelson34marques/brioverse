import { useState } from 'react'
import PropTypes from 'prop-types'
import Button from '../ui/Button.jsx'
import { Notice } from '../ui/Field.jsx'
import { useT } from '../../hooks/useT.js'
import { useAuth } from '../../hooks/useAuth.js'
import { sendVerification } from '../../lib/auth.js'
import styles from './VerifyEmailNotice.module.css'

/**
 * Aviso "confirma o teu email" para contas com email por confirmar.
 * Avaliar, candidatar-se a criador e publicar ficam bloqueados até confirmar (ver firestore.rules).
 * Não aparece com email confirmado, sem sessão ou sem Firebase.
 */
export default function VerifyEmailNotice({ reasonKey = '' }) {
  const { t } = useT()
  const { user, emailVerified, refreshVerified } = useAuth()
  const [msg, setMsg] = useState('') // 'sent' | 'still' | 'error'
  const [busy, setBusy] = useState(false)

  if (!user || emailVerified) return null

  async function resend() {
    setBusy(true)
    try {
      await sendVerification(user)
      setMsg('sent')
    } catch (err) {
      console.warn('[brioverse] reenvio falhou:', err?.code || err?.message)
      setMsg(err?.code === 'auth/too-many-requests' ? 'too_many' : 'error')
    }
    setBusy(false)
  }

  async function check() {
    setBusy(true)
    const ok = await refreshVerified()
    setMsg(ok ? '' : 'still')
    setBusy(false)
  }

  return (
    <Notice tone="warning">
      <div className={styles.body}>
        <strong>{t('auth.verify_title')}</strong>
        <span>
          {t('auth.verify_text', { email: user.email })} {reasonKey && t(reasonKey)}
        </span>
        {msg && <span className={styles.msg}>{t(`auth.verify_${msg}`)}</span>}
        <span className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={check} disabled={busy}>
            {t('auth.verify_check')}
          </Button>
          <Button variant="ghost" size="sm" onClick={resend} disabled={busy}>
            {t('auth.verify_resend')}
          </Button>
        </span>
      </div>
    </Notice>
  )
}

VerifyEmailNotice.propTypes = {
  /** chave i18n com o que fica bloqueado (ex. 'auth.verify_review') */
  reasonKey: PropTypes.string,
}
