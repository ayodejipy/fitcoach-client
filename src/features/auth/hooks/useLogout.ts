import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'

import { portalLogout } from '@/lib/api/generated/sdk.gen'
import { useTokensStore } from '@/stores/tokens'

/*
 * useLogout — body-based sign-out (matches the backend's PortalLogoutRequest).
 *
 * Behavior:
 *   1. Read the refresh token from the store.
 *   2. POST it to /portal/auth/logout (best-effort — we proceed regardless).
 *      The backend revokes the refresh + rotates its server-side state.
 *   3. Wipe the local tokens store. This is non-negotiable: even if the
 *      network call fails, the user has expressed intent to sign out, so
 *      their access is revoked on this device.
 *   4. Clear TanStack Query's cache so the next user (or the same one
 *      signing back in) doesn't see stale data from the previous session.
 *   5. Navigate to /login.
 *
 * Why the typed SDK function `portalLogout` instead of the TanStack Query
 * mutation helper: logout is a fire-and-forget side effect we trigger from
 * a button handler, not a stateful operation a component renders against.
 * The plain function is the right tool — no mutation cache pollution, no
 * pending state we don't use, no global toast noise on the inevitable
 * network failure of a sign-out that already succeeded locally.
 *
 * The logout endpoint is in PUBLIC_PATHS in the auth interceptor — body
 * carries the refresh token, no Authorization header is attached.
 */
export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const clearTokens = useTokensStore((s) => s.clearTokens)

  return async function logout() {
    const refresh = useTokensStore.getState().refreshToken
    if (refresh) {
      // Fire and forget. Don't await the response for navigation —
      // we want logout to feel instant.
      void portalLogout({
        body: { refresh_token: refresh },
        throwOnError: false,
      }).catch(() => {
        /* network failure is fine; we're signing out locally anyway */
      })
    }

    clearTokens()
    queryClient.clear()
    await navigate({ to: '/login', replace: true })
  }
}
