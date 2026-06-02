import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { toast } from 'sonner'

import { portalLoginMutation } from '@/lib/api/generated/@tanstack/react-query.gen'
import { appErrorFromThrown, isFieldLevelError } from '@/lib/api/error'
import { useTokensStore } from '@/stores/tokens'
import type { LoginFormValues } from '@/features/auth/schemas/login'

export interface LoginMutateOptions {
  /**
   * Called when the backend returns a validation / 401 error. The form uses
   * this to pin a backend message to a specific RHF field (typically the
   * password field — "wrong email or password" doesn't disambiguate which).
   */
  onInlineError?: (message: string) => void
}

export function useLogin() {
  const navigate = useNavigate()
  const { redirect } = useSearch({ from: '/_auth/login' })
  const setTokens = useTokensStore((s) => s.setTokens)

  const mutation = useMutation({
    ...portalLoginMutation(),
    // Form owns its own errors; the global toaster sits this one out.
    meta: { skipToast: true },
  })

  function login(values: LoginFormValues, opts: LoginMutateOptions = {}) {
    mutation.mutate(
      { body: values },
      {
        onSuccess: (data) => {
          if (!data.access_token || !data.refresh_token) {
            // Defensive: the schema marks tokens as optional but a successful
            // login MUST return both. Treat as a server-side anomaly.
            toast.error("Sign-in succeeded but no session was returned. Try again.")
            return
          }
          setTokens({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            clientId: data.client_id,
          })
          navigate({ to: redirect ?? '/dashboard', replace: true })
        },
        onError: (err) => {
          const appErr = appErrorFromThrown(err)
          // 400/401/422 = the input itself is the problem; surface inline.
          // Everything else (5xx, 429, network) toasts.
          if (isFieldLevelError(appErr)) {
            opts.onInlineError?.(
              appErr.message || 'Wrong email or password.',
            )
            return
          }
          toast.error(appErr.message)
        },
      },
    )
  }

  return {
    login,
    isPending: mutation.isPending,
  }
}
