import { defineConfig, devices } from '@playwright/test'

/*
 * Playwright config for the fitcoach-client portal E2E suite.
 *
 * Strategy:
 *   - testDir: `./e2e` keeps E2E specs out of the Vitest discovery path.
 *   - webServer: spawn `pnpm dev` ourselves so a developer can `pnpm e2e`
 *     and not think about it. `reuseExistingServer: true` outside CI lets
 *     an already-running dev server be reused (no port fight).
 *   - Backend: specs MOCK the API via `page.route(...)`. The Vitest msw
 *     suite already covers the network contract; E2E exercises the user
 *     flow. If a future spec wants to hit a real backend, set the
 *     E2E_LIVE env var and skip page.route.
 *   - Chromium-only for v1. Add WebKit + Firefox projects when we care
 *     about cross-browser parity beyond Chromium.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    actionTimeout: 5_000,
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
