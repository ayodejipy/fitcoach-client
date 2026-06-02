import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'

import { portalLogout } from '@/lib/api/generated/sdk.gen'
import { useTokensStore } from '@/stores/tokens'


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
