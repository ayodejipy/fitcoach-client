/// <reference types="vitest/config" />
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

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
        // ws: true upgrades the WebSocket connection through to the backend
        // (used by `usePortalWs` for the coach-reply nudge). Without this,
        // the SPA's `new WebSocket('/api/v1/portal/ws?...')` would 404 against
        // the Vite dev server.
        ws: true,
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
    // Playwright owns the e2e/ folder; keep its specs out of Vitest's
    // discovery so a `pnpm test` run doesn't try to execute them as units.
    exclude: ['node_modules/**', 'dist/**', 'e2e/**'],
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
