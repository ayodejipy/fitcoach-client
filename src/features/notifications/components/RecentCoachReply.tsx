import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { formatDistanceToNowStrict, parseISO } from 'date-fns'

import type { UseLatestCoachReplyResult } from '@/features/notifications/hooks/useLatestCoachReply'
import { pickStringFromNotificationData } from '@/features/notifications/utils/pick-notification-data'
import { initials } from '@/features/profile/utils/initials'

/*
 * RecentCoachReply — dashboard preview card showing the latest coach reply.
 *
 * Renders only when there's a reply to show. Hidden entirely when there are
 * no coach replies yet — first-week users see fewer cards, which is correct
 * (cards earn their existence; an empty "no replies" card on the dashboard
 * would be noise).
 *
 * The full reply lives at /messages; this card is a preview pull.
 */
interface Props {
  result: UseLatestCoachReplyResult
}

export function RecentCoachReply({ result }: Props) {
  if (result.isLoading || !result.reply) return null

  const { reply } = result
  const coachName =
    pickStringFromNotificationData(reply.data, 'coach_name') ?? 'Your coach'
  const preview =
    pickStringFromNotificationData(reply.data, 'preview') ??
    'Read your latest reply in messages.'
  const avatarInitials = initials(coachName)
  const relativeTime = reply.created_at
    ? `${formatDistanceToNowStrict(parseISO(reply.created_at))} ago`
    : null

  return (
    <section className="relative overflow-hidden rounded-[22px] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px] bg-[color:var(--green-brand)]"
      />
      <div className="flex items-baseline justify-between">
        <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
          Latest reply
        </div>
        {relativeTime && (
          <span className="text-[10.5px] tracking-wider uppercase text-[color:var(--text-muted)]/70">
            {relativeTime}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--green-pale)] text-[12px] font-bold text-[color:var(--green-brand)] ring-1 ring-[color:var(--green-soft)]">
          {avatarInitials}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-foreground">
            {coachName}
          </div>
          <p
            className="mt-1 font-display text-[14.5px] italic leading-[1.45] text-[color:var(--text-secondary)] line-clamp-3"
            style={{ fontVariationSettings: "'opsz' 14, 'SOFT' 60" }}
          >
            "{preview}"
          </p>
          <Link
            to="/messages"
            className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[color:var(--green-brand)] hover:underline"
          >
            Read full reply
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  )
}
