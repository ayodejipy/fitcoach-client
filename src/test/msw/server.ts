import { setupServer } from 'msw/node'

import { handlers } from '@/test/msw/handlers'

/*
 * Vitest-wide MSW server.
 *
 * Lifecycle (registered in `src/test/setup.ts`):
 *   beforeAll  → server.listen({ onUnhandledRequest: 'error' })
 *   afterEach  → server.resetHandlers()  // back to defaults after per-test overrides
 *   afterAll   → server.close()
 *
 * `onUnhandledRequest: 'error'` is deliberate: any test that hits a real network
 * URL we haven't mocked fails loudly instead of silently 404ing. The default
 * handlers below cover the read endpoints the spine touches; tests for
 * specific failure cases use `server.use(...)` to override per-test.
 */
export const server = setupServer(...handlers)

/** Base URL used by all msw handlers + the test client config. */
export const TEST_BASE_URL = 'http://localhost'
