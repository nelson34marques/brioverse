// Links de imagens: sem upload, os criadores colam links. Muitos colam a página de partilha
// (Google Drive, Dropbox, GitHub, Imgur), que abre no browser mas não serve num <img>.
// directImageUrl converte os casos conhecidos para o link directo do ficheiro.

const RULES = [
  // Google Drive: /file/d/ID/view, /open?id=ID, /uc?id=ID
  [/^https:\/\/drive\.google\.com\/(?:file\/d\/([\w-]{10,})|(?:open|uc)\?(?:.*&)?id=([\w-]{10,}))/i, (m) => `https://lh3.googleusercontent.com/d/${m[1] || m[2]}`],
  // Dropbox: www.dropbox.com/s/… ou /scl/fi/… com ?dl=0
  [/^https:\/\/(?:www\.)?dropbox\.com\/(s\/[^?#]+|scl\/fi\/[^?#]+)(\?[^#]*)?/i, (m) => `https://dl.dropboxusercontent.com/${m[1]}${(m[2] || '').replace(/([?&])dl=\d/, '$1raw=1') || '?raw=1'}`],
  // GitHub: github.com/user/repo/blob/branch/path → raw
  [/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/i, (m) => `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}`],
  // Imgur: página imgur.com/ID → i.imgur.com/ID.png (sem álbuns)
  [/^https:\/\/(?:www\.)?imgur\.com\/([A-Za-z0-9]{5,8})$/i, (m) => `https://i.imgur.com/${m[1]}.png`],
  // Postimages: postimg.cc/ID é uma página; a imagem fica em i.postimg.cc, não há conversão fiável
]

/** Converte links de partilha conhecidos num link directo de imagem. Devolve o link limpo. */
export function directImageUrl(url) {
  const s = (url || '').trim()
  for (const [re, to] of RULES) {
    const m = s.match(re)
    if (m) return to(m)
  }
  return s
}

/** Resolve true se o browser conseguir carregar o link como imagem (sem referrer). */
export function checkImage(url, timeoutMs = 8000) {
  return new Promise((resolve) => {
    if (!url) return resolve(false)
    const img = new Image()
    const done = (ok) => {
      clearTimeout(timer)
      img.onload = img.onerror = null
      resolve(ok)
    }
    const timer = setTimeout(() => done(false), timeoutMs)
    img.referrerPolicy = 'no-referrer'
    img.onload = () => done(img.naturalWidth > 0)
    img.onerror = () => done(false)
    img.src = url
  })
}
