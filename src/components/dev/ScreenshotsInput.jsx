import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import Lightbox from '../ui/Lightbox.jsx'
import { useT } from '../../hooks/useT.js'
import { directImageUrl } from '../../lib/images.js'
import { UPLOAD, uploadImage } from '../../lib/upload.js'
import form from '../ui/Form.module.css'
import styles from './ScreenshotsInput.module.css'

let seq = 0

/**
 * Capturas de ecrã: o criador escolhe imagens do dispositivo e elas são enviadas (ver lib/upload.js).
 * `value` é a lista de links (os de apps antigos, colados à mão, continuam a aparecer e podem ficar).
 * `onChange` recebe uma função (lista actual → lista nova), porque os envios terminam fora de ordem do render.
 * Tocar numa captura abre-a completa (Lightbox) para o criador a ver bem.
 */
export default function ScreenshotsInput({ id, value, onChange, max, invalid = [], error = false, onBusyChange }) {
  const { t } = useT()
  const [pending, setPending] = useState([]) // { id, preview } a enviar
  const [problems, setProblems] = useState([])
  const [broken, setBroken] = useState({}) // link → true quando o <img> não carregou
  const [open, setOpen] = useState(null) // índice da captura aberta em grande
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  useEffect(() => {
    onBusyChange?.(pending.length > 0)
  }, [pending.length, onBusyChange])

  async function pick(e) {
    const files = [...e.target.files]
    e.target.value = '' // deixa escolher o mesmo ficheiro outra vez
    const room = max - value.length - pending.length
    const errs = []
    const accepted = []
    let extra = false
    for (const file of files) {
      if (!UPLOAD.types.includes(file.type)) errs.push(t('dev.err_shot_type', { name: file.name }))
      else if (file.size > UPLOAD.maxMb * 1024 * 1024) errs.push(t('dev.err_shot_size', { name: file.name, mb: UPLOAD.maxMb }))
      else if (accepted.length < room) accepted.push(file)
      else extra = true
    }
    if (extra) errs.push(t('dev.err_shot_max', { max }))
    setProblems(errs)

    const jobs = accepted.map((file) => ({ id: ++seq, file, preview: URL.createObjectURL(file) }))
    setPending((p) => [...p, ...jobs.map(({ id: jobId, preview }) => ({ id: jobId, preview }))])
    // um de cada vez: mantém a ordem escolhida (a 1.ª captura serve de capa nos destaques)
    for (const job of jobs) {
      try {
        const url = await uploadImage(job.file)
        onChange((list) => (list.length < max ? [...list, url] : list))
      } catch (err) {
        console.warn('[brioverse] captura não enviada:', err?.message)
        if (alive.current) setProblems((p) => [...p, t('dev.err_shot_upload', { name: job.file.name })])
      }
      URL.revokeObjectURL(job.preview)
      if (alive.current) setPending((p) => p.filter((x) => x.id !== job.id))
    }
  }

  const remove = (i) => () => onChange((list) => list.filter((_, j) => j !== i))
  const canAdd = value.length + pending.length < max
  const hasInvalid = error || invalid.length > 0
  const images = value.map(directImageUrl)

  return (
    <>
      <div className={styles.grid} role="group" aria-invalid={hasInvalid || undefined}>
        {value.map((url, i) => {
          const bad = invalid.includes(i) || broken[url]
          return (
            <div key={`${url}#${i}`} className={`${styles.tile} ${bad ? styles.bad : ''}`}>
              {!broken[url] && (
                <button type="button" className={styles.view} onClick={() => setOpen(i)} aria-label={t('app_detail.shot_open', { n: i + 1 })}>
                  <img src={images[i]} alt={t('dev.f_shot_n', { n: i + 1 })} referrerPolicy="no-referrer" onError={() => setBroken((p) => ({ ...p, [url]: true }))} />
                </button>
              )}
              <button type="button" className={styles.remove} onClick={remove(i)} aria-label={t('dev.shot_remove', { n: i + 1 })} title={t('dev.shot_remove', { n: i + 1 })}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
          )
        })}

        {pending.map((p) => (
          <div key={p.id} className={`${styles.tile} ${styles.loading}`} role="status" aria-label={t('dev.shot_uploading')}>
            <img src={p.preview} alt="" />
            <span className={styles.spinner} aria-hidden="true" />
          </div>
        ))}

        {canAdd && (
          <label className={`${styles.tile} ${styles.add}`}>
            <input id={id} className="sr-only" type="file" accept={UPLOAD.types.join(',')} multiple onChange={pick} />
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>{t('dev.shot_add')}</span>
          </label>
        )}
      </div>

      {problems.map((msg, i) => (
        <p key={i} className={form.error} role="alert">
          {msg}
        </p>
      ))}

      <Lightbox images={images} index={open} onIndex={setOpen} onClose={() => setOpen(null)} alt={t('dev.f_shots')} />
    </>
  )
}

ScreenshotsInput.propTypes = {
  id: PropTypes.string,
  /** links das capturas já guardadas/enviadas */
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  /** recebe (lista) => novaLista */
  onChange: PropTypes.func.isRequired,
  max: PropTypes.number.isRequired,
  /** índices de capturas com erro (link inválido ou que não carrega) */
  invalid: PropTypes.arrayOf(PropTypes.number),
  /** erro do conjunto (ex.: faltam capturas) */
  error: PropTypes.bool,
  /** avisa o formulário enquanto há envios a decorrer */
  onBusyChange: PropTypes.func,
}
