import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { portalConfirmSessionMutation } from '@/lib/api/generated/@tanstack/react-query.gen'
import { appErrorFromThrown } from '@/lib/api/error'

/*
 * useConfirmSession — flips a coach-booked session to `confirmed = true`
 * via PATCH /api/v1/portal/sessions/{id}. The backend forces the value
 * server-side (clients can only set TRUE), and side-effects a
 * `session.confirmed` notification to the coach so they see the
 * confirmation land in their CRM bell.
 *
 * Cache invalidation: the prefix key `[{ _id: 'portalListSessions' }]`
 * matches both the regular and infinite list variants via TanStack's
 * partialDeepEqual on object keys — one invalidate refreshes /sessions
 * and any list cache slice. We invalidate `portalGetSession` too so a
 * detail page (if open) re-fetches.
 *
 * The mutation is idempotent on the backend — re-confirming an
 * already-confirmed row is a no-op write, no duplicate notification.
 */
export function useConfirmSession() {
  const queryClient = useQueryClient()

  return useMutation({
    ...portalConfirmSessionMutation(),
    onSuccess: () => {
      toast.success('Confirmed — your coach has been notified.')
      void queryClient.invalidateQueries({
        queryKey: [{ _id: 'portalListSessions' }],
      })
      void queryClient.invalidateQueries({
        queryKey: [{ _id: 'portalGetSession' }],
      })
    },
    onError: (err) => {
      const appErr = appErrorFromThrown(err)
      toast.error(appErr.message || "Couldn't confirm. Try again.")
    },
  })
}
