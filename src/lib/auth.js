import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider, requireFirebase } from './firebase.js'

/** Perfil mínimo derivado do utilizador Auth (usado se o Firestore falhar). */
export function profileFromUser(user, extra = {}) {
  return {
    name: user.displayName || extra.name || user.email?.split('@')[0] || '',
    email: user.email || '',
    role: 'consumer',
    avatarUrl: user.photoURL || '',
  }
}

/** Garante que existe users/{uid}. Nunca impede o login: se o Firestore falhar, devolve perfil mínimo. */
export async function ensureUserDoc(user, extra = {}) {
  const ref = doc(db, 'users', user.uid)
  try {
    const snap = await getDoc(ref)
    if (snap.exists()) return snap.data()
    const profile = { ...profileFromUser(user, extra), createdAt: serverTimestamp() }
    await setDoc(ref, profile)
    return profile
  } catch (err) {
    console.warn('[brioverse] não foi possível ler/criar users/{uid}:', err?.code || err?.message)
    return profileFromUser(user, extra)
  }
}

export async function loginWithGoogle() {
  requireFirebase()
  try {
    const { user } = await signInWithPopup(auth, googleProvider)
    await ensureUserDoc(user)
    return user
  } catch (err) {
    // Popup bloqueado (comum em mobile/PWA): cai para redirect.
    if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, googleProvider)
      return null
    }
    throw err
  }
}

/** Chamar uma vez no arranque para concluir um login por redirect. */
export async function finishRedirectLogin() {
  requireFirebase()
  try {
    const result = await getRedirectResult(auth)
    if (result?.user) await ensureUserDoc(result.user)
    return result?.user ?? null
  } catch (err) {
    console.warn('[brioverse] redirect login falhou:', err?.code || err?.message)
    return null
  }
}

export async function loginWithEmail(email, password) {
  requireFirebase()
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  await ensureUserDoc(user)
  return user
}

export async function registerWithEmail({ name, email, password }) {
  requireFirebase()
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  if (name) {
    try {
      await updateProfile(user, { displayName: name })
    } catch {
      /* não crítico */
    }
  }
  await ensureUserDoc(user, { name })
  // email tem de ser real: o link de confirmação vai já; sem confirmar não avalia, não se candidata nem publica
  try {
    await sendEmailVerification(user)
  } catch (err) {
    console.warn('[brioverse] email de confirmação não enviado:', err?.code || err?.message)
  }
  return user
}

export function sendVerification(user) {
  requireFirebase()
  return sendEmailVerification(user)
}

/** Volta a ler o utilizador no Firebase (depois de clicar no link de confirmação). */
export async function reloadUser() {
  requireFirebase()
  if (!auth.currentUser) return null
  await auth.currentUser.reload()
  return auth.currentUser
}

export function resetPassword(email) {
  requireFirebase()
  return sendPasswordResetEmail(auth, email)
}

export function logout() {
  requireFirebase()
  return signOut(auth)
}

export function observeAuth(callback) {
  requireFirebase()
  return onAuthStateChanged(auth, callback)
}

export async function fetchProfile(uid) {
  requireFirebase()
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

/** Converte um código de erro do Firebase Auth numa chave i18n `auth.err_*`. */
export function authErrorKey(err) {
  const code = err?.code || ''
  switch (code) {
    case 'auth/invalid-email':
      return 'auth.err_invalid_email'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'auth.err_bad_credentials'
    case 'auth/email-already-in-use':
      return 'auth.err_email_in_use'
    case 'auth/weak-password':
      return 'auth.err_weak_password'
    case 'auth/too-many-requests':
      return 'auth.err_too_many'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'auth.err_popup_closed'
    case 'auth/unauthorized-domain':
      return 'auth.err_unauthorized_domain'
    case 'auth/operation-not-allowed':
      return 'auth.err_not_allowed'
    case 'auth/network-request-failed':
      return 'auth.err_network'
    default:
      return 'auth.err_generic'
  }
}
