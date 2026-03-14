import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({ babel: true })],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'wouter']
        }
      }
    }
  },
  ssr: false
})
