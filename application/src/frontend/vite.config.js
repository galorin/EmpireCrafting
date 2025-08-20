import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Group ag-grid related modules into a single 'ag-grid' chunk
          'ag-grid': ['ag-grid-community', 'ag-grid-react'],
          // You can add other large dependencies here if needed
          // 'react-vendor': ['react', 'react-dom'],
          // 'markdown-vendor': ['react-markdown'],
        },
      },
    },
    chunkSizeWarningLimit: 1500,
  },
})
