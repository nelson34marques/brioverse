import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useT } from '../../hooks/useT.js'
import { directImageUrl } from '../../lib/images.js'
import { UPLOAD, uploadImage } from '../../lib/upload.js'
import form from '../ui/Form.module.css'
import styles from './IconInput.module.css'

const SIDE = 512 // imagens maiores são reduzidas para 512 px antes de enviar

/**
 * Imagem quadrada enviada do dispositivo (ver lib/upload.js): o ícone do app (shape="icon")
 * ou a foto/logótipo do criador (shape="circle").
 * `value` é o link guardado (o de apps antigos, colado à mão, continua a aparecer até ser trocado).
 * Com `removeLabel` a imagem é opcional e pode ser retirada.
 */
export default function IconInput({ id, value, onChange, invalid = false, onBusyChange, shape = 'icon', addLabel, changeLabel, removeLabel }) {
  const { t } = useT()
  const [preview, setPreview] = useState('') // imagem local enquanto envia
  const [problem, setProblem] = useState('')
  const [broken, setBroken] = useState(false)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  useEffect(() => setBroken(false), [value])

  async function pick(e) {
    const file = e.target.files[0]
    e.target.value = '' // deixa escolher o mesmo ficheiro outra vez
    if (!file) return
    if (!UPLOAD.types.includes(file.type)) return setProblem(t('dev.err_shot_type', { name: file.name }))
    if (file.size > UPLOAD.maxMb * 1024 * 1024) return setProblem(t('dev.err_shot_size', { name: file.name, mb: UPLOAD.maxMb }))

    setProblem('')
    const local = URL.createObjectURL(file)
    setPreview(local)
    onBusyChange?.(true)
    try {
      onChange(await uploadImage(file, { maxSide: SIDE }))
    } catch (error) {
      console.warn('[brioverse] imagem não enviada:', error?.message)
      if (alive.current) setProblem(t('dev.err_shot_upload', { name: file.name }))
    }
    URL.revokeObjectURL(local)
    if (alive.current) setPreview('')
    onBusyChange?.(false)
  }

  const busy = Boolean(preview)
  const src = preview || (broken ? '' : directImageUrl(value))
  const bad = invalid || broken

  return (
    <div className={styles.row}>
      <div className={`${styles.preview} ${shape === 'circle' ? styles.circle : ''} ${bad ? styles.bad : ''} ${busy ? styles.loading : ''}`} aria-invalid={bad || undefined}>
        {src && <img src={src} alt="" referrerPolicy="no-referrer" onError={() => !preview && setBroken(true)} />}
        {busy && <span className={styles.spinner} role="status" aria-label={t('dev.shot_uploading')} />}
      </div>
      <div className={styles.side}>
        <label className={`${styles.pick} ${busy ? styles.disabled : ''}`}>
          <input id={id} className="sr-only" type="file" accept={UPLOAD.types.join(',')} onChange={pick} disabled={busy} />
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 16V4m0 0-4 4m4-4 4 4M5 20h14" />
          </svg>
          <span>{busy ? t('dev.shot_uploading') : value ? changeLabel || t('dev.icon_change') : addLabel || t('dev.icon_add')}</span>
        </label>
        {removeLabel && value && !busy && (
          <button type="button" className={styles.removeBtn} onClick={() => onChange('')}>
            {removeLabel}
          </button>
        )}
        {problem && (
          <p className={form.error} role="alert">
            {problem}
          </p>
        )}
      </div>
    </div>
  )
}

IconInput.propTypes = {
  id: PropTypes.string,
  /** link da imagem guardada/enviada */
  value: PropTypes.string.isRequired,
  /** recebe o link novo depois do envio ('' ao remover) */
  onChange: PropTypes.func.isRequired,
  invalid: PropTypes.bool,
  /** avisa o formulário enquanto o envio decorre */
  onBusyChange: PropTypes.func,
  /** "icon" = cantos de ícone de app; "circle" = foto de perfil */
  shape: PropTypes.oneOf(['icon', 'circle']),
  addLabel: PropTypes.string,
  changeLabel: PropTypes.string,
  /** se existir, mostra o botão para retirar a imagem (campo opcional) */
  removeLabel: PropTypes.string,
}
