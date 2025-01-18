import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from 'vite-plugin-pwa'
import electron from 'vite-plugin-electron/simple'

export default defineConfig({
  plugins: [react(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`
        entry: 'electron/main.js',
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`
        input: 'electron/preload.js',
      },
      // Optional: Use Node.js API in the Renderer process
      renderer: {},
    }),
    VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      name: 'Cadê',
      short_name: 'Cadê App',
      description: 'Onde está meu item?',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        {
          src: '/vite.svg',
          sizes: '144x144',
          type: 'image/svg+xml'
        },
        {
          src: '/vite.svg',
          sizes: '192x192',
          type: 'image/svg+xml'
        },
        {
          src: '/vite.svg',
          sizes: '512x512',
          type: 'image/svg+xml'
        }
      ]
    }
  })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
