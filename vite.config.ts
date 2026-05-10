import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');

  const convexUrl = env.VITE_CONVEX_URL || 'https://mellow-dragon-917.convex.cloud';
  const convexSiteUrl = env.VITE_CONVEX_SITE_URL || 'https://mellow-dragon-917.convex.site';

  return {
    plugins: [
      react(),
      tailwindcss(),
      sentryVitePlugin({
        org: "kenz-bilal",
        project: "carrow",
        authToken: process.env.SENTRY_AUTH_TOKEN,
      }),
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
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'motion': ['framer-motion'],
            'convex': ['convex'],
            'lucide': ['lucide-react'],
            'charts': ['recharts'],
            'admin': [
              './src/pages/admin/AdminSidebar',
              './src/pages/admin/AdminTopbar',
            ],
          },
        },
      },
    },
  };
});