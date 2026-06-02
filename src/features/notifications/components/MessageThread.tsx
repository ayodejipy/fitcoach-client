import { format, formatDistanceToNowStrict, parseISO } from 'date-fns'

import { deriveCoachReplyPreview } from '@/features/notifications/utils/derive-coach-reply-preview'
import { deriveSubject } from '@/features/notifications/utils/derive-subject'
import { pickStringFromNotificationData } from '@/features/notifications/utils/pick-notification-data'
import { initials } from '@/features/profile/utils/initials'
import type { ModelsNotification } from '@/lib/api/generated/types.gen'


interface Props {
  notification: ModelsNotification
}

export function MessageThread({ notification }: Props) {
  const isUnread = !notification.read_at
  const data = notification.data ?? {}
  const coachName =
    pickStringFromNotificationData(data, 'coach_name') ?? 'Your coach'
  const coachRole =
    pickStringFromNotificationData(data, 'coach_role') ?? 'Senior coach'
  const preview = deriveCoachReplyPreview(notification)
  const subject = deriveSubject(notification)

  const relativeCreated = notification.created_at
    ? `${formatDistanceToNowStrict(parseISO(notification.created_at))} ago`
    : null
  const absoluteCreated = notification.created_at
    ? format(parseISO(notification.created_at), 'EEE, MMM d · h:mm a')
    : null
  const relativeRead = notification.read_at
    ? `Read ${formatDistanceToNowStrict(parseISO(notification.read_at))} ago`
    : null

  const containerClasses = isUnread
    ? 'relative overflow-hidden rounded-[16px] border border-[color:var(--green-soft)] bg-[color:var(--bg-unread)] shadow-[0_4px_20px_rgba(26,122,74,.12)]'
    : 'rounded-[16px] border border-border bg-card shadow-[var(--shadow-card)]'

  return (
    <article className={containerClasses}>
      {isUnread && (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px] bg-[color:var(--green-brand)]"
        />
      )}
      <div className={isUnread ? 'p-5 pl-7 lg:p-6 lg:pl-8' : 'p-5 lg:p-6'}>
        {/* Header row: avatar + name + role + timestamp */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--green-pale)] text-[13px] font-bold text-[color:var(--green-brand)] ' +
                (isUnread
                  ? 'ring-2 ring-[color:var(--green-soft)]'
                  : 'ring-1 ring-[color:var(--green-soft)]')
              }
            >
              {initials(coachName)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-foreground">
                  {coachName}
                </span>
                {isUnread && (
                  <span className="inline-flex items-center rounded-full bg-[color:var(--green-brand)] px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.12em] text-white">
                    New
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-[11.5px] tracking-[0.04em] text-[color:var(--text-muted)]">
                {coachRole}
              </div>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[11.5px] font-medium uppercase tracking-wider text-[color:var(--text-muted)]">
              {isUnread ? relativeCreated : absoluteCreated}
            </div>
            {(isUnread ? absoluteCreated : relativeRead) && (
              <div className="mt-0.5 text-[10.5px] text-[color:var(--text-muted)]/70">
                {isUnread ? absoluteCreated : relativeRead}
              </div>
            )}
          </div>
        </div>

        {/* Subject line */}
        {subject && (
          <div
            className={
              'mt-4 text-[12.5px] font-bold uppercase tracking-[0.08em] ' +
              (isUnread
                ? 'text-[color:var(--green-brand)]'
                : 'text-[color:var(--text-muted)]')
            }
          >
            {subject}
          </div>
        )}

        {/* Quote */}
        <p
          className={
            'mt-2 font-display italic leading-[1.5] text-[color:var(--text-secondary)] ' +
            (isUnread ? 'text-[16px] text-foreground' : 'text-[15.5px]')
          }
          style={{ fontVariationSettings: "'opsz' 18, 'SOFT' 60" }}
        >
          "{preview}"
        </p>
      </div>
    </article>
  )
}
