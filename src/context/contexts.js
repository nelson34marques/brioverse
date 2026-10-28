// Objectos de contexto isolados para o Fast Refresh funcionar
// (ficheiros .jsx devem exportar só componentes).
import { createContext } from 'react'

export const ThemeContext = createContext(null)
export const AuthContext = createContext(null)
export const I18nContext = createContext(null)
export const PrefsContext = createContext(null)
export const DevContext = createContext(null)
export const LibraryContext = createContext(null)
