import { useMutation, useQueryClient } from '@tanstack/react-query'

import { portalMarkAllNotificationsReadMutation } from '@/lib/api/generated/@tanstack/react-query.gen'

/*
 * useMarkAllNotificationsRead — bulk-marks every notification read for the
 * authenticated client.
 *
 * Called from the bell dropdown's "Mark all read" link. Backend stamps
 * `read_at` on every unread notification regardless of type, so this
 * clears coach replies + system updates in one shot.
 *
 * Cache invalidation: the prefix key `[{ _id: 'portalListNotifications' }]`
 * matches both the regular and infinite list variants via TanStack's
 * partialDeepEqual on object keys — one invalidate refreshes the bell
 * dropdown, /messages, RecentCoachReply, and the unread-count badge.
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    ...portalMarkAllNotificationsReadMutation(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [{ _id: 'portalListNotifications' }],
      })
      void queryClient.invalidateQueries({
        queryKey: [{ _id: 'portalUnreadNotificationCount' }],
      })
    },
  })
}
