import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://arctracker.io',
        changeOrigin: true,
        secure: true,
      },
      '/metaforge': {
        target: 'https://metaforge.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/metaforge/, '')
      }
    },
  },
});
