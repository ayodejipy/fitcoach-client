import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { portalListNotificationsOptions } from '@/lib/api/generated/@tanstack/react-query.gen'
import type { ModelsNotification } from '@/lib/api/generated/types.gen'

/*
 * useMessageThreads — pulls coach reply / message notifications and groups
 * them for the /messages inbox view.
 *
 * Sort: newest first within each group (backend doesn't guarantee order;
 * we sort defensively here).
 *
 * Groups:
 *   - `unread` — no `read_at` timestamp. Shown first on /messages with
 *     prominent treatment (accent bar, tint, NEW pill).
 *   - `earlier` — has `read_at`. Quieter card styling.
 *
 * Same query key as `useNotificationsRealtime` and `useUnreadCount` — no
 * extra fetch. The realtime WS hook invalidates this list when a new push
 * arrives, so the inbox updates automatically.
 */

const COACH_REPLY_TYPES = new Set(['coach_reply', 'coach_message'])

export interface UseMessageThreadsResult {
  threads: ModelsNotification[]
  unread: ModelsNotification[]
  earlier: ModelsNotification[]
  isLoading: boolean
  isError: boolean
}

export function useMessageThreads(): UseMessageThreadsResult {
  const query = useQuery(portalListNotificationsOptions())

  return useMemo(() => {
    const all = query.data?.notifications ?? []
    const coachReplies = all.filter(
      (notification) =>
        typeof notification.type === 'string' &&
        COACH_REPLY_TYPES.has(notification.type),
    )
    // Newest first.
    const newestFirst = [...coachReplies].sort((earlier, later) => {
      const earlierTime = earlier.created_at
        ? new Date(earlier.created_at).getTime()
        : 0
      const laterTime = later.created_at
        ? new Date(later.created_at).getTime()
        : 0
      return laterTime - earlierTime
    })

    return {
      threads: newestFirst,
      unread: newestFirst.filter((notification) => !notification.read_at),
      earlier: newestFirst.filter((notification) => Boolean(notification.read_at)),
      isLoading: query.isLoading,
      isError: query.isError,
    }
  }, [query.data, query.isLoading, query.isError])
}
