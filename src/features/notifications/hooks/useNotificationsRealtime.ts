import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import {
  portalListNotificationsInfiniteQueryKey,
  portalListNotificationsQueryKey,
  portalUnreadNotificationCountQueryKey,
} from '@/lib/api/generated/@tanstack/react-query.gen'
import type { ModelsNotification } from '@/lib/api/generated/types.gen'
import { pickStringFromNotificationData } from '@/features/notifications/utils/pick-notification-data'
import { usePortalWs } from '@/lib/ws/use-portal-ws'
import { useTokensStore } from '@/stores/tokens'

/*
 * useNotificationsRealtime — the layer that turns raw WS pushes from
 * `usePortalWs` into user-facing side effects:
 *
 *   1. Invalidate the unread-count query so the badge re-fetches the
 *      authoritative number (the WS push is the trigger; HTTP is the truth).
 *   2. Invalidate the notifications list so /messages re-renders if the
 *      user is on it right now.
 *   3. Show a toast with friendly copy. Coach-reply toasts get a "View"
 *      action that navigates to /messages.
 *
 * Mount this ONCE per authenticated session — from the `_app` layout —
 * so the socket lives across route changes. Mounting it per-page would
 * tear the connection down every navigation.
 *
 * `enabled` gates on auth so we don't spin a reconnect loop pre-login.
 *
 * Why the toast for non-coach-reply events too: the backend emits a few
 * notification types (e.g. session_reminder). Rather than enumerate every
 * one here — which would drift the moment a new type ships — fall back to
 * a generic friendly toast that uses the notification's own data fields if
 * present. The MESSAGE itself comes from the backend (trust backend errors
 * / strings — same principle as our error path).
 */
export function useNotificationsRealtime() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const isAuthenticated = useTokensStore((s) => s.isAuthenticated())

  const onMessage = useCallback(
    (payload: unknown) => {
      if (!isNotification(payload)) return

      // Refresh server-authoritative state. Without this, badges drift.
      void queryClient.invalidateQueries({
        queryKey: portalUnreadNotificationCountQueryKey(),
      })
      // Both the regular list (useLatestCoachReply on the dashboard) and
      // the infinite list (useMessageThreads on /messages) have distinct
      // cache keys — invalidate both so a push refreshes whichever view
      // is mounted.
      void queryClient.invalidateQueries({
        queryKey: portalListNotificationsQueryKey(),
      })
      void queryClient.invalidateQueries({
        queryKey: portalListNotificationsInfiniteQueryKey(),
      })

      const copy = friendlyCopyFor(payload)
      if (!copy) return

      if (
        payload.type === 'checkin.responded' ||
        payload.type === 'coach_reply' ||
        payload.type === 'coach_message'
      ) {
        toast(copy.title, {
          description: copy.description,
          action: {
            label: 'View',
            onClick: () => {
              void navigate({ to: '/messages' })
            },
          },
        })
        return
      }

      toast(copy.title, {
        description: copy.description,
      })
    },
    [queryClient, navigate],
  )

  usePortalWs({ enabled: isAuthenticated, onMessage })
}

function isNotification(p: unknown): p is ModelsNotification {
  return (
    typeof p === 'object' &&
    p !== null &&
    'type' in p &&
    typeof (p as { type: unknown }).type === 'string'
  )
}

interface FriendlyCopy {
  title: string
  description?: string
}

function friendlyCopyFor(notification: ModelsNotification): FriendlyCopy | null {
  const data = notification.data ?? {}
  const coachName =
    pickStringFromNotificationData(data, 'coach_name') ?? 'Your coach'

  switch (notification.type) {
    case 'checkin.responded':
    case 'coach_reply':
    case 'coach_message':
      return {
        title: `${coachName} replied`,
        description:
          pickStringFromNotificationData(data, 'coach_response') ??
          pickStringFromNotificationData(data, 'preview'),
      }
    case 'session_reminder':
      return {
        title: 'Session reminder',
        description:
          pickStringFromNotificationData(data, 'preview') ??
          'You have a session coming up.',
      }
    default:
      // Unknown type — keep it quiet rather than show a confusing generic
      // toast. The unread badge still ticks (the invalidations above ran),
      // so the user can still discover it in /messages.
      return null
  }
}
