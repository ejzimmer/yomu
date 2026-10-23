import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '読む',
        short_name: '読む',
        description: 'Unofficial WaniKani client for lessons and reviews',
        lang: 'ja',
        display: 'standalone',
        background_color: '#E6DECD',
        theme_color: '#E6DECD',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
})
