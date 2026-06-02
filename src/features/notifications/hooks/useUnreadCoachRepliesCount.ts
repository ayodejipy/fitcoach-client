import { useCoachReplies } from '@/features/notifications/hooks/useCoachReplies'

/*
 * useUnreadCoachRepliesCount — drives the Messages tab badge in Sidebar
 * + BottomNav.
 *
 * Thin derived hook over `useCoachReplies`. Shares the underlying TanStack
 * cache with the /messages route, so Sidebar's badge fetch is the same
 * fetch /messages uses when the user navigates there.
 *
 * Why this exists separately from `useUnreadCount` (the cheap dedicated
 * `/unread-count` endpoint): backend's unread-count includes EVERY
 * notification type. The Messages tab points at /messages which only
 * shows coach replies, so the badge must count only coach replies for
 * badge/page agreement. The all-type unread is still surfaced via the
 * bell dot.
 */
export function useUnreadCoachRepliesCount(): {
  count: number
  isLoading: boolean
} {
  const { unread, isLoading } = useCoachReplies()
  return {
    count: unread.length,
    isLoading,
  }
}
