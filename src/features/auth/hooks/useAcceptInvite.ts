import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import {
  portalAcceptInviteMutation,
  portalLoginMutation,
} from '@/lib/api/generated/@tanstack/react-query.gen'
import { appErrorFromThrown, isFieldLevelError } from '@/lib/api/error'
import { useTokensStore } from '@/stores/tokens'
import type { AcceptInviteFormValues } from '@/features/auth/schemas/accept-invite'

/*
 * useAcceptInvite — owns the chained accept-invite → login → dashboard flow
 * (Decision 6A cold-start).
 *
 * Backend's POST /portal/accept-invite returns 204 No Content (sets the
 * password only). To land the user on their dashboard immediately we chain
 * accept-invite → login automatically:
 *
 *   1. POST /portal/accept-invite { token, password }     → 204
 *   2. POST /portal/auth/login    { email, password }     → tokens
 *   3. Hydrate the Zustand tokens store; navigate to /dashboard.
 *
 * If accept-invite succeeds but login fails (rare — would mean the new
 * password didn't take, or rate-limited), the hook falls back to a friendly
 * toast and pushes the user to /login.
 *
 * Both calls use the typed mutations generated from openapi.json via
 * @hey-api/openapi-ts + TanStack Query plugin.
 */

export interface AcceptInviteMutateOptions {
  /**
   * Called when accept-invite returns a validation / 401 error. The form
   * surfaces this at the password field (typical cause: invite token is
   * invalid or already used).
   */
  onInlineError?: (message: string) => void
}

export function useAcceptInvite(token: string) {
  const navigate = useNavigate()
  const setTokens = useTokensStore((s) => s.setTokens)

  const acceptMutation = useMutation({
    ...portalAcceptInviteMutation(),
    meta: { skipToast: true },
  })
  const loginMutation = useMutation({
    ...portalLoginMutation(),
    meta: { skipToast: true },
  })

  const isPending = acceptMutation.isPending || loginMutation.isPending

  function accept(
    values: AcceptInviteFormValues,
    opts: AcceptInviteMutateOptions = {},
  ) {
    acceptMutation.mutate(
      { body: { token, password: values.password } },
      {
        onSuccess: () => {
          // 204 — no body. Chain into login to get tokens.
          loginMutation.mutate(
            { body: { email: values.email, password: values.password } },
            {
              onSuccess: (data) => {
                if (!data.access_token || !data.refresh_token) {
                  toast.message(
                    'Your account is set up. Please sign in to continue.',
                  )
                  navigate({ to: '/login', replace: true })
                  return
                }
                setTokens({
                  accessToken: data.access_token,
                  refreshToken: data.refresh_token,
                  clientId: data.client_id,
                })
                navigate({ to: '/dashboard', replace: true })
              },
              onError: () => {
                // Accept succeeded but login didn't — guide the user to sign in.
                toast.message(
                  'Password set. Please sign in to continue.',
                )
                navigate({ to: '/login', replace: true })
              },
            },
          )
        },
        onError: (err) => {
          const appErr = appErrorFromThrown(err)
          // 400/401/422 → the input (or token) is the problem; surface inline.
          // Everything else (5xx, 429, network) toasts.
          if (isFieldLevelError(appErr)) {
            opts.onInlineError?.(
              appErr.message ||
                'This invite link is invalid or has been used already. Ask your coach to re-send.',
            )
            return
          }
          toast.error(appErr.message)
        },
      },
    )
  }

  return {
    accept,
    isPending,
  }
}
