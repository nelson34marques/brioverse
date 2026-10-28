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
  const nav = (navigator.language || '').slice(0, 2).toLowerCase()
  return DICTS[nav] ? nav : DEFAULT_LANG
}

function lookup(dict, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] != null ? acc[key] : undefined), dict)
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectLang)

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* ignorar */
    }
  }, [lang])

  const setLang = useCallback((next) => {
    if (DICTS[next]) setLangState(next)
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
