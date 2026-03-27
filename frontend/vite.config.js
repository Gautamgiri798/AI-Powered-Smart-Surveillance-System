import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        timeout: 600000, // 10 minutes for deep scan
        proxyTimeout: 600000,
      },

      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
      '/static': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },

    },
  },
})
