import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

import './index.css'
import { routeTree } from './routeTree.gen'

/*
 * App entrypoint.
 *
 * The TanStack Router Vite plugin (configured in vite.config.ts) generates
 * `src/routeTree.gen.ts` from the files in `src/routes/`. The generated tree
 * is the single source of truth for routing — never hand-edit `routeTree.gen.ts`;
 * edit the route files in `src/routes/`.
 *
 * Auth gate (Decision 1A from /plan-eng-review): the `_app` layout uses
 * `beforeLoad` to redirect unauthenticated users to `/_auth/login`. That gate
 * lives in `src/routes/_app.tsx` (not here).
 */

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
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
    <RouterProvider router={router} />
  </StrictMode>,
)
