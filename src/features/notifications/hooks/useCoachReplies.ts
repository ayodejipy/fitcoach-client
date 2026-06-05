import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { COACH_REPLY_PRIMARY_TYPE } from '@/features/notifications/utils/notification-types'
import { portalListNotificationsOptions } from '@/lib/api/generated/@tanstack/react-query.gen'
import type { ModelsNotification } from '@/lib/api/generated/types.gen'

/*
 * useCoachReplies — the source of truth for the /messages coach-only inbox.
 *
 * Backend filters server-side via `?type=checkin.responded`, so the list
 * arrives pre-narrowed to coach replies. The earlier client-side
 * `.filter(isCoachReply)` workaround is gone — see the b1 backend change
 * that added the `?type=` param on `/api/v1/portal/notifications`.
 *
 * `capped` is true when the backend reports more coach replies than we
 * loaded (the server's `total` is now the count under the type filter,
 * not all notifications). When that happens, /messages surfaces a
 * "Showing N most recent" hint.
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
  /** True when the backend reports more coach replies than we loaded. */
  capped: boolean
  isLoading: boolean
  isError: boolean
}

export function useCoachReplies(): UseCoachRepliesResult {
  const query = useQuery(
    portalListNotificationsOptions({
      query: { per_page: PER_PAGE, type: COACH_REPLY_PRIMARY_TYPE },
    }),
  )

  return useMemo(() => {
    const replies = query.data?.notifications ?? []
    const serverTotal = query.data?.total ?? replies.length

    return {
      replies,
      unread: replies.filter((notification) => !notification.read_at),
      earlier: replies.filter((notification) =>
        Boolean(notification.read_at),
      ),
      total: replies.length,
      capped: serverTotal > replies.length,
      isLoading: query.isLoading,
      isError: query.isError,
    }
  }, [query.data, query.isLoading, query.isError])
}
