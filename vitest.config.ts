import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '#': fileURLToPath(new URL('./src', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: false,
    passWithNoTests: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/lib/**/*.{ts,tsx}',
        'src/components/ui/**/*.{ts,tsx}',
        'src/features/home/feedback-form.tsx',
        'src/hooks/**/*.{ts,tsx}',
      ],
      exclude: [
        'src/routeTree.gen.ts',
        'src/routes/**',
        'src/router.tsx',
        'src/components/site-*.tsx',
        'src/features/demo/**',
        'src/integrations/**',
        '**/*.d.ts',
        '**/index.ts',
      ],
      thresholds: {
        statements: 80,
        lines: 80,
        functions: 80,
        branches: 75,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.unit.test.{ts,tsx}', 'src/lib/**/*.test.ts'],
          exclude: ['src/**/*.component.test.ts', 'src/**/*.component.test.tsx'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          environment: 'jsdom',
          include: [
            'src/**/*.integration.test.{ts,tsx}',
            'src/**/*.component.test.{ts,tsx}',
            'src/test/**/*.test.{ts,tsx}',
          ],
          setupFiles: ['./src/test/setup.ts'],
        },
      },
    ],
  },
});
