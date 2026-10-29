import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// PWA só no build: em dev não há service worker (evita cache a atrapalhar).
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    command === 'build' &&
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'favicon-96x96.png', 'apple-touch-icon.png', 'logo-mark.png'],
        manifest: {
          id: '/',
          name: 'Brioverse',
          short_name: 'Brioverse',
          description: 'A vitrine aberta de apps, PWAs e projectos independentes.',
          lang: 'pt',
          start_url: '/',
          display: 'standalone',
          background_color: '#000000',
          theme_color: '#2a9d8f',
          icons: [
            { src: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          navigateFallback: '/index.html',
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        },
      }),
  ].filter(Boolean),
  server: {
    port: 5173,
    strictPort: true,
    headers: {
      // Evita o aviso "COOP would block the window.closed call" do signInWithPopup.
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          'firebase-core': ['firebase/app', 'firebase/auth'],
          'firebase-db': ['firebase/firestore'],
        },
      },
    },
  },
}))
