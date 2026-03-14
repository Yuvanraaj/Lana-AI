import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      '/api': {
        // Use environment variable or default to localhost:8001
        // For production: VITE_BACKEND_URL should be set to your Render URL
        target: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        bypass: (req, res, options) => {
          // Log for debugging
          console.log(`[PROXY] ${req.method} ${req.url} → ${options.target}${req.url}`);
        }
      }
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
