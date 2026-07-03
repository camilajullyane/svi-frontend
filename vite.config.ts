import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  server: {
    proxy: {
      '/admin': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
      '/events': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
      '/me': 'http://localhost:3000',
      '/purchases': 'http://localhost:3000',
      '/reservations': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
    },
  },
})
