import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    overlay: false, // Disable error overlay
  },
  build: {
    minify: false, // Keep readable in dev
  }
})
