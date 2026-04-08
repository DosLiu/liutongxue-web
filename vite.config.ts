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
        tools: resolve(__dirname, 'tools/index.html'),
        scene: resolve(__dirname, 'scene/index.html'),
        sceneDigitalResident: resolve(__dirname, 'scene/digital-resident/index.html'),
        sceneDigitalResident20260321: resolve(__dirname, 'scene/digital-resident/2026-03-21/index.html'),
        sceneBlogOps: resolve(__dirname, 'scene/blog-ops/index.html'),
        sceneSiteOps: resolve(__dirname, 'scene/site-ops/index.html')
      }
    }
  }
});
