import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { isCoachReply } from '@/features/notifications/utils/notification-types'
import { portalListNotificationsOptions } from '@/lib/api/generated/@tanstack/react-query.gen'
import type { ModelsNotification } from '@/lib/api/generated/types.gen'

/*
 * useCoachReplies — the source of truth for the /messages coach-only inbox.
 *
 * Backend has no `?type=` filter on /portal/notifications (verified against
 * generated SDK). We fetch the top `per_page=100` notifications and filter
 * for coach-reply types (currently `checkin.responded` — see
 * `notification-types.ts`) client-side. 100 covers ~1-2 years of weekly
 * check-ins for most users. When `total > 100`, the UI surfaces a
 * "Showing 100 most recent" footer so the gap is honest.
 *
 * `capped` is true when the backend reports more notifications than we
 * loaded. We can't know how many of those are coach replies vs other
 * types without a backend filter, so we surface the cap rather than pretend
 * pagination is complete. Tracked as a TODO: add a `?type=` filter to
 * the backend list endpoint to enable real coach-reply pagination.
 *
 * Same cache key as `useUnreadCoachRepliesCount` (they wrap each other),
 * so the Sidebar/BottomNav badge fetch is reused by the /messages page
 * when the user navigates there.
 */

const PER_PAGE = 100

export interface UseCoachRepliesResult {
  /** All coach replies, newest first. */
  replies: ModelsNotification[]
  /** Replies with no read_at, newest first. */
  unread: ModelsNotification[]
  /** Replies with a read_at, newest first. */
  earlier: ModelsNotification[]
  /** Total count of loaded coach replies (= unread.length + earlier.length). */
  total: number
  /** True when the backend reports more notifications than we loaded — some
   *  of those might be coach replies older than what's shown. */
  capped: boolean
  isLoading: boolean
  isError: boolean
}

export function useCoachReplies(): UseCoachRepliesResult {
  const query = useQuery(
    portalListNotificationsOptions({ query: { per_page: PER_PAGE } }),
  )

  return useMemo(() => {
    const all = query.data?.notifications ?? []
    const serverTotal = query.data?.total ?? all.length

    const coachReplies = all
      .filter((notification) => isCoachReply(notification.type))
      .sort((earlier, later) => {
        const earlierTime = earlier.created_at
          ? new Date(earlier.created_at).getTime()
          : 0
        const laterTime = later.created_at
          ? new Date(later.created_at).getTime()
          : 0
        return laterTime - earlierTime
      })

    return {
      replies: coachReplies,
      unread: coachReplies.filter((notification) => !notification.read_at),
      earlier: coachReplies.filter((notification) =>
        Boolean(notification.read_at),
      ),
      total: coachReplies.length,
      capped: serverTotal > all.length,
      isLoading: query.isLoading,
      isError: query.isError,
    }
  }, [query.data, query.isLoading, query.isError])
}
