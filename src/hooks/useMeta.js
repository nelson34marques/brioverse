import { useEffect } from 'react'

// SEO/partilha: título, descrição e Open Graph/Twitter por página. Sem SSR os robôs
// de redes sociais podem não executar o JS; isto melhora o browser e os crawlers que correm JS.
const SITE = 'Brioverse'

function absolute(url) {
  if (!url) return ''
  try {
    return new URL(url, window.location.origin).href
  } catch {
    return url
  }
}

function applyMeta(attr, key, content) {
  const selector = `meta[${attr}="${key}"]`
  const el = document.head.querySelector(selector)

  if (content == null || content === '') {
    if (!el) return () => {}
    const prev = el.getAttribute('content')
    el.remove()
    return () => {
      if (prev == null) return
      const restored = document.createElement('meta')
      restored.setAttribute(attr, key)
      restored.setAttribute('content', prev)
      document.head.appendChild(restored)
    }
  }

  if (el) {
    const prev = el.getAttribute('content')
    el.setAttribute('content', content)
    return () => {
      if (prev == null) el.removeAttribute('content')
      else el.setAttribute('content', prev)
    }
  }

  const created = document.createElement('meta')
  created.setAttribute(attr, key)
  created.setAttribute('content', content)
  document.head.appendChild(created)
  return () => created.remove()
}

function applyCanonical(href) {
  const el = document.head.querySelector('link[rel="canonical"]')
  if (!href) {
    if (el) el.remove()
    return () => {}
  }
  if (el) {
    const prev = el.getAttribute('href')
    el.setAttribute('href', href)
    return () => {
      if (prev == null) el.removeAttribute('href')
      else el.setAttribute('href', prev)
    }
  }
  const created = document.createElement('link')
  created.rel = 'canonical'
  created.href = href
  document.head.appendChild(created)
  return () => created.remove()
}

/**
 * Define os metadados da página actual e repõe os anteriores ao sair.
 * `title` é o nome curto (o sufixo "— Brioverse" é acrescentado).
 */
export function useMeta({ title, description, image, url, type = 'website', noindex = false } = {}) {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined

    const prevTitle = document.title
    if (title) document.title = `${title} — ${SITE}`

    const pageUrl = url ? absolute(url) : window.location.href
    const imageUrl = absolute(image)
    const restores = []

    if (description) restores.push(applyMeta('name', 'description', description))
    if (title) {
      restores.push(applyMeta('property', 'og:title', title))
      restores.push(applyMeta('name', 'twitter:title', title))
    }
    if (description) {
      restores.push(applyMeta('property', 'og:description', description))
      restores.push(applyMeta('name', 'twitter:description', description))
    }
    if (imageUrl) {
      restores.push(applyMeta('property', 'og:image', imageUrl))
      restores.push(applyMeta('name', 'twitter:image', imageUrl))
    }
    restores.push(applyMeta('property', 'og:url', pageUrl))
    restores.push(applyMeta('property', 'og:type', type))
    restores.push(applyMeta('property', 'og:site_name', SITE))
    restores.push(applyMeta('name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary'))
    restores.push(applyMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow'))
    restores.push(applyCanonical(pageUrl))

    return () => {
      document.title = prevTitle
      restores.reverse().forEach((restore) => restore())
    }
  }, [title, description, image, url, type, noindex])
}
