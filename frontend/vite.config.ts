import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// The Spring Boot backend (default :8080) now owns every /api and /ws call.
// In development Vite proxies those to it, so the browser still sees a single
// origin (:3000) and no CORS is required locally. Override the target with
// VITE_BACKEND_ORIGIN when the backend runs elsewhere.
const BACKEND_TARGET = process.env.VITE_BACKEND_ORIGIN || 'http://localhost:8080';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': { target: BACKEND_TARGET, changeOrigin: true },
        // Live-updates socket. Inert until the backend exposes /ws; the client
        // falls back to local simulation, exactly as before the migration.
        '/ws': { target: BACKEND_TARGET, ws: true, changeOrigin: true },
      },
    },
    preview: {
      port: 3000,
      proxy: {
        '/api': { target: BACKEND_TARGET, changeOrigin: true },
        '/ws': { target: BACKEND_TARGET, ws: true, changeOrigin: true },
      },
    },
  };
});
