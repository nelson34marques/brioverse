import { useContext } from 'react'
import { DevContext } from '../context/contexts.js'

/** Dados do modo desenvolvedor (ver DevContext). Só dentro de <DevProvider>. */
export function useDev() {
  const ctx = useContext(DevContext)
  if (!ctx) throw new Error('useDev must be used inside <DevProvider>')
  return ctx
}
