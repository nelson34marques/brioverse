# Brioverse

Vitrine aberta de PWAs, sites e APKs de criadores independentes. Parte do ecossistema Brio.

Plano completo em [`docs/PLANO.md`](docs/PLANO.md).

## Stack

React 18 + Vite 5, CSS puro (CSS Modules + tokens), react-router v6, Firebase (Auth + Firestore apenas), vite-plugin-pwa.

## Arrancar

```bash
npm install
cp .env.example .env.local   # preencher com as chaves do Firebase
npm run dev
```

Sem `.env.local` a app arranca em modo vitrine (sem login).

## Scripts

| Comando | Faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o build |
| `npm run lint` | ESLint |
