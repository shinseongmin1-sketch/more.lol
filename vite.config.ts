import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/riot-kr': {
        target: 'https://kr.api.riotgames.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/riot-kr/, ''),
      },
      '/riot-asia': {
        target: 'https://asia.api.riotgames.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/riot-asia/, ''),
      },
    },
  },
})
