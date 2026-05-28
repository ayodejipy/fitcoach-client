import { QueryClient } from '@tanstack/react-query'

/*
 * Single QueryClient for the whole portal app.
 *
 * Defaults tuned for a habit-app workload:
 *   - staleTime 30s: the dashboard's data is fresh enough for ~30s without
 *     a refetch. Submitting a check-in invalidates the relevant queries
 *     explicitly via queryClient.invalidateQueries.
 *   - gcTime 5min: keep recently-viewed data warm across short tab focus loss.
 *   - retry 1: don't hammer the backend; surface failures via the global
 *     error UX (Decision 7A) after a single retry.
 *   - refetchOnWindowFocus true (default): when the client refocuses the tab
 *     mid-week, the streak / coach reply / today's session refresh
 *     automatically — the "feels alive" behavior we want without a websocket.
 *
 * Hoisted into its own module so route loaders can import the same instance
 * for prefetch via `queryClient.prefetchQuery(...)` in TanStack Router
 * `beforeLoad` hooks.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})
