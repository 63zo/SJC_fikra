import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/SJC_fikra/', // Base path for GitHub Pages
  build: {
    target: 'es2020', // Ensures maximum compatibility with mobile browsers (Safari/Chrome/iOS/Android)
    cssTarget: 'chrome61',
  },
})
