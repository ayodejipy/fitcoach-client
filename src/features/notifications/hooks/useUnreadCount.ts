import { useQuery } from '@tanstack/react-query'

import { portalUnreadNotificationCountOptions } from '@/lib/api/generated/@tanstack/react-query.gen'

/*
 * useUnreadCount — the single source of truth for the unread-notifications
 * badge (shown on the Messages tab + the dashboard bell).
 *
 * Why HTTP-backed and not "trust the WS push":
 *   The WS is a NUDGE — it tells us "something changed, refetch". The
 *   authoritative count comes from GET /api/v1/portal/notifications/unread-count
 *   so reconnect gaps, late mounts, and stale clients all converge on the
 *   real number. `useNotificationsRealtime` invalidates this query whenever
 *   a push arrives.
 *
 * `refetchOnWindowFocus: true` is the default but worth calling out: it's the
 * safety net for the reconnect-while-visible WS strategy — even if the user
 * returns to a tab whose socket was closed mid-burst, the focus refetch picks
 * up the right count within a render.
 *
 * Returns `count` as a number (defaulting to 0) for the friendly call-site
 * `count > 0 ? <Badge /> : null` pattern.
 */
export function useUnreadCount(): { count: number; isLoading: boolean } {
  const query = useQuery({
    ...portalUnreadNotificationCountOptions(),
    // Cheap query, but no point hammering it on every interaction.
    staleTime: 15_000,
  })

  return {
    count: query.data?.count ?? 0,
    isLoading: query.isLoading,
  }
}
