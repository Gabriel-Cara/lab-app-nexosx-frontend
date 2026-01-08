import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      includeAssets: [
        'favicon.ico',
        'icon.ico',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'maskable-512x512.png',
      ],
      manifest: {
        name: 'Nexos',
        short_name: 'Nexos',
        description: 'Nexos',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // SPA com BrowserRouter: garante fallback para index.html
        navigateFallback: '/index.html',
        // Evita que o SW tente interceptar assets/rotas que não deveriam virar fallback
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/assets\//,
          /\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js|map|txt|woff2?)$/,
        ],
        // Mantém o bundle sob controle
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        // Atualização mais segura em deploys na Vercel
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
