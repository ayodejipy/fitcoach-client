import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

import { portalListNotificationsInfiniteOptions } from '@/lib/api/generated/@tanstack/react-query.gen'
import type { ModelsNotification } from '@/lib/api/generated/types.gen'

/*
 * useNotificationsFeed — paginated load of ALL notifications for the
 * bell-dropdown inbox.
 *
 * Pulls every notification type (coach replies, session reminders, payment
 * alerts, system messages). The /messages route uses `useCoachReplies`
 * for the curated coach-conversation surface; this hook feeds the bell
 * dropdown (the firehose).
 *
 * Pagination:
 *   - Infinite query over `portalListNotifications` with `per_page=20`.
 *   - `fetchNextPage()` loads the next chunk; backend reports `total_pages`,
 *     so `hasNextPage` is computed from that vs the latest loaded page.
 *   - Pages are flattened newest-first across all loaded pages.
 *
 * Cache key: the infinite variant has its OWN query key
 * (`portalListNotificationsInfiniteQueryKey`) distinct from the regular
 * one used by `useCoachReplies` + `useLatestCoachReply`.
 * `useNotificationsRealtime` invalidates both prefixes so a WS push
 * refreshes whichever views are mounted.
 */

const PER_PAGE = 20

export interface UseNotificationsFeedResult {
  /** Every loaded notification, newest first. */
  items: ModelsNotification[]
  /** Items in `items` with no read_at — drives "N new" pill. */
  unreadCount: number
  /** Server-reported total across ALL pages (not just loaded). */
  total: number
  /** Items loaded into memory so far. */
  loadedCount: number
  isLoading: boolean
  isError: boolean
  /** Pagination state. */
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

export function useNotificationsFeed(): UseNotificationsFeedResult {
  const query = useInfiniteQuery({
    ...portalListNotificationsInfiniteOptions({
      query: { per_page: PER_PAGE },
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _all, lastPageParam) => {
      const currentPage =
        typeof lastPageParam === 'number'
          ? lastPageParam
          : (lastPage.page ?? 1)
      const totalPages = lastPage.total_pages ?? 0
      return currentPage < totalPages ? currentPage + 1 : undefined
    },
  })

  return useMemo(() => {
    const pages = query.data?.pages ?? []
    const flat: ModelsNotification[] = pages.flatMap(
      (page) => page.notifications ?? [],
    )

    const sorted = [...flat].sort((earlier, later) => {
      const earlierTime = earlier.created_at
        ? new Date(earlier.created_at).getTime()
        : 0
      const laterTime = later.created_at
        ? new Date(later.created_at).getTime()
        : 0
      return laterTime - earlierTime
    })

    const unreadCount = sorted.reduce(
      (count, notification) => (notification.read_at ? count : count + 1),
      0,
    )
    const total = pages[pages.length - 1]?.total ?? sorted.length

    return {
      items: sorted,
      unreadCount,
      total,
      loadedCount: sorted.length,
      isLoading: query.isLoading,
      isError: query.isError,
      hasNextPage: Boolean(query.hasNextPage),
      isFetchingNextPage: query.isFetchingNextPage,
      fetchNextPage: () => void query.fetchNextPage(),
    }
  }, [
    query.data,
    query.isLoading,
    query.isError,
    query.hasNextPage,
    query.isFetchingNextPage,
    query.fetchNextPage,
  ])
}
