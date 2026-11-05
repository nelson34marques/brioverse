// Perfil público do criador (creators/{uid}): nome, foto, tipo, descrição, contacto de suporte e site.
// É uma cópia só dos campos públicos de developers/{uid}, que continua privado (tem dados legais,
// o email da conta e as notas do admin). Mostrado em /criador/{uid}.
// Quem a mantém: o próprio criador ao abrir o modo dev (syncCreator) e o admin ao aprovar,
// revogar ou abrir o painel (syncCreators).
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase.js'
import { localDeveloper } from './developers.js'

const FIELDS = ['name', 'kind', 'description', 'contactEmail', 'website', 'photoUrl']

/** Campos públicos de uma conta de criador. */
export function creatorData(dev) {
  return Object.fromEntries(FIELDS.map((k) => [k, dev?.[k] || '']))
}

const same = (a, b) => Boolean(a) && FIELDS.every((k) => (a[k] || '') === (b?.[k] || ''))

/** Perfil público de um criador, ou null se não existir (ou sem ligação). */
export async function getCreator(uid) {
  if (!uid) return null
  if (!isFirebaseConfigured) {
    const d = localDeveloper()
    return d && d.uid === uid && d.status === 'approved' ? { uid, ...creatorData(d) } : null
  }
  try {
    const snap = await getDoc(doc(db, 'creators', uid))
    return snap.exists() ? { uid, ...creatorData(snap.data()) } : null
  } catch (err) {
    console.warn('[brioverse] perfil do criador indisponível:', err?.code || err?.message)
    return null
  }
}

/** O criador aprovado mantém o seu perfil público igual aos dados da conta. */
export async function syncCreator(dev) {
  if (!isFirebaseConfigured || !dev?.uid || dev.status !== 'approved') return
  const ref = doc(db, 'creators', dev.uid)
  const snap = await getDoc(ref)
  if (snap.exists() && same(snap.data(), dev)) return
  await setDoc(ref, { ...creatorData(dev), updatedAt: serverTimestamp() })
}

/** Admin: cria/actualiza os perfis das contas aprovadas e apaga os das restantes. */
export async function syncCreators(devs) {
  if (!isFirebaseConfigured || !devs.length) return
  const snap = await getDocs(collection(db, 'creators'))
  const have = new Map(snap.docs.map((d) => [d.id, d.data()]))
  const jobs = []
  for (const dev of devs) {
    const ref = doc(db, 'creators', dev.uid)
    if (dev.status === 'approved') {
      if (!same(have.get(dev.uid), dev)) jobs.push(setDoc(ref, { ...creatorData(dev), updatedAt: serverTimestamp() }))
    } else if (have.has(dev.uid)) {
      jobs.push(deleteDoc(ref))
    }
  }
  await Promise.allSettled(jobs)
}
