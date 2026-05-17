import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/swim-visual-coach/',
  plugins: [react()],
  server: {
    port: 3000,
  },
});
