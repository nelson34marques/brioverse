import { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { I18nContext } from '../context/contexts.js'
import pt from './pt.json'
import en from './en.json'

const DICTS = { pt, en }
const STORAGE_KEY = 'brioverse:lang'
const DEFAULT_LANG = 'pt'

function detectLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && DICTS[saved]) return saved
  } catch {
    /* localStorage indisponível */
  }
  const list = Array.isArray(navigator.languages) ? navigator.languages : [navigator.language]
  for (const entry of list) {
    const short = String(entry || '').slice(0, 2).toLowerCase()
    if (DICTS[short]) return short
  }
  return DEFAULT_LANG
}

function lookup(dict, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] != null ? acc[key] : undefined), dict)
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // segue a língua do browser enquanto o utilizador não escolher outra; a escolha manual fica guardada
  useEffect(() => {
    const onLanguageChange = () => {
      try {
        if (localStorage.getItem(STORAGE_KEY)) return
      } catch {
        /* sem storage: redetecta sempre */
      }
      setLangState(detectLang())
    }
    window.addEventListener('languagechange', onLanguageChange)
    return () => window.removeEventListener('languagechange', onLanguageChange)
  }, [])

  const setLang = useCallback((next) => {
    if (DICTS[next]) {
      setLangState(next)
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        /* localStorage indisponível: fica só nesta sessão */
      }
    }
  }, [])

  const t = useCallback(
    (path, vars) => {
      let value = lookup(DICTS[lang], path) ?? lookup(DICTS[DEFAULT_LANG], path) ?? path
      if (vars && typeof value === 'string') {
        value = value.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : `{${k}}`))
      }
      return value
    },
    [lang],
  )

  const value = useMemo(() => ({ lang, setLang, t, langs: Object.keys(DICTS) }), [lang, setLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

I18nProvider.propTypes = {
  children: PropTypes.node,
}
