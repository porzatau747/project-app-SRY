import { defineConfig } from 'vitest/config';

export default defineConfig({
  oxc: false,
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
