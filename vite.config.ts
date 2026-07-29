import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

const isAnalyze = process.env.ANALYZE === 'true';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
  },
  build: {
    sourcemap: true,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@tanstack/react-query')) return 'query';
            if (id.includes('@tanstack/react-router')) return 'router';
          }
          return undefined;
        },
      },
    },
  },
  plugins: [
    devtools(),
    nitro({
      rollupConfig: {
        external: [/^@sentry\//],
      },
    }),
    tailwindcss(),
    tanstackStart(),
    // React plugin must come after tanstackStart
    viteReact(),
    isAnalyze
      ? visualizer({
          filename: 'bundle-stats.html',
          gzipSize: true,
          brotliSize: true,
          open: false,
        })
      : undefined,
  ].filter(Boolean),
});
