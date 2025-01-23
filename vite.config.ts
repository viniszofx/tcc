import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from 'vite-plugin-pwa'

// import electron from 'vite-plugin-electron/simple'

// electron({
//   main: {
//     entry: 'electron/main.ts',
//   },
//   preload: {
//     input: 'electron/preload.ts',
//   },
//   renderer: {},
// })

export default defineConfig({
  plugins: [react(),
    
    VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      name: 'Cadê',
      short_name: 'Cadê App',
      description: 'Onde está meu item?',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'fullscreen',
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
