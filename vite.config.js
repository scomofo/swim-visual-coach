import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GH Pages serves under /swim-visual-coach/; Vercel/Netlify serve from /.
  // Set DEPLOY_TARGET=gh-pages in the Pages workflow to keep the sub-path.
  base: process.env.DEPLOY_TARGET === 'gh-pages' ? '/swim-visual-coach/' : '/',
  plugins: [react()],
  server: {
    port: 3000,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
});
