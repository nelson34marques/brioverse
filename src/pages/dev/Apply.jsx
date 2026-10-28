import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../../components/layout/Container.jsx'
import Button from '../../components/ui/Button.jsx'
import Chip from '../../components/ui/Chip.jsx'
import { Field, Input, Textarea, Notice } from '../../components/ui/Field.jsx'
import VerifyEmailNotice from '../../components/auth/VerifyEmailNotice.jsx'
import { useT } from '../../hooks/useT.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useDev } from '../../hooks/useDev.js'
import { saveApplication, validateApplication, LIMITS } from '../../lib/developers.js'
import { isFirebaseConfigured } from '../../lib/firebase.js'
import styles from './Dev.module.css'
import form from '../../components/ui/Form.module.css'

const EMPTY = {
  kind: 'individual',
  name: '',
  legalName: '',
  registration: '',
  description: '',
  website: '',
  repo: '',
  sampleUrl: '',
  contactEmail: '',
  accept: false,
}

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 5 5L20 7" />
    </svg>
  )
}

/**
 * Candidatura a conta de desenvolvedor (/dev/candidatura).
 * Serve para criar, corrigir (recusada → volta a "em análise") e editar os dados do criador.
 */
export default function Apply() {
  const { t } = useT()
  const { user, profile, emailVerified } = useAuth()
  const { developer, loading, setDeveloper } = useDev()
  const back = developer?.status === 'approved' ? '/dev/perfil' : '/dev'
  const [f, setF] = useState(null)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [fail, setFail] = useState('')
  const [done, setDone] = useState('') // 'sent' | 'saved'

  useEffect(() => {
    if (loading || f) return
    const base = {
      ...EMPTY,
      name: profile?.name || user?.displayName || '',
      contactEmail: user?.email || '',
    }
    if (developer) {
      const { kind, name, legalName, registration, description, website, repo, sampleUrl, contactEmail } = developer
      Object.assign(base, { kind, name, legalName, registration, description, website, repo, sampleUrl, contactEmail, accept: true })
    }
    setF(base)
  }, [loading, developer, f, profile, user])

  const set = (key) => (e) => {
    const v = e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e
    setF((p) => ({ ...p, [key]: v }))
    setErrors((p) => (p[key] ? { ...p, [key]: undefined } : p))
  }

  async function submit(e) {
    e.preventDefault()
    const errs = validateApplication(f)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    setFail('')
    try {
      const saved = await saveApplication(user, f, developer)
      setDeveloper(saved)
      setDone(developer ? 'saved' : 'sent')
    } catch (err) {
      console.warn('[brioverse] candidatura não guardada:', err?.code || err?.message)
      setFail(t('dev.err_generic'))
    }
    setBusy(false)
  }

  if (loading || !f) {
    return (
      <Container className={styles.page}>
        <p className="muted">{t('common.loading')}</p>
      </Container>
    )
  }

  if (developer?.status === 'revoked') {
    return (
      <Container className={styles.page}>
        <header className={styles.header}>
          <span className="eyebrow">{t('dev.eyebrow')}</span>
          <h1 className={styles.title}>{t('dev.apply_title')}</h1>
        </header>
        <Notice tone="danger">
          {t('account.dev_revoked')} {developer.note && <strong>{developer.note}</strong>}
        </Notice>
        <div>
          <Button variant="secondary" to="/conta">
            {t('devnav.exit')}
          </Button>
        </div>
      </Container>
    )
  }

  if (done === 'sent') {
    return (
      <Container className={styles.page}>
        <section className={`${styles.card} ${styles.success}`}>
          <span className={styles.successIcon}>
            <CheckIcon />
          </span>
          <h1 className={styles.h2}>{t('dev.sent_title')}</h1>
          <p className={styles.hint}>{t('dev.sent')}</p>
          <Button variant="cta" to="/dev">
            {t('dev.go_dev')}
          </Button>
        </section>
      </Container>
    )
  }

  const company = f.kind === 'company'
  const err = (k) => (errors[k] ? t(errors[k], { n: LIMITS.descriptionMin }) : '')
  const submitKey = !developer ? 'dev.submit' : developer.status === 'rejected' ? 'dev.resubmit' : 'dev.update'

  return (
    <Container className={styles.page}>
      <header className={styles.header}>
        <span className="eyebrow">{t('dev.eyebrow')}</span>
        <h1 className={styles.title}>{t('dev.apply_title')}</h1>
        <p className={styles.intro}>{t('dev.apply_intro')}</p>
      </header>

      {!isFirebaseConfigured && <Notice tone="warning">{t('dev.not_configured')}</Notice>}
      <VerifyEmailNotice reasonKey="auth.verify_apply" />
      {developer?.status === 'pending' && <Notice tone="info">{t('dev.pending_notice')}</Notice>}
      {developer?.status === 'rejected' && (
        <Notice tone="danger">
          {t('dev.rejected_notice')} {developer.note && <strong>{developer.note}</strong>}
        </Notice>
      )}
      {done === 'saved' && <Notice tone="success">{t('dev.saved')}</Notice>}

      <form className={`${styles.card} ${form.form}`} onSubmit={submit} noValidate>
        <Field label={t('dev.kind')} error={err('kind')}>
          <div className={styles.chips} role="radiogroup" aria-label={t('dev.kind')}>
            <Chip outline active={!company} onClick={() => set('kind')('individual')}>
              {t('dev.individual')}
            </Chip>
            <Chip outline active={company} onClick={() => set('kind')('company')}>
              {t('dev.company')}
            </Chip>
          </div>
        </Field>

        <Field label={t('dev.name')} htmlFor="dev-name" help={t('dev.name_help')} error={err('name')}>
          <Input
            id="dev-name"
            value={f.name}
            onChange={set('name')}
            maxLength={LIMITS.name}
            placeholder={t('dev.ph_name')}
            invalid={Boolean(errors.name)}
            autoComplete="organization"
          />
        </Field>

        {company && (
          <>
            <Field label={t('dev.legal_name')} htmlFor="dev-legal" error={err('legalName')}>
              <Input
                id="dev-legal"
                value={f.legalName}
                onChange={set('legalName')}
                maxLength={LIMITS.name}
                placeholder={t('dev.ph_legal_name')}
                invalid={Boolean(errors.legalName)}
              />
            </Field>
            <Field label={t('dev.registration')} htmlFor="dev-reg" help={t('dev.registration_help')}>
              <Input id="dev-reg" value={f.registration} onChange={set('registration')} maxLength={LIMITS.name} placeholder={t('dev.ph_registration')} />
            </Field>
          </>
        )}

        <Field label={t('dev.description')} htmlFor="dev-desc" help={t('dev.description_help', { n: LIMITS.descriptionMin })} error={err('description')}>
          <Textarea
            id="dev-desc"
            value={f.description}
            onChange={set('description')}
            maxLength={LIMITS.descriptionMax}
            rows={5}
            placeholder={t('dev.ph_description')}
            invalid={Boolean(errors.description)}
          />
          <span className={form.counter}>
            {f.description.length}/{LIMITS.descriptionMax}
          </span>
        </Field>

        <Field label={t('dev.website')} htmlFor="dev-site" help={t('dev.website_help')} error={err('website')}>
          <Input id="dev-site" type="url" inputMode="url" value={f.website} onChange={set('website')} maxLength={LIMITS.url} placeholder="https://" invalid={Boolean(errors.website)} />
        </Field>

        <Field label={t('dev.sample')} htmlFor="dev-sample" help={t('dev.sample_help')} error={err('sampleUrl')}>
          <Input
            id="dev-sample"
            type="url"
            inputMode="url"
            value={f.sampleUrl}
            onChange={set('sampleUrl')}
            maxLength={LIMITS.url}
            placeholder="https://"
            invalid={Boolean(errors.sampleUrl)}
          />
        </Field>

        <Field label={t('dev.repo')} htmlFor="dev-repo" help={t('dev.repo_help')} error={err('repo')}>
          <Input id="dev-repo" type="url" inputMode="url" value={f.repo} onChange={set('repo')} maxLength={LIMITS.url} placeholder="https://github.com/…" invalid={Boolean(errors.repo)} />
        </Field>

        <Field label={t('dev.contact')} htmlFor="dev-email" help={t('dev.contact_help')} error={err('contactEmail')}>
          <Input
            id="dev-email"
            type="email"
            inputMode="email"
            value={f.contactEmail}
            onChange={set('contactEmail')}
            maxLength={LIMITS.email}
            placeholder={t('auth.ph_email')}
            invalid={Boolean(errors.contactEmail)}
            autoComplete="email"
          />
        </Field>

        <label className={form.check}>
          <input type="checkbox" checked={f.accept} onChange={set('accept')} />
          <span>
            {t('dev.accept_pre')} <Link to="/termos">{t('legal.terms_title')}</Link>
            {t('dev.accept_post')}
          </span>
        </label>
        {errors.accept && <p className={form.error}>{t('dev.err_accept')}</p>}

        {fail && <Notice tone="danger">{fail}</Notice>}

        <div className={form.actions}>
          <Button variant="ghost" to={back}>
            {t('common.cancel')}
          </Button>
          <Button variant="cta" type="submit" disabled={busy || !emailVerified}>
            {busy ? t('dev.sending') : t(submitKey)}
          </Button>
        </div>
      </form>
    </Container>
  )
}
