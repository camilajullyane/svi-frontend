import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || env.VITE_API_BASE_URL || 'http://localhost:3000'
  const proxyRoutes = [
    '/admin',
    '/auth',
    '/events',
    '/health',
    '/me',
    '/purchases',
    '/reservations',
    '/users',
  ]

  return {
    plugins: [
      tailwindcss(),
      react(),
      babel({ presets: [reactCompilerPreset()] }),
    ],
    server: {
      proxy: Object.fromEntries(
        proxyRoutes.map((route) => [
          route,
          {
            target: apiProxyTarget,
            changeOrigin: true,
          },
        ]),
      ),
    },
  }
})
