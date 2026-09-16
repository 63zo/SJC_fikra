import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/SJC_fikra/', // Explicit base for GitHub Pages https://63zo.github.io/SJC_fikra/
})
