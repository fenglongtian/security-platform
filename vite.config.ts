import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8790', changeOrigin: true },
      '/ws': { target: 'ws://localhost:8790', ws: true }
    }
  }
})
