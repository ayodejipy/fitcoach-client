import {
  MutationCache,
  QueryCache,
  QueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { appErrorFromThrown } from '@/lib/api/error'

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
 * Global error UX (Decision 7A): every uncaught query / mutation error funnels
 * through the QueryCache and MutationCache `onError` hooks below. They:
 *   1. Normalize whatever was thrown into an AppError (status, code, message
 *      from the backend's { code, error } body verbatim — see ./error.ts).
 *   2. Suppress 401 toasts — the auth interceptor already clears tokens and
 *      the route gate redirects to /login on the next render. Toasting
 *      "session expired" here would double-message the user.
 *   3. Respect `meta: { skipToast: true }` — forms set this so they can
 *      surface inline-vs-toast themselves.
 *   4. Toast everything else with the backend's `error` message directly.
 */

function showErrorToast(thrown: unknown) {
  const err = appErrorFromThrown(thrown)
  // Auth interceptor + route gate handle 401 redirects; don't double-message.
  if (err.status === 401) return
  toast.error(err.message)
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => showErrorToast(error),
  }),
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      // Forms set `meta: { skipToast: true }` when they want to render
      // errors inline themselves. Otherwise the global toaster fires.
      if (mutation.meta?.skipToast === true) return
      showErrorToast(error)
    },
  }),
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
