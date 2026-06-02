import { Link } from '@tanstack/react-router'
import { formatDistanceToNowStrict, parseISO } from 'date-fns'

import { notificationDisplay } from '@/features/notifications/utils/notification-display'
import type { ModelsNotification } from '@/lib/api/generated/types.gen'

/*
 * SystemNotificationRow — quieter row for non-coach notifications
 * (session reminders, billing alerts, check-in reminders, etc.).
 *
 * Visual treatment:
 *   - Plain white card by default; unread state adds a thin brand-green
 *     left accent bar + a soft tint (less aggressive than the coach-reply
 *     MessageThread treatment — these are supporting context, not the
 *     primary conversation).
 *   - Type-aware icon in a tinted circle on the left (Calendar for
 *     sessions, Receipt for billing, ClipboardCheck for check-ins, Bell
 *     for everything else).
 *   - When `notificationDisplay()` returns an `href`, the whole row is a
 *     Link to that route; otherwise it renders as a plain card.
 *
 * All type → icon/href mapping lives in `notification-display.ts` so new
 * notification types light up correctly with one switch-case addition.
 */
interface Props {
  notification: ModelsNotification
}

export function SystemNotificationRow({ notification }: Props) {
  const isUnread = !notification.read_at
  const display = notificationDisplay(notification)
  const relativeTime = notification.created_at
    ? `${formatDistanceToNowStrict(parseISO(notification.created_at))} ago`
    : null

  const containerClasses = [
    'relative flex items-center gap-4 overflow-hidden rounded-[14px] border px-4 py-3.5 transition-colors',
    isUnread
      ? 'border-[color:var(--green-soft)] bg-[color:var(--green-pale)]/40'
      : 'border-[color:var(--border-warm)] bg-card',
    display.href ? 'hover:bg-[color:var(--cream)]' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const inner = (
    <>
      {isUnread && (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ background: 'var(--green-brand)' }}
        />
      )}

      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ background: display.accentBg, color: display.accentFg }}
        aria-hidden
      >
        <display.Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="text-[10.5px] font-bold uppercase tracking-[0.1em]"
            style={{ color: display.accentFg }}
          >
            {display.kindLabel}
          </span>
          {isUnread && (
            <span
              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.12em] text-white"
              style={{ background: 'var(--green-brand)' }}
            >
              New
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-[14px] font-bold tracking-tight text-foreground">
          {display.title}
        </p>
        {display.body && (
          <p className="mt-0.5 truncate text-[12.5px] text-[color:var(--text-secondary)]">
            {display.body}
          </p>
        )}
      </div>

      {relativeTime && (
        <div className="shrink-0 text-right text-[11.5px] font-medium uppercase tracking-wider text-[color:var(--text-muted)]">
          {relativeTime}
        </div>
      )}
    </>
  )

  if (display.href) {
    return (
      <Link to={display.href} className={containerClasses}>
        {inner}
      </Link>
    )
  }

  return <div className={containerClasses}>{inner}</div>
}
