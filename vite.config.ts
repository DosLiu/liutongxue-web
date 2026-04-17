import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL_ENV;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: isVercel ? '/' : '/liutongxue-web/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        tools: resolve(__dirname, 'tools/index.html'),
        jobsChat: resolve(__dirname, 'jobs-chat/index.html'),
        jobsChatSteveJobs: resolve(__dirname, 'jobs-chat/steve-jobs/index.html'),
        scene: resolve(__dirname, 'scene/index.html'),
        sceneDigitalResident: resolve(__dirname, 'scene/digital-resident/index.html'),
        sceneDigitalResident20260321: resolve(__dirname, 'scene/digital-resident/2026-03-21/index.html'),
        sceneDigitalResident20260322: resolve(__dirname, 'scene/digital-resident/2026-03-22/index.html'),
        sceneDigitalResident20260324: resolve(__dirname, 'scene/digital-resident/2026-03-24/index.html'),
        sceneDigitalResident20260326: resolve(__dirname, 'scene/digital-resident/2026-03-26/index.html'),
        sceneDigitalResident20260327: resolve(__dirname, 'scene/digital-resident/2026-03-27/index.html'),
        sceneBlogOps: resolve(__dirname, 'scene/blog-ops/index.html'),
        sceneBlogOps20260313: resolve(__dirname, 'scene/blog-ops/2026-03-13/index.html'),
        sceneBlogOps20260318: resolve(__dirname, 'scene/blog-ops/2026-03-18/index.html'),
        sceneBlogOps20260325: resolve(__dirname, 'scene/blog-ops/2026-03-25/index.html'),
        sceneBlogOps20260401: resolve(__dirname, 'scene/blog-ops/2026-04-01/index.html'),
        sceneSiteOps: resolve(__dirname, 'scene/site-ops/index.html'),
        sceneSiteOps20260401: resolve(__dirname, 'scene/site-ops/2026-04-01/index.html'),
        sceneSiteOps20260402: resolve(__dirname, 'scene/site-ops/2026-04-02/index.html'),
        sceneSiteOps20260403: resolve(__dirname, 'scene/site-ops/2026-04-03/index.html'),
        sceneSiteOps20260404: resolve(__dirname, 'scene/site-ops/2026-04-04/index.html')
      }
    }
  }
});
