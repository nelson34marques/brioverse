import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Navigate, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import Button from '../components/ui/Button.jsx'
import Modal from '../components/ui/Modal.jsx'
import Backdrop from '../components/ui/Backdrop.jsx'
import LoginForm from '../components/auth/LoginForm.jsx'
import RegisterForm from '../components/auth/RegisterForm.jsx'
import { useT } from '../hooks/useT.js'
import { useAuth } from '../hooks/useAuth.js'
import { useMediaQuery } from '../hooks/useMediaQuery.js'
import styles from './AuthScreen.module.css'

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m15 6-6 6 6 6" />
    </svg>
  )
}

/**
 * Entrar / Criar conta: ecrã inteiro, sem header nem barra inferior.
 *  Telemóvel: boas-vindas (logo, mensagem, canvas) com os botões em baixo;
 *             "Entrar" e "Criar conta" abrem uma folha com o formulário.
 *  PC:        logo e mensagem à esquerda, formulário à direita.
 */
export default function AuthScreen({ mode: initialMode }) {
  const { t } = useT()
  const navigate = useNavigate()
  const { isAuthenticated, loading } = useAuth()
  const mobile = useMediaQuery('(max-width: 767px)')
  const [mode, setMode] = useState(initialMode)
  const [sheet, setSheet] = useState(false)

  useEffect(() => setMode(initialMode), [initialMode])

  // Ecrã inteiro: sem scroll da página por trás
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  if (!loading && isAuthenticated) return <Navigate to="/" replace />

  const switchMode = () => {
    const next = mode === 'login' ? 'register' : 'login'
    setMode(next)
    navigate(next === 'login' ? '/entrar' : '/registar', { replace: true })
  }
  const form = mode === 'login' ? <LoginForm key="login" onSwitch={switchMode} /> : <RegisterForm key="register" onSwitch={switchMode} />
  const title = mode === 'login' ? t('auth.login_title') : t('auth.register_title')

  const hero = (
    <div className={styles.hero}>
      <img className={styles.mark} src="/logo-brio.png" alt="" width="96" height="96" />
      <p className={styles.brand}>
        Brio<span className={styles.verse}>Verse</span>
      </p>
      <h1 className={styles.headline}>{t('auth.welcome_headline')}</h1>
      <p className={styles.text}>{t('auth.welcome_text')}</p>
    </div>
  )

  if (!mobile) {
    return createPortal(
      <div className={styles.screen}>
        <Backdrop />
        <div className={`${styles.content} ${styles.split}`}>
          <button type="button" className={styles.back} onClick={() => navigate(-1)} aria-label={t('common.back')}>
            <BackIcon />
          </button>
          <div className={styles.left}>{hero}</div>
          <div className={styles.right}>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>{title}</h2>
              {form}
            </div>
          </div>
        </div>
      </div>,
      document.body,
    )
  }

  return createPortal(
    <div className={styles.screen}>
      <Backdrop />
      <div className={styles.content}>
        <button type="button" className={styles.back} onClick={() => navigate(-1)} aria-label={t('common.back')}>
          <BackIcon />
        </button>

        {hero}

        <div className={styles.actions}>
          <Button
            variant="cta"
            size="lg"
            className={styles.primary}
            onClick={() => {
              setMode('login')
              setSheet(true)
            }}
          >
            {t('auth.login_title')}
          </Button>
          <p className={styles.alt}>
            {t('auth.no_account')}{' '}
            <button
              type="button"
              className={styles.link}
              onClick={() => {
                setMode('register')
                setSheet(true)
              }}
            >
              {t('auth.register_title')}
            </button>
          </p>
        </div>
      </div>

      <Modal open={sheet} onClose={() => setSheet(false)} title={title}>
        {sheet && form}
      </Modal>
    </div>,
    document.body,
  )
}

AuthScreen.propTypes = {
  mode: PropTypes.oneOf(['login', 'register']).isRequired,
}
