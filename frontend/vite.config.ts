import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
<<<<<<< HEAD
    host: '0.0.0.0',
=======
>>>>>>> b5cbb09eba67d2b70242c9d02e21c07755051dea
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3030',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  }
})
