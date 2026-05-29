/*
 * Typed API client setup.
 *
 * The generated hey-api client (`src/lib/api/generated/client.gen.ts`) is the
 * single instance every SDK function uses by default. We configure it once
 * here at module load time:
 *
 *   - baseUrl: empty in dev (Vite proxies /api/* → localhost:8080), overridable
 *     via VITE_API_BASE_URL for prod or alt origins.
 *   - auth interceptors: attach Bearer header, single-flight refresh on 401,
 *     normalize thrown errors into AppError so call sites have one type to
 *     catch.
 *
 * IMPORTANT: importing this module for its SIDE EFFECTS is what wires
 * everything up. `src/main.tsx` does `import '@/lib/api/client'` at the top.
 *
 * Re-exports the generated `client` for callers that need the instance
 * (e.g., tests, advanced overrides).
 */

import { client } from '@/lib/api/generated/client.gen'

import { registerAuthInterceptors } from '@/lib/api/auth-interceptor'

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

client.setConfig({ baseUrl })
registerAuthInterceptors()

export { client }
