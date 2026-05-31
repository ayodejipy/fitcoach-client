import { client } from '@/lib/api/generated/client.gen'

import { registerAuthInterceptors } from '@/lib/api/auth-interceptor'

import { TEST_BASE_URL } from '@/test/msw/server'

/*
 * Test-side client configuration.
 *
 * Call `configureTestClient()` ONCE per test file (typically in `beforeAll`)
 * to pin the generated hey-api singleton to the MSW base URL + register the
 * real auth interceptors. The same module-level singleton is shared across
 * the whole test file, so configuring it twice would stack interceptors —
 * the `configured` flag guards against that.
 *
 * Tests that want to inspect the interceptor in isolation (without
 * registering it again) skip this and configure the client directly.
 */
let configured = false

export function configureTestClient(): void {
  if (configured) return
  client.setConfig({ baseUrl: TEST_BASE_URL })
  registerAuthInterceptors()
  configured = true
}
