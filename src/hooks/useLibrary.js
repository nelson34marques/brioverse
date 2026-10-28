import { useContext } from 'react'
import { LibraryContext } from '../context/contexts.js'

/** Biblioteca do cliente e actualizações por ver (ver LibraryContext). */
export function useLibrary() {
  return useContext(LibraryContext)
}
