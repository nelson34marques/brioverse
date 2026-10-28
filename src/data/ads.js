// Espaços de publicidade da coluna esquerda (só em ecrãs de computador).
// Para activar um anúncio, preenche `imageUrl` e `href`; sem imagem aparece
// o espaço vazio com a indicação do tamanho. Tamanhos padrão IAB: 300×600
// (half page) e 300×250 (rectângulo médio). Mais tarde pode vir do Firestore (`ads`).
export const AD_SLOTS = [
  { id: 'left-1', width: 300, height: 600, imageUrl: '', href: '', alt: '' },
  { id: 'left-2', width: 300, height: 250, imageUrl: '', href: '', alt: '' },
]
