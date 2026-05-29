import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import {
  portalListCheckInsQueryKey,
  portalSubmitCheckInMutation,
} from '@/lib/api/generated/@tanstack/react-query.gen'
import { appErrorFromThrown, isFieldLevelError } from '@/lib/api/error'
import type { CheckInSubmitFormValues } from '@/features/check-ins/schemas/check-in-submit'

/*
 * useSubmitCheckIn — owns the submit flow + side effects.
 *
 *   - Mutation: typed `portalSubmitCheckInMutation()` from generated code.
 *   - On success: invalidate the check-ins list so `useStreak` recomputes
 *     with the new entry; toast a brief success message; navigate back to
 *     the dashboard (where the streak now reflects the submit).
 *   - On error: backend's `{ code, error }` message inline for
 *     400/401/422 (the body had a problem); toast for everything else.
 *
 * Common backend failure case: 409 duplicate-week — the user tried to
 * submit twice for the same Monday. The backend's error message is already
 * human ("you've already checked in this week"), so it surfaces verbatim
 * via the global mutationCache.onError handler (no meta.skipToast here for
 * non-field errors — let the global handler surface them).
 *
 * Pattern locked: every async flow lives in a hook; the form is pure UI.
 */
export interface SubmitCheckInOptions {
  onInlineError?: (message: string) => void
}

export function useSubmitCheckIn() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const mutation = useMutation({
    ...portalSubmitCheckInMutation(),
    // Form owns its own field errors; global toaster sits this one out.
    meta: { skipToast: true },
  })

  function submit(
    values: CheckInSubmitFormValues,
    opts: SubmitCheckInOptions = {},
  ) {
    mutation.mutate(
      { body: values },
      {
        onSuccess: () => {
          // Invalidate the cached check-ins list — `useStreak` rederives
          // on the next render and the dashboard streak ticks up.
          void queryClient.invalidateQueries({
            queryKey: portalListCheckInsQueryKey(),
          })
          toast.success('Week logged. Nice work.')
          navigate({ to: '/dashboard', replace: true })
        },
        onError: (err) => {
          const appErr = appErrorFromThrown(err)
          if (isFieldLevelError(appErr)) {
            opts.onInlineError?.(
              appErr.message ?? "Couldn't submit. Try again.",
            )
            return
          }
          toast.error(appErr.message)
        },
      },
    )
  }

  return {
    submit,
    isPending: mutation.isPending,
  }
}
