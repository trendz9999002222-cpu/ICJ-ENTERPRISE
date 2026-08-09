import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');
          if (normalizedId.includes('/node_modules/')) {
            if (normalizedId.includes('/@mui/') || normalizedId.includes('/@emotion/')) {
              return 'vendor-mui';
            }
            if (normalizedId.includes('/react/') || normalizedId.includes('/react-dom/') || normalizedId.includes('/react-router/')) {
              return 'vendor-react';
            }
            return 'vendor-libs';
          }
        },
      },
    },
  },
})
