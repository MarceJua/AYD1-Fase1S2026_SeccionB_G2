import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Permitimos a dominio
    allowedHosts: ["saludplus360.tech", "www.saludplus360.tech"],
    host: true, // escucha conexiones dentro del contenedor de Docker
    port: 5173
  }
})
