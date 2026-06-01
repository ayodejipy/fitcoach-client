import { useMessageThreads } from '@/features/notifications/hooks/useMessageThreads'
import type { ModelsNotification } from '@/lib/api/generated/types.gen'

/*
 * useLatestCoachReply — the most recent coach reply, for the dashboard's
 * `RecentCoachReply` preview card.
 *
 * Thin wrapper over `useMessageThreads` — same query underneath, just
 * exposes the first entry. Keeps the dashboard call site readable
 * (`useLatestCoachReply()` reads as exactly what it returns) while
 * sharing the source of truth with the /messages inbox view.
 */

export interface UseLatestCoachReplyResult {
  reply: ModelsNotification | null
  isLoading: boolean
}

export function useLatestCoachReply(): UseLatestCoachReplyResult {
  const { threads, isLoading } = useMessageThreads()
  return {
    reply: threads[0] ?? null,
    isLoading,
  }
}
