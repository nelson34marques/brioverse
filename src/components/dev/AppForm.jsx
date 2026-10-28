import { useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import Chip from '../ui/Chip.jsx'
import { Field, Input, Textarea, Notice } from '../ui/Field.jsx'
import { useT } from '../../hooks/useT.js'
import { CATEGORIES } from '../../utils/categories.js'
import { APP_LIMITS, validateApp } from '../../lib/publish.js'
import { directImageUrl, checkImage } from '../../lib/images.js'
import styles from '../../pages/dev/Dev.module.css'
import form from '../ui/Form.module.css'

const isUrl = (s) => /^https:\/\/[^\s/]+\.[^\s]+$/i.test((s || '').trim())

/**
 * Formulário do app, usado em Publicar (mode="create") e Actualizar (mode="edit").
 * Blocos: básico, ligações, imagens, versão e confirmação. `onSubmit(form)` grava e pode lançar.
 */
export default function AppForm({ initial, mode, current = null, cancelTo, onSubmit }) {
  const { t } = useT()
  const editing = mode === 'edit'
  const [f, setF] = useState(initial)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [fail, setFail] = useState('')
  const [broken, setBroken] = useState({}) // campo → true quando o <img> não carregou

  const set = (key) => (e) => {
    const v = e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e
    setF((p) => ({ ...p, [key]: v }))
    setErrors((p) => (p[key] ? { ...p, [key]: undefined } : p))
    setBroken((p) => (p[key] ? { ...p, [key]: false } : p))
  }
  const setShot = (i) => (e) => {
    const v = e.target.value
    setF((p) => {
      const screenshots = [...p.screenshots]
      screenshots[i] = v
      return { ...p, screenshots }
    })
    setErrors((p) => ({ ...p, [`shot${i}`]: undefined, screenshots: undefined }))
    setBroken((p) => ({ ...p, [`shot${i}`]: false }))
  }
  const markBroken = (key) => () => setBroken((p) => ({ ...p, [key]: true }))
  /** Pré-visualização de um link de imagem; marca o campo quando o browser não o carrega. */
  const preview = (url, field, cls) => {
    const src = directImageUrl(url)
    if (!isUrl(src) || broken[field]) return <span className={`${cls} ${styles.iconEmpty} ${broken[field] ? styles.previewBroken : ''}`} aria-hidden="true" />
    return <img className={cls} src={src} alt="" referrerPolicy="no-referrer" onError={markBroken(field)} />
  }
  const err = (k) => (errors[k] ? t(errors[k], { n: APP_LIMITS.shotsMin }) : broken[k] ? t('dev.err_image') : '')

  async function submit(e) {
    e.preventDefault()
    const errs = validateApp(f, { editing })
    if (!Object.keys(errs).length) {
      // Confirma que os links são mesmo imagens (um link de partilha abre no browser mas não serve num <img>).
      setBusy(true)
      const shots = f.screenshots.map(directImageUrl)
      const [iconOk, ...shotsOk] = await Promise.all([checkImage(directImageUrl(f.iconUrl)), ...shots.map((u) => (isUrl(u) ? checkImage(u) : Promise.resolve(true)))])
      if (!iconOk) errs.iconUrl = 'dev.err_image'
      shotsOk.forEach((ok, i) => {
        if (!ok) errs[`shot${i}`] = 'dev.err_image'
      })
      setBusy(false)
    }
    setErrors(errs)
    if (Object.keys(errs).length) {
      document.querySelector(`.${form.invalid}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return
    }
    setBusy(true)
    setFail('')
    try {
      await onSubmit(f)
    } catch (error) {
      console.warn('[brioverse] app não guardado:', error?.code || error?.message)
      setFail(t('dev.err_generic'))
    }
    setBusy(false)
  }

  const apk = f.type === 'apk'
  const versionChanged = editing && current && f.version.trim() !== current.version

  return (
    <form className={form.form} onSubmit={submit} noValidate>
      <section className={styles.card}>
        <h2 className={styles.h2}>{t('dev.sec_basic')}</h2>

        <Field label={t('dev.f_title')} htmlFor="app-title" error={err('title')}>
          <Input id="app-title" value={f.title} onChange={set('title')} maxLength={APP_LIMITS.title} placeholder={t('dev.ph_title')} invalid={Boolean(errors.title)} />
        </Field>

        <div className={styles.grid2}>
          <Field label={t('dev.f_category')} htmlFor="app-cat" error={err('category')}>
            <select id="app-cat" className={styles.select} value={f.category} onChange={set('category')}>
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {t(`categories.${c.key}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('dev.f_type')}>
            <div className={styles.chips} role="radiogroup" aria-label={t('dev.f_type')}>
              <Chip outline active={!apk} onClick={() => set('type')('pwa')}>
                {t('dev.type_pwa')}
              </Chip>
              <Chip outline active={apk} onClick={() => set('type')('apk')}>
                {t('dev.type_apk')}
              </Chip>
            </div>
          </Field>
        </div>

        <Field label={t('dev.f_short')} htmlFor="app-short" help={t('dev.f_short_help')} error={err('shortDescription')}>
          <Input id="app-short" value={f.shortDescription} onChange={set('shortDescription')} maxLength={APP_LIMITS.short} placeholder={t('dev.ph_short')} invalid={Boolean(errors.shortDescription)} />
          <span className={form.counter}>
            {f.shortDescription.length}/{APP_LIMITS.short}
          </span>
        </Field>

        <Field label={t('dev.f_full')} htmlFor="app-full" help={t('dev.f_full_help')} error={err('fullDescription')}>
          <Textarea id="app-full" rows={6} value={f.fullDescription} onChange={set('fullDescription')} maxLength={APP_LIMITS.full} placeholder={t('dev.ph_full')} invalid={Boolean(errors.fullDescription)} />
          <span className={form.counter}>
            {f.fullDescription.length}/{APP_LIMITS.full}
          </span>
        </Field>

        <Field label={t('dev.f_keywords')} htmlFor="app-kw" help={t('dev.f_keywords_help')}>
          <Input id="app-kw" value={f.keywords} onChange={set('keywords')} placeholder={t('dev.ph_keywords')} />
        </Field>
      </section>

      <section className={styles.card}>
        <h2 className={styles.h2}>{t('dev.sec_links')}</h2>

        {apk ? (
          <>
            <Field label={t('dev.f_apkUrl')} htmlFor="app-apk" help={t('dev.f_apkUrl_help')} error={err('apkUrl')}>
              <Input id="app-apk" type="url" inputMode="url" value={f.apkUrl} onChange={set('apkUrl')} placeholder="https://github.com/…/releases/…/app.apk" invalid={Boolean(errors.apkUrl)} />
            </Field>
            <div className={styles.grid2}>
              <Field label={t('dev.f_apkSize')} htmlFor="app-size" error={err('apkSizeMb')}>
                <Input id="app-size" type="number" inputMode="decimal" min="0" step="0.1" value={f.apkSizeMb} onChange={set('apkSizeMb')} placeholder="12.5" invalid={Boolean(errors.apkSizeMb)} />
              </Field>
              <Field label={t('dev.f_webUrl')} htmlFor="app-web" error={err('webUrl')}>
                <Input id="app-web" type="url" inputMode="url" value={f.webUrl} onChange={set('webUrl')} placeholder="https://" invalid={Boolean(errors.webUrl)} />
              </Field>
            </div>
          </>
        ) : (
          <Field label={t('dev.f_appUrl')} htmlFor="app-url" help={t('dev.f_appUrl_help')} error={err('appUrl')}>
            <Input id="app-url" type="url" inputMode="url" value={f.appUrl} onChange={set('appUrl')} placeholder="https://" invalid={Boolean(errors.appUrl)} />
          </Field>
        )}

        <Field label={t('dev.f_desktopUrl')} htmlFor="app-desktop" help={t('dev.f_desktopUrl_help')} error={err('desktopUrl')}>
          <Input id="app-desktop" type="url" inputMode="url" value={f.desktopUrl} onChange={set('desktopUrl')} placeholder="https://" invalid={Boolean(errors.desktopUrl)} />
        </Field>
      </section>

      <section className={styles.card}>
        <h2 className={styles.h2}>{t('dev.sec_media')}</h2>
        <p className={styles.hint}>{t('dev.media_hint')}</p>

        <Field label={t('dev.f_icon')} htmlFor="app-icon" help={t('dev.f_icon_help')} error={err('iconUrl')}>
          <div className={styles.iconRow}>
            {preview(f.iconUrl, 'iconUrl', styles.iconPreview)}
            <Input id="app-icon" type="url" inputMode="url" value={f.iconUrl} onChange={set('iconUrl')} placeholder="https://…/icon-512.png" invalid={Boolean(errors.iconUrl || broken.iconUrl)} />
          </div>
        </Field>

        <Field label={t('dev.f_shots')} help={t('dev.f_shots_help', { n: APP_LIMITS.shotsMin, max: APP_LIMITS.shots })} error={err('screenshots')}>
          <div className={styles.shots}>
            {f.screenshots.map((s, i) => (
              <div key={i} className={styles.shotRow}>
                {preview(s, `shot${i}`, styles.shotPreview)}
                <div className={form.field}>
                  <Input type="url" inputMode="url" value={s} onChange={setShot(i)} placeholder={`${t('dev.f_shot_n', { n: i + 1 })} · https://`} aria-label={t('dev.f_shot_n', { n: i + 1 })} invalid={Boolean(errors[`shot${i}`] || broken[`shot${i}`])} />
                  {err(`shot${i}`) && <p className={form.error}>{err(`shot${i}`)}</p>}
                </div>
              </div>
            ))}
          </div>
        </Field>
      </section>

      <section className={styles.card}>
        <h2 className={styles.h2}>{t('dev.sec_version')}</h2>
        {editing && current && <p className={styles.hint}>{t('dev.current_version', { v: current.version })}</p>}
        <div className={styles.grid2}>
          <Field label={t('dev.f_version')} htmlFor="app-version" help={t('dev.f_version_help')} error={err('version')}>
            <Input id="app-version" value={f.version} onChange={set('version')} maxLength={APP_LIMITS.version} placeholder="1.0.0" invalid={Boolean(errors.version)} />
          </Field>
        </div>
        <Field label={t('dev.f_changelog')} htmlFor="app-changelog" help={t(editing ? 'dev.f_changelog_help' : 'dev.f_changelog_help_create')} error={err('changelog')}>
          <Textarea id="app-changelog" rows={3} value={f.changelog} onChange={set('changelog')} maxLength={APP_LIMITS.changelog} placeholder={t(editing ? 'dev.ph_changelog' : 'dev.ph_changelog_create')} invalid={Boolean(errors.changelog)} />
          <span className={form.counter}>
            {f.changelog.length}/{APP_LIMITS.changelog}
          </span>
        </Field>
        {versionChanged && <Notice tone="info">{t('dev.version_notice', { v: f.version.trim() })}</Notice>}
      </section>

      <section className={styles.card}>
        <label className={form.check}>
          <input type="checkbox" checked={f.confirm} onChange={set('confirm')} />
          <span>
            {t('dev.f_confirm')} <Link to="/termos">{t('legal.terms_title')}</Link>.
          </span>
        </label>
        {errors.confirm && <p className={form.error}>{t('dev.err_confirm')}</p>}
        {fail && <Notice tone="danger">{fail}</Notice>}
        <div className={form.actions}>
          <Button variant="ghost" to={cancelTo}>
            {t('common.cancel')}
          </Button>
          <Button variant="cta" type="submit" disabled={busy}>
            {busy ? t('dev.sending') : t(editing ? 'dev.edit_submit' : 'dev.publish_submit')}
          </Button>
        </div>
      </section>
    </form>
  )
}

AppForm.propTypes = {
  initial: PropTypes.object.isRequired,
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  /** app actual (em edição), para mostrar a versão corrente */
  current: PropTypes.object,
  cancelTo: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
