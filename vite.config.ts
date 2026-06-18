import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' — built assets relative path bilan (d-railway.uz subpath / embed uchun qulay)
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { host: true, port: 5173 },
  build: {
    target: 'es2019',
    chunkSizeWarningLimit: 1500,
  },
})