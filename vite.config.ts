import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/liutongxue-web/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        tools: resolve(__dirname, 'tools/index.html')
      }
    }
  }
});
