export function compactNumber(n, lang = 'pt') {
  if (n == null) return '–'
  return new Intl.NumberFormat(lang === 'pt' ? 'pt-PT' : 'en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

export function rating1(n) {
  if (!n) return '–'
  return (Math.round(n * 10) / 10).toFixed(1)
}

export function sizeMb(n) {
  if (!n) return null
  return `${Math.round(n * 10) / 10} MB`
}

export function shortDate(ms, lang = 'pt') {
  if (!ms) return ''
  return new Intl.DateTimeFormat(lang === 'pt' ? 'pt-PT' : 'en', { day: 'numeric', month: 'short', year: 'numeric' }).format(ms)
}
