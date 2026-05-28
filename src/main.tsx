import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import './index.css'
import { routeTree } from './routeTree.gen'
import { queryClient } from '@/lib/api/query-client'

/*
 * App entrypoint.
 *
 * Provider stack (outermost → innermost):
 *   1. <StrictMode> — surface dev-time issues early.
 *   2. <QueryClientProvider> — TanStack Query cache for typed API hooks
 *      exposed through openapi-react-query (`$api`).
 *   3. <RouterProvider> — TanStack Router. The router tree itself is generated
 *      from `src/routes/` by the Vite plugin (see vite.config.ts); never
 *      hand-edit `routeTree.gen.ts`.
 *
 * Auth gate (Decision 1A): the `_app` layout uses `beforeLoad` to redirect
 * unauthenticated users to `/_auth/login`. That gate lives in
 * `src/routes/_app.tsx` (wired in Task T4).
 *
 * Dev tooling: <ReactQueryDevtools> renders a floating panel in dev only
 * (Vite strips it via tree-shaking in production builds because of the
 * `import.meta.env.DEV` guard).
 */

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  // Expose the QueryClient on the router context so route loaders can use
  // it for prefetching (Task T5 onward).
  context: { queryClient },
})

// Register the router instance for type safety across the codebase.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found in index.html')

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>,
)
