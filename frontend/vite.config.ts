import * as path from "path";
import { defineConfig } from 'vite'
// import react from "@vitejs/plugin-react"
import reactRefresh from '@vitejs/plugin-react-refresh'

export default defineConfig({
  plugins: [reactRefresh()],
  resolve: {
    alias: {
      components: `${path.resolve(__dirname, "./src/components/")}`,
      pages: path.resolve(__dirname, "./src/pages"),
      assets:  path.resolve(__dirname, "./src/assets")
    },
  },
  server: {
    watch: {
        usePolling: true,
    },
    host: true, // needed for the Docker Container port mapping to work
    strictPort: true,
    port: 3000, // you can replace this port with any port
    },
});