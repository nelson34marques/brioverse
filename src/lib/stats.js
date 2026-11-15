// Contadores reais: visualizações (abrir a página do app) e cliques (Abrir/Baixar).
// Best-effort: nunca bloqueia a UI; sem Firebase (loja local), não faz nada.
// Uma visualização por app por sessão do browser (sessionStorage).
// O país é uma ESTIMATIVA derivada da língua e do fuso horário do browser —
// nunca guardamos o IP nem a localização exacta.
import { doc, updateDoc, increment } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase.js'
import { dataSource } from './db.js'

const SEEN_KEY = 'brioverse:seen'

function seen() {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(SEEN_KEY)) || [])
  } catch {
    return new Set()
  }
}

// fuso horário → país, para os casos em que a língua não traz região (ex.: "pt")
const TZ_TO_COUNTRY = {
  'Europe/Lisbon': 'PT', 'Atlantic/Azores': 'PT', 'Atlantic/Madeira': 'PT',
  'Europe/Madrid': 'ES', 'Europe/London': 'GB', 'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE', 'Europe/Rome': 'IT', 'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE', 'Europe/Dublin': 'IE', 'Europe/Zurich': 'CH',
  'Europe/Vienna': 'AT', 'Europe/Prague': 'CZ', 'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO', 'Europe/Helsinki': 'FI', 'Europe/Athens': 'GR',
  'Europe/Warsaw': 'PL', 'Europe/Bucharest': 'RO', 'Europe/Sofia': 'BG',
  'Europe/Budapest': 'HU', 'Europe/Kyiv': 'UA', 'Europe/Moscow': 'RU',
  'Europe/Istanbul': 'TR', 'America/Sao_Paulo': 'BR',
  'America/Argentina/Buenos_Aires': 'AR', 'America/Mexico_City': 'MX',
  'America/Bogota': 'CO', 'America/Santiago': 'CL', 'America/Lima': 'PE',
  'America/Toronto': 'CA', 'America/Vancouver': 'CA',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
  'America/Los_Angeles': 'US', 'America/Phoenix': 'US',
  'Africa/Luanda': 'AO', 'Africa/Maputo': 'MZ', 'Africa/Bissau': 'GW',
  'Africa/Sao_Tome': 'ST', 'Africa/Praia': 'CV', 'Asia/Dili': 'TL',
  'Africa/Cairo': 'EG', 'Africa/Lagos': 'NG', 'Africa/Johannesburg': 'ZA',
  'Asia/Dubai': 'AE', 'Asia/Tokyo': 'JP', 'Asia/Shanghai': 'CN',
  'Asia/Singapore': 'SG', 'Asia/Kolkata': 'IN', 'Asia/Hong_Kong': 'HK',
  'Australia/Sydney': 'AU', 'Pacific/Auckland': 'NZ',
}

/** Melhor estimativa possível do país do visitante (ISO 3166-1 alpha-2), ou 'XX' se desconhecido. */
export function countryGuess() {
  try {
    const lang = String(navigator.language || '').trim()
    const match = lang.match(/[-_]([A-Za-z]{2})(-[A-Za-z]{2,})?$/)
    if (match) return match[1].toUpperCase()
    const region = new Intl.Locale(lang || 'en').region
    if (region && /^[A-Za-z]{2}$/.test(region)) return region.toUpperCase()
  } catch {
    /* Intl.Locale indisponível ou entrada estranha: tenta o fuso */
  }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    return TZ_TO_COUNTRY[tz] || 'XX'
  } catch {
    return 'XX'
  }
}

async function bump(appId, field) {
  if (!isFirebaseConfigured || dataSource() !== 'firestore') return
  try {
    const updates = { [`stats.${field}`]: increment(1) }
    if (field === 'views') {
      // companheiro para as regras validarem "um país por escrita, +1"
      const code = countryGuess()
      updates[`stats.byCountry.${code}`] = increment(1)
      updates['stats.byCountryCode'] = code
    }
    await updateDoc(doc(db, 'apps', appId), updates)
  } catch (err) {
    console.warn(`[brioverse] stats.${field} não actualizado:`, err?.code || err?.message)
  }
}

export function trackView(appId) {
  if (!appId) return
  const s = seen()
  if (s.has(appId)) return
  s.add(appId)
  try {
    sessionStorage.setItem(SEEN_KEY, JSON.stringify([...s]))
  } catch {
    /* ignore */
  }
  bump(appId, 'views')
}

export function trackClick(appId) {
  if (appId) bump(appId, 'clicks')
}
