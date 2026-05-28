import { Outlet, createRootRoute } from '@tanstack/react-router'

/*
 * Root route — wraps every page in the app.
 *
 * Thin shell only. Globally-mounted providers (TanStack Query client,
 * ErrorBoundary, Toaster) will live in `<AppShell />` once Task T7
 * (global error UX) lands. For now this just renders the Outlet.
 *
 * Devtools intentionally omitted in this skeleton; add via
 * `<TanStackRouterDevtools />` once auth gating is in place so they're
 * scoped to dev builds only.
 */
export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return <Outlet />
}
