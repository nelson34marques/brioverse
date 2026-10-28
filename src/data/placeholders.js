// Imagens placeholder geradas em SVG (data URI). Usadas quando um app
// ainda não tem ícone/screenshots.

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}

/** Escurece uma cor hex (#rrggbb) por um factor 0..1. */
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.round(((n >> 16) & 255) * (1 - f))
  const g = Math.round(((n >> 8) & 255) * (1 - f))
  const b = Math.round((n & 255) * (1 - f))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

export function placeholderIcon(label, color = '#2a9d8f', size = 256) {
  const letter = esc((label || '?').trim().charAt(0).toUpperCase())
  const dark = shade(color, 0.45)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>
<rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#g)"/>
<circle cx="${size * 0.72}" cy="${size * 0.28}" r="${size * 0.34}" fill="rgba(255,255,255,0.08)"/>
<text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
 font-family="Inter,system-ui,Segoe UI,Roboto,sans-serif" font-size="${size * 0.46}" font-weight="700" fill="rgba(255,255,255,0.95)">${letter}</text>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function placeholderShot(label, color = '#2a9d8f', w = 540, h = 960, n = 1) {
  const dark = shade(color, 0.6)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#g)"/>
<rect x="40" y="120" width="${w - 80}" height="56" rx="16" fill="rgba(255,255,255,0.16)"/>
<rect x="40" y="210" width="${w - 80}" height="${h * 0.32}" rx="24" fill="rgba(255,255,255,0.1)"/>
<rect x="40" y="${h * 0.32 + 240}" width="${(w - 80) * 0.6}" height="28" rx="8" fill="rgba(255,255,255,0.22)"/>
<rect x="40" y="${h * 0.32 + 290}" width="${(w - 80) * 0.85}" height="20" rx="6" fill="rgba(255,255,255,0.12)"/>
<rect x="40" y="${h * 0.32 + 330}" width="${(w - 80) * 0.75}" height="20" rx="6" fill="rgba(255,255,255,0.12)"/>
<text x="50%" y="${h - 80}" text-anchor="middle" font-family="Inter,system-ui,Segoe UI,Roboto,sans-serif"
 font-size="28" fill="rgba(255,255,255,0.6)">${esc(label)} · ${n}</text>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
