import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Hot Module Replacement (HMR) configuration
      hmr: process.env.DISABLE_HMR !== 'true',
      // File watch configuration - disable watching when HMR is disabled to save CPU resources
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
