import path from "path"
// import fs from "fs";
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
  server: {
    // https: process.env.NODE_ENV === 'development' ? {
    //   key: fs.readFileSync('localhost-key.pem'),  
    //   cert: fs.readFileSync('localhost.pem'),     
    // } : undefined,  
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
  },

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
          src: '/logo.png',
          sizes: '144x144',
          type: 'image/png'
        },
        {
          src: '/logo.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/logo.png',
          sizes: '512x512',
          type: 'image/png'
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
