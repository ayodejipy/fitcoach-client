import { defineConfig } from '@hey-api/openapi-ts'

/*
 * @hey-api/openapi-ts config — the codegen pipeline for the typed SDK.
 *
 * Mirrors the coach app's pattern (fitcoach-crm/openapi-ts.config.ts) but
 * extended with the TanStack Query plugin (we use React Query in the portal,
 * not Vue/Pinia like the coach app).
 *
 * Run via: `pnpm openapi:gen`
 *
 * Output (src/lib/api/generated/):
 *   - client.gen.ts     bundled fetch client + setConfig + setMiddleware
 *   - types.gen.ts      every schema/operation type
 *   - sdk.gen.ts        named functions per endpoint, derived from operationId
 *                       (e.g. portalLogin, portalGetMe, portalSubmitCheckIn)
 *   - @tanstack/react-query.gen.ts
 *                       per-endpoint TanStack Query helpers:
 *                         portalLoginMutation, portalGetMeOptions, etc.
 *   - zod.gen.ts        Zod schemas for every request/response body.
 *
 * Naming: hey-api uses the spec's operationId (we set those in the backend
 * via swag @ID annotations — see fitcoach-backend/internal/handlers/*).
 * Currently they're prefixed `Portal*`; if we ever want to strip that prefix,
 * hey-api supports a name transformer here.
 *
 * Pinned by MEMORY: feedback_api_endpoint_wrappers — every path string lives
 * in generated code, never in feature code.
 */
export default defineConfig({
  input: './openapi.json',
  output: {
    path: './src/lib/api/generated',
    // No post-formatter — prettier isn't installed in this repo, and hey-api's
    // raw output is valid TypeScript that the IDE handles fine. If we ever
    // add prettier project-wide, set `format: 'prettier'` here.
  },
  plugins: [
    {
      name: '@hey-api/client-fetch',
      throwOnError: true,
    },
    '@hey-api/typescript',
    {
      name: '@hey-api/sdk',
      // Return parsed `data` from generated functions (vs. the full
      // { data, error } envelope) — matches the coach app's convention.
      responseStyle: 'data',
    },
    {
      name: '@tanstack/react-query',
      mutationOptions: true,
      queryOptions: true,
    },
    'zod',
  ],
})
