import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      'factor-specifications-brandon-differential.trycloudflare.com',
      '.trycloudflare.com'
    ]
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
