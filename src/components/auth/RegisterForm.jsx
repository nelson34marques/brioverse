import { useState } from 'react'
import PropTypes from 'prop-types'
import Button from '../ui/Button.jsx'
import GoogleIcon from '../ui/GoogleIcon.jsx'
import { useT } from '../../hooks/useT.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useAuthActions } from '../../hooks/useAuthActions.js'
import styles from '../../pages/Auth.module.css'

/** Formulário de criar conta. Usado no cartão (PC) e na folha (telemóvel). */
export default function RegisterForm({ onSwitch }) {
  const { t } = useT()
  const { configured } = useAuth()
  const { busy, errorKey, google, register } = useAuthActions()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function submit(e) {
    e.preventDefault()
    register({ name: name.trim(), email: email.trim(), password })
  }

  return (
    <>
      {!configured && <p className={styles.notice}>{t('auth.not_configured')}</p>}
      {errorKey && (
        <p className={styles.error} role="alert">
          {t(errorKey)}
        </p>
      )}

      <Button variant="ghost" className={styles.google} disabled={!configured || busy} onClick={google}>
        <GoogleIcon />
        {t('auth.google')}
      </Button>

      <div className={styles.divider}>
        <span>{t('auth.or')}</span>
      </div>

      <form className={styles.form} onSubmit={submit}>
        <label>
          <span>{t('auth.name')}</span>
          <input type="text" name="name" autoComplete="name" placeholder={t('auth.ph_name')} required value={name} onChange={(e) => setName(e.target.value)} disabled={busy} />
        </label>
        <label>
          <span>{t('auth.email')}</span>
          <input type="email" name="email" autoComplete="email" placeholder={t('auth.ph_email')} required value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} />
        </label>
        <label>
          <span>{t('auth.password')}</span>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder={t('auth.ph_password_new')}
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
          />
          <small className={styles.hint}>{t('auth.password_hint')}</small>
        </label>
        <Button type="submit" disabled={!configured || busy}>
          {busy ? t('common.loading') : t('auth.submit_register')}
        </Button>
      </form>

      <p className={styles.alt}>
        {t('auth.has_account')}{' '}
        <button type="button" className={styles.switch} onClick={onSwitch}>
          {t('auth.login_title')}
        </button>
      </p>
    </>
  )
}

RegisterForm.propTypes = {
  onSwitch: PropTypes.func.isRequired,
}
