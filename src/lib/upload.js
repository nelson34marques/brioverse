// Upload do ícone e das capturas de ecrã para o Cloudinary (plano gratuito), directo do browser.
// Usa um "upload preset" sem assinatura: o nome do cloud e do preset são públicos por natureza
// (aparecem em cada pedido e em cada link de imagem), por isso ficam aqui e não em .env.
// A API key/secret do Cloudinary NÃO é usada e nunca deve entrar no site.
// O link devolvido (res.cloudinary.com/…) fica em apps/{id}.iconUrl / .screenshots, tal como os links antigos.

const CLOUD = 'w8ii5ciy'
const PRESET = 'brioverse' // Settings > Upload > Upload presets, Signing mode: Unsigned
const ENDPOINT = `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`
const MAX_SIDE = 1920 // lado maior depois de reduzir (capturas)
const SHRINK_OVER = 600 * 1024 // abaixo disto (e dentro de MAX_SIDE) envia o original
const TIMEOUT_MS = 90000

export const UPLOAD = { maxMb: 10, types: ['image/png', 'image/jpeg', 'image/webp'] }

/** Reduz imagens grandes e converte para WebP antes de enviar. Se algo falhar, devolve o original. */
async function shrink(file, maxSide) {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height))
    if (scale === 1 && file.size <= SHRINK_OVER) {
      bmp.close()
      return file
    }
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bmp.width * scale)
    canvas.height = Math.round(bmp.height * scale)
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height)
    bmp.close()
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.86))
    // browsers sem WebP devolvem PNG: só compensa se ficar mais pequeno
    if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file
    return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, { type: blob.type })
  } catch {
    return file
  }
}

/** Envia uma imagem e devolve o link directo (https). Lança se o envio falhar ou demorar demais. */
export async function uploadImage(file, { maxSide = MAX_SIDE } = {}) {
  const image = await shrink(file, maxSide)
  const body = new FormData()
  body.append('file', image, image.name)
  body.append('upload_preset', PRESET)
  const res = await fetch(ENDPOINT, { method: 'POST', body, signal: AbortSignal.timeout(TIMEOUT_MS) })
  const json = await res.json().catch(() => null)
  const url = json?.secure_url
  if (!res.ok || !/^https:\/\//.test(url || '')) {
    throw new Error(json?.error?.message || `cloudinary: ${res.status}`)
  }
  return url
}
