import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');

  const convexUrl = env.VITE_CONVEX_URL || process.env.VITE_CONVEX_URL || '';
  const convexSiteUrl = env.VITE_CONVEX_SITE_URL || process.env.VITE_CONVEX_SITE_URL || '';

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      'import.meta.env.VITE_CONVEX_URL': JSON.stringify(convexUrl),
      'import.meta.env.VITE_CONVEX_SITE_URL': JSON.stringify(convexSiteUrl),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR === 'true' ? false : { overlay: true },
    },
build: {
      outDir: "dist",
      sourcemap: false,
      minify: true,
      rollupOptions: {
        treeshake: { preset: 'recommended' },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
              if (id.includes('framer-motion')) return 'motion';
              if (id.includes('convex')) return 'convex';
              if (id.includes('lucide')) return 'lucide';
              if (id.includes('recharts')) return 'charts';
            }
            if (id.includes('/src/pages/admin/') || id.includes('/src/pages/Admin.tsx')) {
              return 'admin';
            }
          },
        },
      },
    },
  };
});