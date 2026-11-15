# Brioverse — Plano do Projecto

> Vitrine aberta de PWAs, sites e APKs de criadores independentes, estudantes e
> pequenos estúdios. Faz parte do ecossistema **Brio** (Brio Cursos, Brio Link, Brio Livro).
>
> Nome do produto: **Brioverse**. Domínio: por decidir. Pasta do repositório continua `briostore`.

---

## 1. Visão e princípios

| Princípio | O que significa na prática |
| --- | --- |
| Aberta | Qualquer criador publica sem taxa. Moderação garante segurança, não exclusividade. |
| Leve | PWA instalável, carrega rápido em redes móveis fracas. |
| Simples | Duas personas apenas: **Consumidor** e **Desenvolvedor**. Admin é interno. |
| Gratuita para começar | Firebase plano Spark: **só Auth + Firestore + Hosting**. Sem Storage. Todo o media e APKs são links externos. |
| Bilingue | Interface em **PT (padrão) e EN**, trocável no header. |

**Não é objectivo do MVP:** pagamentos, apps iOS nativas, análise de malware automática, chat,
upload de ficheiros (nenhum ficheiro passa pelos nossos servidores).

---

## 2. Stack técnica (decidida)

| Camada | Escolha | Nota |
| --- | --- | --- |
| Frontend | React 18 + Vite 5 | Já no scaffold. |
| Estilos | **CSS puro** (CSS Modules por componente + `tokens.css` global) | **Sem Tailwind, sem styled-components.** |
| Rotas | `react-router-dom` v6 | Páginas carregadas em chunks separados (`lazy` + `Suspense`). |
| Auth (cliente) | Firebase Authentication: **Google** + email/senha | Campo `role` guardado no Firestore, não no Auth. |
| Auth (criador) | **A definir mais tarde.** | MVP arranca só com o lado do cliente. |
| Base de dados | Cloud Firestore | Coleções: `users`, `apps`, `reviews`. |
| Ficheiros | **Sem Firebase Storage.** APKs são URLs externos; o ícone e as capturas de ecrã são enviados para o **Cloudinary** (plano gratuito, preset sem assinatura) e guardadas como URL | GitHub Releases, GitHub raw, etc. Cloud e preset em `src/lib/upload.js`. Apps antigos mantêm os links colados à mão. |
| Hosting | Firebase Hosting | SSL grátis, suporta SPA rewrite. |
| PWA | `vite-plugin-pwa` | Manifest + service worker para instalação. |
| i18n | Dicionários JSON próprios (`pt.json`, `en.json`) + hook `useT()` | Sem biblioteca. Por omissão segue o browser (`navigator.languages` + `languagechange`); a escolha manual fica em `localStorage`. |
| Tema | `data-theme="dark" \| "light"` no `<html>` + `prefers-color-scheme` | Padrão segue o sistema; toggle no header. |

Dependências principais: `react`, `react-dom`, `react-router-dom`, `firebase`, `prop-types`.
Dev: `vite`, `@vitejs/plugin-react`, `vite-plugin-pwa`, `eslint`, `vitest`.

Qualidade: `npm run lint`, `npm test` (Vitest, `src/**/*.test.{js,jsx}`) e `npm run build`.
O CI em `.github/workflows/ci.yml` corre os três em cada push/PR.

---

## 3. Estrutura de pastas

```
src/
  main.jsx                 # entrada, Router + providers
  App.jsx                  # rotas, páginas em lazy + Suspense
  styles/
    tokens.css             # cores (acento teal), superfícies, raios, espaçamentos, tipografia
    reset.css              # reset mínimo
    global.css             # body, links, utilitários pequenos
  i18n/
    pt.json / en.json      # dicionários (584 chaves, paridade PT/EN)
    I18nContext.jsx        # idioma actual + função t()
  config/site.js           # nome, operador, email de suporte (VITE_SUPPORT_EMAIL)
  lib/
    firebase.js            # init Firebase (Auth + Firestore apenas)
    auth.js                # login Google/email, logout, sessão, verificação de email
    db.js                  # apps: queries, normalização e selectApps
    publish.js             # slugify, validateApp, formFromApp
    reviews.js             # reviews + stats de rating (transacção no cliente)
    ranking.js             # score bayesiano, trending/rating/recent/title
    stats.js               # views/cliques (+1 por sessão)
    library.js             # biblioteca do cliente + novidades de versão
    creators.js            # perfis públicos de criadores
    developers.js          # candidaturas a developer
    admin.js               # acções de moderação
    device.js              # detecção de OS/browser/PWA
    images.js              # links de imagem/Cloudinary
    prefs.js               # onboarding (dispositivos/gostos)
    installPrompt.js       # beforeinstallprompt
    upload.js              # upload Cloudinary (preset unsigned)
  context/
    AuthContext.jsx, ThemeContext.jsx, DevContext.jsx, LibraryContext.jsx, PrefsContext.jsx
  hooks/
    useAuth.js, useT.js, useTheme.js, useApps.js, useReviews.js, useMeta.js,
    useFocusTrap.js, useDev.js, useDeveloper.js, useLibrary.js, usePrefs.js,
    useInstallApp.js, useMediaQuery.js, useAuthActions.js
  components/
    layout/       Header, Footer, Layout, BottomNav, SearchBar, InstallBanner, UpdatesButton
    ui/           Button, Badge, Chip, Field, Modal, Lightbox, SortSelect, StatusBadge, ...
    app/          AppCard, AppRow, AppGallery, FeaturedCarousel, Reviews, ReviewForm, ...
    auth/         LoginForm, RegisterForm, VerifyEmailNotice
    dev/          DevLayout, DevHeader, DevBottomNav, AppForm, IconInput, ScreenshotsInput
    onboarding/   Onboarding
  pages/
    Home.jsx, Apps.jsx, Games.jsx, Search.jsx, Category.jsx, AppDetail.jsx, Creator.jsx
    Login.jsx, Register.jsx, Account.jsx, AuthScreen.jsx, Legal.jsx, NotFound.jsx
    dev/          Home, Apps, Publish, Edit, Analytics, Notices, Profile, Apply
    admin/        Moderation
  utils/
    categories.js          # lista fixa de categorias
    format.js              # datas, números
  data/                    # conteúdo estático (legais, anúncios, placeholders)
```

Testes: `src/lib/*.test.js` e `src/utils/format.test.js`; configuração em `vitest.config.js`.

Convenção CSS: cada componente tem `Nome.module.css` ao lado. Nada de classes globais
além das definidas em `global.css`. Todas as cores e espaçamentos vêm de variáveis em `tokens.css`.

---

## 4. Rotas

| Rota | Página | Acesso |
| --- | --- | --- |
| `/` | Home (destaques, categorias, recentes, "Para ti") | Público |
| `/apps` | Catálogo completo com filtros | Público |
| `/jogos` | Jogos (destaques, filas, lista) | Público |
| `/pesquisa?q=&tipo=&cat=` | Resultados com filtros | Público |
| `/categoria/:slug` | Listagem por categoria | Público |
| `/app/:appId` | Detalhes do app | Público |
| `/criador/:uid` | Página pública do criador | Público |
| `/entrar`, `/registar` | Auth | Público |
| `/conta` | Conta, biblioteca, dispositivos/gostos | Autenticado |
| `/termos`, `/privacidade` | Páginas legais | Público |
| `/dev` | Início do modo desenvolvedor | Autenticado (candidatura se não aprovado) |
| `/dev/candidatura` | Pedido de conta de criador | Autenticado |
| `/dev/apps`, `/dev/apps/:id` | Os meus apps / actualizar | `role = developer` |
| `/dev/publicar` | Publicar app | `role = developer` |
| `/dev/analise`, `/dev/avisos`, `/dev/perfil` | Métricas, avisos, perfil | `role = developer` |
| `/admin` | Moderação | `role = admin` |
| `/404` e `*` | Não encontrado | Público |

---

## 5. Módulos e funcionalidades

### Módulo 1 — Consumidor
- **Home:** carrossel "Em Alta" (ordenado por views dos últimos 7 dias), linhas por categoria, "Recentes".
- **Pesquisa:** por título e palavras-chave (campo `keywords[]` em minúsculas no Firestore). Filtros: tipo (PWA/APK), categoria.
- **Detalhes do app:** ícone, título, dev (link), categoria, badge "Verificado", galeria de screenshots, descrição, rating médio, botão de acção dinâmico.
  - PWA → "Abrir aplicação" + modal "Como instalar no ecrã inicial".
  - APK → "Baixar APK" + modal de aviso sobre fontes desconhecidas (obrigatório aceitar).
- **Avaliações:** 1 a 5 estrelas + comentário. Só utilizadores autenticados. Uma avaliação por utilizador por app.

### Módulo 2 — Desenvolvedor
> **Nota:** a forma de autenticação do criador ainda não está decidida. Este módulo só
> entra depois do lado do cliente estar pronto (Fase 3).

- **Registo como dev:** método a definir. O `role = developer` será atribuído nessa altura.
- **Perfil público:** nome, bio, avatar (URL), links (site, GitHub, Brio Link).
- **Dashboard:** tabela dos seus apps com status (pendente / aprovado / rejeitado) e métricas: views, cliques em abrir/baixar.
- **Assistente de submissão (4 passos):**
  1. Básico: título, slogan, descrição, categoria, palavras-chave.
  2. Multimédia: ícone (quadrado) + 2 a 5 screenshots **enviados do dispositivo** para o Cloudinary (upload directo do browser), com pré-visualização grande. Nada é carregado para os nossos servidores.
  3. Tipo e link: PWA/Site ou APK Android.
     - PWA: URL do site.
     - APK: **link directo para o ficheiro do build** (ex.: GitHub Releases `.apk`), tamanho em MB e versão. O botão "Baixar" abre esse link.
  4. Termos: checkbox de responsabilidade. Submete com `status = pending`.
- **Edição:** pode editar apps aprovados; edição volta a `pending`.
- **Validação de URLs:** aceitar só `https://`; para APK o link deve terminar em `.apk` ou ser de um host conhecido (GitHub Releases).

### Módulo 3 — Admin
- Lista de apps `pending` com pré-visualização.
- Acções: aprovar, rejeitar (com motivo), remover, marcar "Verificado".
- Lista de denúncias (v2).

---

## 6. Modelo de dados (Firestore)

```
users/{uid}
  name, email, role: "consumer" | "developer" | "admin"
  avatarUrl?, bio?, links?: { site, github, brioLink }
  createdAt

apps/{appId}
  developerId, developerName        # desnormalizado para listagens
  title, slug, shortDescription, fullDescription
  category, keywords[]              # keywords em minúsculas
  type: "pwa" | "apk"
  appUrl                            # PWA: site; APK: link directo do build
  apkSizeMb?, apkVersion?
  iconUrl, screenshots[]            # URLs externos (https), nunca Storage
  verified: boolean
  status: "pending" | "approved" | "rejected", rejectReason?
  stats: { views, clicks, ratingAvg, ratingCount }
  createdAt, updatedAt

reviews/{reviewId}                  # id = `${appId}_${userId}` garante 1 por utilizador
  appId, userId, userName, userPhoto, rating, text, createdAt, updatedAt
  reply?: { text, userId, userName, userPhoto, createdAt, updatedAt }   # resposta do criador do app (1 por avaliação)
```

Regras de segurança (resumo):
- `apps`: leitura pública apenas se `status == approved`; escrita só pelo `developerId`; mudar `status`/`verified` só admin.
- `reviews`: criar/editar só o próprio `userId`; `rating` entre 1 e 5; o utilizador nunca toca em `reply`. Só o `developerId` do app (email confirmado) escreve/apaga `reply` e só esse campo.
- `users`: leitura pública de campos de perfil; escrita só do próprio; `role` nunca editável pelo cliente após criação (admin via console).

`ratingAvg` e `ratingCount` são actualizados por transacção no cliente ao criar review
(sem Cloud Functions no MVP para manter o plano gratuito).

---

## 7. Fases de entrega

| Fase | Entregável | Critério de pronto |
| --- | --- | --- |
| **0. Base** | tokens.css (teal + dark/light), layout, router, i18n PT/EN, Firebase init, PWA manifest | App abre, troca tema e idioma, navega entre páginas vazias, instala como PWA. |
| **1. Vitrine** | Home, Pesquisa, Detalhes com dados mock → Firestore | Consumidor encontra e abre um app aprovado. |
| **2. Auth cliente + Reviews** | Login Google + email/senha, avaliações | Utilizador avalia um app. |
| **3. Painel Dev** | Decidir auth do criador; Dashboard; assistente de submissão por URLs | Dev submete app que fica `pending`. |
| **4. Admin** | Página de moderação | Admin aprova e o app aparece na Home. |
| **5. Polimento** | Métricas, SEO (meta tags por app), skeletons, acessibilidade | Lighthouse PWA > 90. |

As fases 0 a 2 são **só lado do cliente** e podem ir para produção antes de existir painel dev.
Até lá os apps entram no Firestore manualmente pela consola Firebase.

---

## 8. Identidade visual

**Conceito:** superfícies neutras no estilo Google Play / App Store, com **um único acento
teal** em botões, links, badges e estados activos. Inspiração de forma: ícones squircle
(raio 22%), cards 16px, chips 8px e botões em pílula.

Tokens actuais (`src/styles/tokens.css`, v3):

```css
:root {
  /* marca */
  --accent: #2a9d8f;
  --accent-hover: #23867a;
  --accent-soft: rgba(42, 157, 143, 0.12);
  --accent-glow: rgba(42, 157, 143, 0.3);
  --on-accent: #ffffff;

  /* neutros (modo claro) */
  --bg: #ffffff;
  --surface: #f2f2f7;
  --surface-2: #e5e5ea;
  --surface-3: #d1d1d6;
  --border: rgba(0, 0, 0, 0.08);
  --border-strong: rgba(0, 0, 0, 0.14);
  --text: #1c1c1e;
  --text-2: #6e6e73;
  --text-3: #aeaeb2;

  --r-icon: 22%;
  --r-lg: 16px;
  --r-xl: 22px;
  --r-btn: 14px;
  --r-pill: 999px;
}
```

O modo escuro vive em `:root[data-theme="dark"]`; o tema padrão segue o sistema
(`prefers-color-scheme`) e o `ThemeContext` actualiza também o `<meta name="theme-color">`.

Regras de uso:
- Cards e inputs: fundo `--surface`, borda 1px `--border`; em focus a borda passa a `--accent` com `box-shadow: var(--focus-ring)`.
- Botão primário: fundo `--accent`, texto `--on-accent`. Secundário: transparente com borda.
- Badge "Verificado" e estrelas de rating: o selo usa `--accent`; as estrelas usam `--star`.
- Nunca usar o acento como fundo de secções grandes.
- Ícone/logo do PWA: letra "B" sobre o acento ou sobre preto.

---

## 9. Decisões tomadas

| Tema | Decisão |
| --- | --- |
| Nome | **Brioverse** |
| Domínio | Por decidir. Não bloqueia o desenvolvimento. |
| Idiomas | PT (padrão) + EN desde o início. |
| Ficheiros | **Sem Firebase Storage.** APKs por URL externo; ícone e capturas de ecrã enviados para o Cloudinary (guardados como URL). Só Auth + Firestore + Hosting. |
| APKs | Link directo para o ficheiro do build (ex.: GitHub Releases). |
| Auth cliente | Google + email/senha. |
| Auth criador | Adiada. MVP arranca só com o lado do cliente. |
| Paleta | Acento teal `#2a9d8f`; superfícies neutras, modo claro/escuro (tokens v3). |

## 10. Ainda em aberto

- [ ] Domínio final.
- [ ] Método de autenticação e verificação do criador (Fase 3).
- [ ] Fonte tipográfica própria ou `system-ui`.

## Onboarding e guia de instalação (adicionado)

- Na primeira visita aparece um onboarding de 2 passos: **dispositivos** (Android, iPhone/iPad, Computador; multi-selecção, pré-marca o detectado) e **gostos** (categorias, opcional). Pode saltar-se; "Saltar" guarda só o dispositivo detectado.
- Guardado em `localStorage` (`brioverse:prefs`) e, com sessão, em `users/{uid}.prefs` (merge, best-effort).
- O modal **Como instalar** mostra só os dispositivos escolhidos (tabs se forem vários, por omissão o detectado). Por dispositivo: PWA (passos do browser), APK (passos + botão com aviso) ou instalador para computador. Avisa quando o browser actual não instala PWAs (iOS fora do Safari, Android com browser desconhecido, PC com Firefox/Safari) e aponta para o APK quando existe.
- Início ganha a secção **Para ti** com base nos gostos (esconde apps só-APK a quem não tem Android).
- Conta mostra dispositivos/gostos e permite reabrir o onboarding para editar. A plataforma pode ainda ser
  trocada directamente: chips Android/iPhone/Computador no card "Preferências" da Conta, e o guia "Como instalar"
  mostra sempre as 3 plataformas em tabs (não só as escolhidas no onboarding).
- Campos opcionais em `apps`: `apkUrl` (APK Android), `desktopUrl` (instalador PC), `webUrl` (versão web de um app APK). Para `type: 'apk'`, `appUrl` continua a ser o APK.

## Ranking (ordem dos apps)

Implementado em `src/lib/ranking.js`, usado por `selectApps` em todas as listas.

`score = 0.55 · nota + 0.35 · popularidade + 0.10 · frescura`

- **nota**: média bayesiana `(5 · 3.5 + soma das notas) / (5 + nº avaliações)`, normalizada a 0..1. Protege contra 1 review de 5★ a bater 40 reviews de 4.6★; quanto mais avaliações, mais a média real pesa. Sem avaliações vale 3.5.
- **popularidade**: `log10(1 + views) / log10(1 + views do app mais visto)`. Logarítmica, para 10× mais views não dar 10× mais pontos.
- **frescura**: `exp(−idade em dias / 60)`, bónus para apps novos que desaparece em ~2 meses.
- Empates: mais avaliações, depois mais views, depois mais recente.

Ordens disponíveis: `trending` (score, omissão em Início/Apps/Categoria/Pesquisa), `rating` (média bayesiana), `recent`, `title`.

**Contadores reais** (`src/lib/stats.js`): `stats.views` soma 1 ao abrir a página do app (1 por app por sessão do browser); `stats.clicks` soma 1 ao clicar em Abrir/Baixar; `stats.byCountry` soma 1 por view no país estimado. As regras só deixam somar exactamente 1 a cada escrita, e o país vai sempre acompanhado de `stats.byCountryCode` (que valida o incremento nas regras). Só funciona para apps no Firestore (os mock não têm documento).


---

## Contas dev e admin

**Conta de desenvolvedor** (`/dev/candidatura` → `developers/{uid}`): qualquer utilizador autenticado
preenche tipo (singular/empresa), nome público, nome legal + NIF (empresa), descrição (≥ 80 caracteres),
site/portfólio, link de um app já publicado, GitHub/GitLab (opcional), email de contacto e aceita os termos.
Estados: `pending` → `approved` | `rejected` (pode corrigir e reenviar) | `revoked` (admin).
Ao aprovar, o admin escreve `users/{uid}.role = 'developer'`. O cartão "Desenvolvedor" na Conta mostra o
estado e o botão "Modo desenvolvedor" (`/dev`): avisos, os meus apps (todos os estados) e dados do criador.

**Admin** (`/admin`, `users/{uid}.role = 'admin'`, definido à mão na consola):
- Apps: pesquisar/filtrar; **Destacar** (`featured`, entra no carrossel do Início/Jogos); **Impulso** 0..3
  (`boost`, soma 0.12 por nível ao score do ranking); **Desactivar** com motivo (`status = 'disabled'`,
  `disabledReason`) e **Reactivar**; **Aprovar** pendentes.
- Candidaturas: aprovar / recusar com motivo.
- Desenvolvedores: **Verificar** (selo em `developers/{uid}.verified` e em todos os apps do criador),
  **Revogar** com motivo (role volta a `consumer`), **Repor acesso**.

**Avisos** (`notifications/{id}`): cada acção do admin cria um aviso para o criador (`uid`, `type`,
`appTitle`, `reason`). Sem Cloud Functions (plano gratuito), por isso não há email automático; o modal
do admin tem um atalho `mailto:` para o email de contacto do criador.

### Modo desenvolvedor (casca própria)

`/dev/*` não usa o `Layout` da loja: tem `DevLayout` (canvas `variant="dev"`, `DevHeader`, `DevBottomNav`,
sem rodapé/anúncios/onboarding) e um `DevProvider` com o criador, os apps dele e os avisos. Como na Stripe,
o utilizador "fica" no modo dev e só sai por "Voltar à loja" (header no PC, Perfil no telemóvel).
Telas: `/dev` início (números, avisos por ler, últimos apps) · `/dev/apps` · `/dev/publicar` (formulário:
básico, ligações, imagens por link; cria `apps/{id}` com `status = 'pending'`) · `/dev/analise`
(views, cliques, taxa de clique, avaliações por app, views por país estimado) · `/dev/avisos` · `/dev/perfil` (dados + sair).
Sem conta aprovada, `/dev` mostra o estado da candidatura e `/dev/candidatura` o formulário; as outras
telas redireccionam para `/dev` (`RequireDev`).

### Versões, biblioteca do cliente e actualizações

- Cada app tem `version` (texto, ex. 1.2.0), `versionCode` (inteiro, sobe a cada release), `changelog`
  (novidades da última versão), `releases` (últimas 10: `{version, notes, at}`) e `releasedAt`.
- O criador, em `/dev/apps`, pode **Actualizar** (`/dev/apps/:id`, mesmo formulário de Publicar + bloco
  Versão), **Pausar/Retomar** (`status` 'approved' ⇄ 'paused'; pausado não aparece na loja) e **Eliminar**
  (apaga o documento). Mudar a versão ou escrever novidades cria uma release (`versionCode + 1`).
  Um app aprovado continua aprovado depois de editado (sem nova análise); um recusado volta a 'pending'.
- Cliente: clicar em **Abrir** ou **Baixar** mete o app na biblioteca (`users/{uid}/library/{appId}` com
  `seenCode`; sem sessão, `localStorage brioverse:library`, migrado ao entrar). O sino no header (PC e
  telemóvel) lista os apps da biblioteca com `versionCode > seenCode`; abrir o app ou "Marcar tudo" limpa.
  Não há push nem email (sem Cloud Functions): o aviso aparece quando a pessoa abre a loja.
- A página do app mostra a versão, a secção **Novidades** e "Na tua biblioteca" / "Nova versão X disponível".

### Segurança (antes de publicar)

- `users/{uid}` só é lido pelo próprio e pelo admin (tem email). Nada na loja lê perfis de terceiros:
  as avaliações guardam o nome no próprio documento.
- `validApp` nas regras limita tamanhos, tipos e obriga a links https nos apps gravados pelo criador;
  `normalizeApp` ignora qualquer link que não seja http(s) (nunca chega a um `href`).
- Estatísticas de avaliação: criar/apagar exigem a review própria correspondente (count ±1, soma ±5);
  editar só aceita count Δ0 e soma Δ ±4. A média fica sempre 0..5. Risco residual aceite: o autor de uma
  review pode afinar a soma com edições repetidas (count não muda).
- Contagem de país (estimada): cada view soma +1 em `stats.byCountry.{ISO}` mais um marcador
  `stats.byCountryCode` (usado pelas regras). País derivado da língua e do fuso do browser — sem IP nem
  localização exacta. O painel do dev mostra "Views por país" em `/dev/analise`. As regras só deixam +1 por
  escrita e um país de cada vez. **Re-publicar as regras depois desta alteração.**
- Hosting: `nosniff`, `X-Frame-Options: DENY`, `frame-ancestors 'none'`, Referrer-Policy, Permissions-Policy, HSTS.
- Email confirmado obrigatório (`request.auth.token.email_verified`) para avaliar, candidatar-se a criador e
  publicar/editar/apagar apps. O link vai ao registar (`sendEmailVerification`); `VerifyEmailNotice` mostra
  o aviso com "Reenviar" e "Já confirmei" na conta, nas avaliações, na candidatura e em publicar/actualizar.
- Risco aceite: views/cliques são contadores sem login (+1 por pedido). Mitigação recomendada: App Check
  (reCAPTCHA v3, grátis). Na consola: protecção contra enumeração de emails, chave da API restrita ao domínio,
  domínios autorizados.

### Sem dados de demonstração

`src/data/mockApps.js` foi removido (2026-10-28). Sem Firebase, ou com a colecção `apps` vazia, a loja mostra o
estado vazio ("A loja está a começar" + botão para a candidatura) e as listas ficam a zero. Só os apps guardados
neste browser pelo modo dev (`brioverse:myapps`) alimentam o painel admin e a biblioteca em modo local.

## Qualidade e SEO

- `npm run lint` (ESLint), `npm test` (Vitest, 38 testes em `src/**/*.test.{js,jsx}` para ranking, imagens,
  publicação, db, browser/dispositivo e formatação) e `npm run build`.
- CI em `.github/workflows/ci.yml` (Node 20): `npm ci` → lint → test → build em cada push para `main` e PR.
- `index.html` tem descrição, robots e Open Graph base; `src/hooks/useMeta.js` define título, descrição,
  OG/Twitter e canonical por app (`/app/:id`) e por criador (`/criador/:uid`), com `noindex` em 404.
  `public/robots.txt` bloqueia `/admin`, `/dev`, `/conta`, `/entrar` e `/registar`.
- Acessibilidade dos diálogos: `Modal` e `Lightbox` usam `useFocusTrap` (Tab preso no diálogo e foco devolvido
  a quem abriu).
- Reviews: a primeira página traz 100; "Carregar mais" sobe o limite (sem índice composto `appId+createdAt`)
  até 1000. Se o Firestore tiver mais do que as carregadas, o resumo usa `stats.ratingCount/ratingAvg`.
- Tempo real (`onSnapshot`): a loja e a página do app actualizam sem recarregar — aprovações/edições/pausas de
  apps (`src/lib/db.js#subscribeAppsLive`, `src/hooks/useApps.js`) e avaliações (`src/lib/reviews.js#subscribeReviews`,
  `src/hooks/useReviews.js`). Adicionar um listener por página é intencional; sem Firebase, emite a lista local uma vez.
- Upload Cloudinary: o preset `brioverse` é unsigned; limites de formato/tamanho/pasta são configurados no
  dashboard do Cloudinary, não em código.
