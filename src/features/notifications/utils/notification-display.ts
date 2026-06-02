import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  Calendar,
  ClipboardCheck,
  MessageCircle,
  Receipt,
} from 'lucide-react'

import { pickStringFromNotificationData } from '@/features/notifications/utils/pick-notification-data'
import type { ModelsNotification } from '@/lib/api/generated/types.gen'

/*
 * notification-display — type-aware presentation config for a notification.
 *
 * For a given `notification.type`, returns:
 *   - `Icon`: lucide icon to render in the row's accent circle
 *   - `accentBg` / `accentFg`: CSS color strings for the accent circle
 *   - `kindLabel`: short uppercase label ("Session", "Billing", "Coach", ...)
 *   - `title`: human-readable title — uses backend's `data.title` if set,
 *     otherwise a static fallback keyed by type
 *   - `body`: preview / body string from `data.preview` or `data.body`
 *   - `href`: where to navigate when the row is tapped (null = no link)
 *
 * Used by `SystemNotificationRow` (and any other surface that wants a
 * consistent type → display mapping). MessageThread cards for coach replies
 * are richer and don't call this util — they read the same `data` blob
 * directly.
 *
 * Adding a new notification type: append a `case` here. Unknown types fall
 * through to the `default` (Bell icon, neutral tint, "Update" label) so the
 * inbox always renders something rather than going blank.
 */

export interface NotificationDisplay {
  Icon: LucideIcon
  accentBg: string
  accentFg: string
  kindLabel: string
  title: string
  body: string | null
  href: string | null
}

export function notificationDisplay(
  notification: ModelsNotification,
): NotificationDisplay {
  const data = notification.data ?? {}
  const title =
    pickStringFromNotificationData(data, 'title') ?? defaultTitle(notification)
  const body =
    pickStringFromNotificationData(data, 'preview') ??
    pickStringFromNotificationData(data, 'body') ??
    null

  switch (notification.type) {
    case 'session_reminder':
    case 'session_scheduled':
    case 'session_updated':
    case 'session_canceled':
      return {
        Icon: Calendar,
        accentBg: 'var(--green-pale)',
        accentFg: 'var(--green-brand)',
        kindLabel: 'Session',
        title,
        body,
        href: '/sessions',
      }
    case 'payment_due':
    case 'invoice_sent':
    case 'invoice_overdue':
    case 'payment_received':
      return {
        Icon: Receipt,
        accentBg: 'rgba(255, 200, 61, .18)',
        accentFg: 'var(--fire-3)',
        kindLabel: 'Billing',
        title,
        body,
        href: '/payments',
      }
    case 'check_in_reminder':
    case 'check_in_due':
      return {
        Icon: ClipboardCheck,
        accentBg: 'var(--green-pale)',
        accentFg: 'var(--green-brand)',
        kindLabel: 'Check-in',
        title,
        body,
        href: '/check-in',
      }
    case 'checkin.responded':
    case 'coach_reply':
    case 'coach_message':
      // Provided here only so callers that mix lists can still ask for the
      // display config without special-casing — but the inbox actually uses
      // MessageThread for these (richer treatment). Backend currently emits
      // `checkin.responded`; the other two strings are kept for forward
      // compat with future chat-style coach messages.
      return {
        Icon: MessageCircle,
        accentBg: 'var(--green-pale)',
        accentFg: 'var(--green-brand)',
        kindLabel: 'Coach',
        title,
        body,
        href: '/messages',
      }
    default:
      return {
        Icon: Bell,
        accentBg: 'var(--bg-surface-muted)',
        accentFg: 'var(--text-secondary)',
        kindLabel: 'Update',
        title,
        body,
        href: null,
      }
  }
}

function defaultTitle(notification: ModelsNotification): string {
  switch (notification.type) {
    case 'session_reminder':
      return 'Session reminder'
    case 'session_scheduled':
      return 'New session scheduled'
    case 'session_updated':
      return 'Session updated'
    case 'session_canceled':
      return 'Session canceled'
    case 'payment_due':
      return 'Payment due'
    case 'invoice_sent':
      return 'New invoice'
    case 'invoice_overdue':
      return 'Invoice overdue'
    case 'payment_received':
      return 'Payment received'
    case 'check_in_reminder':
    case 'check_in_due':
      return 'Time for your check-in'
    case 'checkin.responded':
    case 'coach_reply':
    case 'coach_message':
      return 'New reply from your coach'
    default:
      return 'New notification'
  }
}
