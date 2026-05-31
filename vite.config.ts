/// <reference types="vitest/config" />
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

/**
 * Vite config for fitcoach-client (the FitCoach client portal SPA).
 *
 * Plugins:
 *   1. TanStackRouterVite — generates `src/routeTree.gen.ts` from the
 *      file-based routes in `src/routes/`. MUST come before `react()`.
 *   2. react — React 19 + Fast Refresh.
 *   3. tailwindcss — Tailwind v4 Vite plugin (no postcss config needed).
 *
 * No vite-plugin-pwa — PWA layer deferred to v1.1 (Decision S1).
 *
 * Path alias: `@/*` → `src/*` so feature folders can import via short paths
 * (e.g. `import { api } from '@/lib/api'`).
 *
 * Vitest config lives in the `test` block below — pinned by /plan-eng-review
 * Decision 8A (Vitest + RTL + Playwright + msw with 100% on critical paths).
 */
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // proxy /api/v1/* to the local Go backend during development.
    // Production builds hit portal.fitcoach.io's same-origin /api/v1.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  test: {
    // jsdom for component tests; pure utilities work fine here too.
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Restore mocks/stubs between tests so state doesn't leak.
    restoreMocks: true,
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // Auto-generated SDK + the route tree are not worth covering.
      exclude: [
        'src/routeTree.gen.ts',
        'src/lib/api/generated/**',
        'src/test/**',
        '**/*.config.ts',
        '**/*.d.ts',
        'dist/**',
        'src/main.tsx',
      ],
      // Per /plan-eng-review Decision 8A, the spine paths (auth interceptor,
      // streak derive, check-in submit, WS hook) target 100%. We don't enforce
      // global thresholds yet — let coverage build organically.
    },
  },
})
