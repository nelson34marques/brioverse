import { useState } from 'react'
import PropTypes from 'prop-types'
import Button from '../ui/Button.jsx'
import GoogleIcon from '../ui/GoogleIcon.jsx'
import { useT } from '../../hooks/useT.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useAuthActions } from '../../hooks/useAuthActions.js'
import styles from '../../pages/Auth.module.css'

/** Formulário de entrada (Google + email/palavra-passe). Usado no cartão (PC) e na folha (telemóvel). */
export default function LoginForm({ onSwitch }) {
  const { t } = useT()
  const { configured } = useAuth()
  const { busy, errorKey, info, google, login, forgot } = useAuthActions()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function submit(e) {
    e.preventDefault()
    login(email.trim(), password)
  }

  return (
    <>
      {!configured && <p className={styles.notice}>{t('auth.not_configured')}</p>}
      {errorKey && (
        <p className={styles.error} role="alert">
          {t(errorKey)}
        </p>
      )}
      {info && <p className={styles.info}>{t(info)}</p>}

      <Button variant="ghost" className={styles.google} disabled={!configured || busy} onClick={google}>
        <GoogleIcon />
        {t('auth.google')}
      </Button>

      <div className={styles.divider}>
        <span>{t('auth.or')}</span>
      </div>

      <form className={styles.form} onSubmit={submit}>
        <label>
          <span>{t('auth.email')}</span>
          <input type="email" name="email" autoComplete="email" placeholder={t('auth.ph_email')} required value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} />
        </label>
        <label>
          <span>{t('auth.password')}</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder={t('auth.ph_password')}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
          />
        </label>
        <Button type="submit" disabled={!configured || busy}>
          {busy ? t('common.loading') : t('auth.submit_login')}
        </Button>
        <button type="button" className={styles.linkBtn} disabled={busy || !email.trim()} onClick={() => forgot(email.trim())}>
          {t('auth.forgot')}
        </button>
      </form>

      <p className={styles.alt}>
        {t('auth.no_account')}{' '}
        <button type="button" className={styles.switch} onClick={onSwitch}>
          {t('auth.register_title')}
        </button>
      </p>
    </>
  )
}

LoginForm.propTypes = {
  onSwitch: PropTypes.func.isRequired,
}
