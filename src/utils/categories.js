// Lista fixa de categorias. O `key` é o valor guardado no Firestore
// e também a chave em i18n `categories.<key>`.
export const CATEGORIES = [
  { key: 'productivity', slug: 'produtividade' },
  { key: 'education', slug: 'educacao' },
  { key: 'games', slug: 'jogos' },
  { key: 'tools', slug: 'ferramentas' },
  { key: 'lifestyle', slug: 'estilo-de-vida' },
  { key: 'finance', slug: 'financas' },
  { key: 'social', slug: 'social' },
  { key: 'other', slug: 'outros' },
]

export function categoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug) ?? null
}

export function categoryByKey(key) {
  return CATEGORIES.find((c) => c.key === key) ?? null
}
