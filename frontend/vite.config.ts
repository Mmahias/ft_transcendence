import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { BACKEND_FULL_URL } from './src/constants/constants'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: import.meta.env.VITE_FRONTEND_PORT,
    proxy: {
      '/api': {
        target: BACKEND_FULL_URL,
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  }
})
