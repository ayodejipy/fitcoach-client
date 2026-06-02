import { Link } from '@tanstack/react-router'
import { formatDistanceToNowStrict, parseISO } from 'date-fns'

import { deriveCoachReplyPreview } from '@/features/notifications/utils/derive-coach-reply-preview'
import { deriveSubject } from '@/features/notifications/utils/derive-subject'
import { notificationDisplay } from '@/features/notifications/utils/notification-display'
import { isCoachReply } from '@/features/notifications/utils/notification-types'
import { pickStringFromNotificationData } from '@/features/notifications/utils/pick-notification-data'
import { initials } from '@/features/profile/utils/initials'
import type { ModelsNotification } from '@/lib/api/generated/types.gen'

/*
 * NotificationsDropdownItem — single row inside the bell dropdown.
 *
 * Switches on notification type:
 *   - coach-reply types (see `notification-types.ts`) → compact coach
 *     card with avatar + NEW pill + "Re: Check-in · week of MMM d"
 *     subject + line-clamp-2 italic Fraunces quote. Mini-version of the
 *     rich `MessageThread` card that lives on /messages.
 *   - everything else → row with a tinted icon + kind label + title +
 *     relative timestamp. Driven by `notification-display.ts` so adding
 *     a new type lights up its icon/route with one switch-case edit.
 *
 * Unread state: thin brand-green left accent bar + soft tint. Less
 * aggressive than the /messages MessageThread treatment because the
 * dropdown is a glance surface, not a reading surface.
 *
 * Each item links to the route from `notificationDisplay().href`. Coach
 * replies always link to /messages so users can open the full thread.
 * On click, the dropdown closes via `onNavigate`.
 */
interface Props {
  notification: ModelsNotification
  onNavigate?: () => void
}

export function NotificationsDropdownItem({ notification, onNavigate }: Props) {
  const isUnread = !notification.read_at
  const relativeTime = notification.created_at
    ? formatDistanceShort(notification.created_at)
    : null

  if (isCoachReply(notification.type)) {
    return (
      <CoachReplyItem
        notification={notification}
        isUnread={isUnread}
        relativeTime={relativeTime}
        onNavigate={onNavigate}
      />
    )
  }

  return (
    <SystemItem
      notification={notification}
      isUnread={isUnread}
      relativeTime={relativeTime}
      onNavigate={onNavigate}
    />
  )
}

interface ItemProps {
  notification: ModelsNotification
  isUnread: boolean
  relativeTime: string | null
  onNavigate?: () => void
}

function CoachReplyItem({
  notification,
  isUnread,
  relativeTime,
  onNavigate,
}: ItemProps) {
  const data = notification.data ?? {}
  const coachName =
    pickStringFromNotificationData(data, 'coach_name') ?? 'Your coach'
  const preview = deriveCoachReplyPreview(notification)
  const subject = deriveSubject(notification)

  const containerClasses = isUnread
    ? 'relative block overflow-hidden rounded-[12px] border px-3 py-3 pl-4 transition-colors hover:bg-[color:var(--cream)]'
    : 'block rounded-[12px] border bg-card px-3 py-3 transition-colors hover:bg-[color:var(--cream)]'
  const containerStyle = isUnread
    ? {
        background: 'var(--bg-unread)',
        borderColor: 'var(--green-soft)',
      }
    : { borderColor: 'var(--border-warm)' }

  return (
    <Link
      to="/messages"
      onClick={onNavigate}
      className={containerClasses}
      style={containerStyle}
    >
      {isUnread && (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ background: 'var(--green-brand)' }}
        />
      )}
      <div className="flex items-start gap-3">
        <div
          className={[
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold',
            isUnread ? 'ring-2' : 'ring-1',
          ].join(' ')}
          style={{
            background: 'var(--green-pale)',
            color: 'var(--green-brand)',
            ['--tw-ring-color' as string]: 'var(--green-soft)',
          }}
          aria-hidden
        >
          {initials(coachName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[12.5px] font-semibold text-foreground">
              {coachName}
            </span>
            {isUnread && (
              <span
                className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.1em] text-white"
                style={{ background: 'var(--green-brand)' }}
              >
                New
              </span>
            )}
          </div>
          {subject && (
            <div
              className={[
                'mt-0.5 text-[10.5px] font-bold uppercase tracking-[0.08em]',
                isUnread
                  ? 'text-[color:var(--green-brand)]'
                  : 'text-[color:var(--text-muted)]',
              ].join(' ')}
            >
              {subject}
            </div>
          )}
          <p
            className="mt-1 line-clamp-2 font-display text-[12.5px] italic leading-snug text-foreground"
            style={{ fontVariationSettings: "'opsz' 14, 'SOFT' 60" }}
          >
            "{preview}"
          </p>
        </div>
        {relativeTime && (
          <div className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-[color:var(--text-muted)]">
            {relativeTime}
          </div>
        )}
      </div>
    </Link>
  )
}

function SystemItem({
  notification,
  isUnread,
  relativeTime,
  onNavigate,
}: ItemProps) {
  const display = notificationDisplay(notification)
  const Icon = display.Icon

  const containerClasses = [
    'relative flex items-center gap-3 overflow-hidden rounded-[12px] border px-3 py-2.5 transition-colors',
    isUnread ? 'pl-4' : '',
    isUnread ? '' : 'bg-card',
    display.href ? 'hover:bg-[color:var(--cream)]' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const containerStyle = isUnread
    ? {
        background: 'rgba(232, 245, 238, .4)',
        borderColor: 'var(--green-soft)',
      }
    : { borderColor: 'var(--border-warm)' }

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
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ background: display.accentBg, color: display.accentFg }}
        aria-hidden
      >
        <Icon className="h-[15px] w-[15px]" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className="text-[9.5px] font-bold uppercase tracking-[0.1em]"
            style={{ color: display.accentFg }}
          >
            {display.kindLabel}
          </span>
          {isUnread && (
            <span
              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.1em] text-white"
              style={{ background: 'var(--green-brand)' }}
            >
              New
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-[13px] font-bold tracking-tight text-foreground">
          {display.title}
        </p>
      </div>
      {relativeTime && (
        <div className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-[color:var(--text-muted)]">
          {relativeTime}
        </div>
      )}
    </>
  )

  if (display.href) {
    return (
      <Link
        to={display.href}
        onClick={onNavigate}
        className={containerClasses}
        style={containerStyle}
      >
        {inner}
      </Link>
    )
  }

  return (
    <div className={containerClasses} style={containerStyle}>
      {inner}
    </div>
  )
}

/**
 * Short relative time ("2h", "1d", "Wed") — dropdown rows are tight on
 * horizontal space, so date-fns "ago" suffixes are stripped to a single
 * unit. For >7 days, use weekday short ("Wed"); for >1 year, fall back
 * to short date ("Jun 3").
 */
function formatDistanceShort(rfc3339: string): string {
  try {
    const date = parseISO(rfc3339)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = diffMs / 86_400_000

    if (diffDays < 7) {
      return formatDistanceToNowStrict(date)
        .replace(/\s+(minute|minutes)/, 'm')
        .replace(/\s+(hour|hours)/, 'h')
        .replace(/\s+(day|days)/, 'd')
        .replace(/\s+(second|seconds)/, 's')
    }
    if (diffDays < 365) {
      const weekdayShort = date.toLocaleDateString(undefined, {
        weekday: 'short',
      })
      return weekdayShort
    }
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}
