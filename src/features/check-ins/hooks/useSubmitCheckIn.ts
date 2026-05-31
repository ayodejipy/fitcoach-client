import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import {
  portalListCheckInsQueryKey,
  portalSubmitCheckInMutation,
} from '@/lib/api/generated/@tanstack/react-query.gen'
import { appErrorFromThrown, isFieldLevelError } from '@/lib/api/error'
import type { CheckInSubmitFormValues } from '@/features/check-ins/schemas/check-in-submit'
import { useStreak } from '@/features/check-ins/hooks/useStreak'
import { tierOf } from '@/features/check-ins/utils/streak-derive'
import { useCelebrationStore } from '@/stores/celebration'

/*
 * useSubmitCheckIn — owns the submit flow + side effects.
 *
 *   - Mutation: typed `portalSubmitCheckInMutation()` from generated code.
 *   - On success:
 *       1. Capture the streak BEFORE the cache invalidation (so we know
 *          what to show as the "previous count" in the celebration sheet).
 *       2. Push a payload onto the celebration store — the sheet renders
 *          when the dashboard mounts.
 *       3. Invalidate the check-ins list — `useStreak` rederives with the
 *          fresh entry and the dashboard streak ticks up.
 *       4. Toast a brief success, navigate to /dashboard.
 *   - On error: backend's `{ code, error }` message inline for 400/401/422
 *     (the body had a problem); toast for everything else (5xx, 429, etc.).
 *
 * Common failure mode: 409 duplicate-week — the user tried to submit twice
 * for the same Monday. Backend's message is user-ready ("you've already
 * checked in this week"), surfaces inline via `onInlineError`.
 *
 * The celebration payload computes the new streak count by hand rather than
 * waiting for the invalidated query to refetch — that way the sheet animates
 * the EXACT old-to-new transition the user just caused, with no awkward
 * "loading…" pause.
 */
export interface SubmitCheckInOptions {
  onInlineError?: (message: string) => void
}

export function useSubmitCheckIn() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const streakBefore = useStreak()
  const showCelebration = useCelebrationStore((s) => s.show)

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
          // Compute the new streak count locally so the celebration sheet
          // animates the exact "before → after" the user caused. If the
          // streak was broken, this submit is a fresh start (count = 1);
          // otherwise it's prev + 1. (A duplicate-this-week submit would
          // have 4xx'd at the backend and not reached this branch.)
          const prevCount = streakBefore.isBroken ? 0 : streakBefore.count
          const newCount = streakBefore.isBroken ? 1 : streakBefore.count + 1
          const prevTier = streakBefore.tier
          const newTier = tierOf(newCount)
          showCelebration({ prevCount, newCount, prevTier, newTier })

          // Refresh the check-ins list so the dashboard reflects the new
          // entry on next render.
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
