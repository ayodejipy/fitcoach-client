import type { QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

/*
 * Root route — wraps every page in the app.
 *
 * Context surface: the QueryClient is threaded through the router context
 * (see src/main.tsx) so route `beforeLoad` and loader functions can use
 * `context.queryClient.prefetchQuery(...)` for typed prefetches without
 * importing the singleton.
 *
 * Auth context will be added here in Task T4 (auth spine) — the tokens
 * slice from Zustand becomes `context.auth` so `_app`'s beforeLoad can
 * gate routes without re-reading storage on every navigation.
 *
 * Devtools intentionally omitted in this skeleton; add via
 * <TanStackRouterDevtools /> once auth gating is in place so they're
 * scoped to dev builds only.
 */

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  return <Outlet />
}
