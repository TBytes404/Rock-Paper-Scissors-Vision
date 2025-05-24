import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [basicSsl({ certDir: '.cert' }),
  VitePWA({
    registerType: 'autoUpdate',
    injectRegister: false,

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'Rock Paper Scissors',
      short_name: 'RPS',
      description: 'Play using Hand Gestures',
      theme_color: '#eb6f92',
    },

    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,task}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      maximumFileSizeToCacheInBytes: 10_485_760,
    },

    devOptions: {
      enabled: false,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],
})
