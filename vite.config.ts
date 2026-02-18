import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    hmr: {
      overlay: false
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core - include scheduler too to avoid circular deps
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'react-vendor'
          }
          // FontAwesome icons
          if (id.includes('node_modules/@fortawesome/')) {
            return 'fontawesome'
          }
          // PDF library
          if (id.includes('node_modules/jspdf/')) {
            return 'jspdf'
          }
          // UI libraries (small utilities)
          if (id.includes('node_modules/lucide-react/') ||
              id.includes('node_modules/clsx/') ||
              id.includes('node_modules/tailwind-merge/') ||
              id.includes('node_modules/class-variance-authority/')) {
            return 'ui-vendor'
          }
          // Other node_modules
          if (id.includes('node_modules/')) {
            return 'vendor'
          }
        }
      }
    },
    chunkSizeWarningLimit: 500,
  }
})
