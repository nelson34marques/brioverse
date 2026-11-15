// Dados do site usados nas páginas legais e na conta. Ajusta antes de publicar.
// O email de suporte pode ser trocado sem alterar código: VITE_SUPPORT_EMAIL no .env.local.
export const SITE = {
  name: 'Brioverse',
  operator: 'Brioverse', // nome legal de quem opera o serviço (pessoa ou empresa)
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'nelson34marques@gmail.com',
  legalUpdated: '2026-11-15', // data da última revisão dos termos e da política
}
