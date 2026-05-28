/*
 * Typed API client.
 *
 * Two layers compose here:
 *   1. `openapi-fetch` — a ~5KB runtime that uses the generated `paths` type
 *      to give `.GET("/api/v1/portal/me")` full type-safety on params + body
 *      + response. The path strings ARE the API.
 *   2. `openapi-react-query` — a ~1KB wrapper over @tanstack/react-query that
 *      exposes `useQuery`, `useMutation`, and `queryOptions` typed against the
 *      same paths.
 *
 * Both are bound to the auto-generated `schema.gen.ts` produced by
 * `pnpm openapi:gen` (see scripts/openapi-pull.sh + package.json).
 *
 * Auth interceptor: NOT wired yet. Task T4 (auth spine) registers
 * `fetchClient.use({ onResponse: ... })` here for the single-flight
 * refresh-on-401 pattern locked by /plan-eng-review Decision 5A.
 */

import createFetchClient from 'openapi-fetch'
import createReactQueryClient from 'openapi-react-query'

import type { paths } from './schema.gen'

/*
 * baseUrl resolution.
 *
 *   - Dev (default): empty string. Vite proxies `/api/*` → http://localhost:8080
 *     (see vite.config.ts > server.proxy). Path strings in the SDK already
 *     start with `/api/v1/...`, so empty base means relative-to-origin requests.
 *   - Prod (portal.fitcoach.io): same-origin reverse proxy keeps `baseUrl=''`.
 *     If the backend ever moves to a separate origin, override via the env var
 *     `VITE_API_BASE_URL` at build time without touching this file.
 */
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export const fetchClient = createFetchClient<paths>({
  baseUrl,
})

/*
 * `$api` is the react-query bound version. Components do:
 *
 *   const { data, isLoading } = $api.useQuery('get', '/api/v1/portal/me')
 *
 *   const mutation = $api.useMutation('post', '/api/v1/portal/check-ins')
 *   mutation.mutate({ body: { week_start_date: '...', ... } })
 *
 *   // For prefetch / loader:
 *   queryClient.prefetchQuery(
 *     $api.queryOptions('get', '/api/v1/portal/sessions'),
 *   )
 *
 * Naming convention `$api` mirrors the openapi-react-query examples; the `$`
 * prefix signals "this is a typed-SDK helper", distinct from feature-level
 * useFoo hooks.
 */
export const $api = createReactQueryClient(fetchClient)
