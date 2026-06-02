import { useNotificationsFeed } from '@/features/notifications/hooks/useNotificationsFeed'
import { isCoachReply } from '@/features/notifications/utils/notification-types'
import type { ModelsNotification } from '@/lib/api/generated/types.gen'

/*
 * useLatestCoachReply — the most recent coach reply, for the dashboard's
 * `RecentCoachReply` preview card.
 *
 * Reads from `useNotificationsFeed`'s loaded items (the infinite query
 * powering the bell dropdown). Both the bell dropdown and this hook
 * subscribe to the same query key, so on dashboard there's ONE fetch
 * shared between both surfaces — no duplicate request.
 *
 * Type filter is sourced from `notification-types.ts` — single source of
 * truth across `useCoachReplies`, `useLatestCoachReply`, and the
 * dropdown item.
 */

export interface UseLatestCoachReplyResult {
  reply: ModelsNotification | null
  isLoading: boolean
}

export function useLatestCoachReply(): UseLatestCoachReplyResult {
  const feed = useNotificationsFeed()

  const coachReply = feed.items.find((notification) =>
    isCoachReply(notification.type),
  )

  return {
    reply: coachReply ?? null,
    isLoading: feed.isLoading,
  }
}
