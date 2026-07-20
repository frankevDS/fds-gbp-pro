import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'FDS GBP Pro',
        short_name: 'FDS GBP',
        description: 'Frankev Digital Services — Google My Business Suite',
        theme_color: '#1B4FD8',
        background_color: '#F8FAFF',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="24" fill="%231B4FD8"/><text x="96" y="130" font-size="80" font-family="Arial Black" font-weight="900" fill="white" text-anchor="middle">GBP</text></svg>', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="64" fill="%231B4FD8"/><text x="256" y="340" font-size="200" font-family="Arial Black" font-weight="900" fill="white" text-anchor="middle">GBP</text></svg>', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      }
    })
  ]
})
