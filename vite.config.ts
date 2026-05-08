import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');

  if (!env.VITE_CONVEX_URL && mode !== 'production') {
    console.warn('[Carrow] VITE_CONVEX_URL not set — Convex backend will not work.');
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      sentryVitePlugin({
        org: "kenz-bilal",
        project: "carrow",
        authToken: process.env.SENTRY_AUTH_TOKEN,
        sourcemaps: {
          filesToDeleteAfterUpload: ["./**/*.map"],
        },
      }),
    ],
    define: {
      'import.meta.env.VITE_CONVEX_URL': JSON.stringify(env.VITE_CONVEX_URL),
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
      sourcemap: mode === 'development',
      minify: mode === 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'motion': ['framer-motion'],
            'convex': ['convex'],
          },
        },
      },
    },
  };
});