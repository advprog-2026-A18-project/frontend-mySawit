import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import process from 'node:process'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 5173
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 4173,
    allowedHosts: [
      '.railway.app',
      '.up.railway.app',
      '.herokuapp.com',
      'localhost'
    ]
  }
})