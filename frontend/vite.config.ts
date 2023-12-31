import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, URL } from "url";


export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  process.env = { ...process.env, ...env };

  return defineConfig({
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      watch: {
        usePolling: true,
      },
      // Use process.env for accessing environment variables.
      port: Number(env.VITE_FRONTEND_PORT),
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_FULL_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        '/socket.io': {  // Proxy socket.io requests
          target: env.VITE_BACKEND_FULL_URL,
          changeOrigin: true,
          secure: false,
          ws: true,  // websocket support for this route
        },
      },
    },
    resolve: {
      alias: [
        { find: '@app', replacement: fileURLToPath(new URL('src', import.meta.url)) },
        { find: '@constants', replacement: fileURLToPath(new URL('src/constants', import.meta.url)) },
      ]
    },
  });
};
