import { Link } from '@tanstack/react-router'
import { Calendar, Check, Video } from 'lucide-react'

import { BrandSurface } from '@/components/ui/BrandSurface'
import { Button } from '@/components/ui/button'
import { useConfirmSession } from '@/features/sessions/hooks/useConfirmSession'
import {
  sessionDateLabel,
  sessionTimeRange,
} from '@/features/sessions/utils/format-session'
import { sessionCountdown } from '@/features/sessions/utils/session-countdown'
import type { UseNextSessionResult } from '@/features/sessions/hooks/useNextSession'

/*
 * NextSessionCard — one of the 2×2 dashboard secondary cards.
 *
 * Wraps `BrandSurface` with `tone="mint"` so it reads as a branded moment
 * inside the otherwise-neutral grid. Adds an orange urgency chip
 * ("in 2 hours" / "in 1 day") when the session is within 48 hours.
 *
 * Three states:
 *   - loading: subtle skeleton bar.
 *   - has session: card with title, date label ("Today" / "Tomorrow" / weekday),
 *     time range, optional countdown chip, and a Join button if `zoom_link`
 *     is present.
 *   - no upcoming: quiet empty-state line, "See all sessions" link.
 *
 * The card is presentational. `useNextSession()` does the data work in the
 * dashboard route; the card just renders the result.
 */
interface Props {
  nextSession: UseNextSessionResult
}

export function NextSessionCard({ nextSession }: Props) {
  const confirm = useConfirmSession()

  if (nextSession.isLoading) {
    return (
      <div className="h-[112px] animate-pulse rounded-[22px] bg-muted" />
    )
  }

  if (!nextSession.session) {
    return (
      <div className="flex items-center justify-between rounded-[22px] border border-border bg-card px-5 py-4 text-[13px] text-[color:var(--text-secondary)]">
        <div className="flex items-center gap-2">
          <Calendar
            className="h-4 w-4 text-[color:var(--text-muted)]"
            strokeWidth={2}
          />
          <span>No upcoming session.</span>
        </div>
        <Link
          to="/sessions"
          className="text-[13px] font-semibold text-[color:var(--green-brand)] hover:underline"
        >
          See all
        </Link>
      </div>
    )
  }

  const session = nextSession.session
  const dateLabel = session.starts_at
    ? sessionDateLabel(session.starts_at)
    : 'Soon'
  const timeRange = session.starts_at
    ? sessionTimeRange(session.starts_at, session.duration_mins)
    : null
  const title =
    session.title?.trim() || (session.session_type ?? 'Coaching session')
  const countdown = session.starts_at
    ? sessionCountdown(session.starts_at)
    : null

  return (
    <BrandSurface tone="mint" padding="md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[color:var(--green-brand)]">
              Next session
            </div>
            {countdown && (
              <span
                className="rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.06em]"
                style={{
                  background: countdown.urgent
                    ? 'var(--fire-2)'
                    : 'var(--green-soft)',
                  color: 'var(--green-deep)',
                }}
              >
                {countdown.label}
              </span>
            )}
          </div>
          <h3
            className="mt-2 font-display text-[20px] lg:text-[22px] leading-[1.2] tracking-[-0.01em] text-foreground"
            style={{ fontVariationSettings: "'opsz' 24, 'SOFT' 50" }}
          >
            {title}
          </h3>
          <p className="mt-1.5 text-[13.5px] text-[color:var(--text-secondary)]">
            {dateLabel}
            {timeRange && <> · {timeRange}</>}
          </p>
        </div>

        {!session.confirmed && session.id ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={confirm.isPending}
            aria-label="Confirm this session"
            onClick={() => confirm.mutate({ path: { id: session.id! }, body: { confirmed: true } })}
            className="shrink-0"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            {confirm.isPending ? 'Confirming…' : 'Confirm'}
          </Button>
        ) : session.zoom_link ? (
          <Button asChild size="sm" className="shrink-0">
            <a href={session.zoom_link} target="_blank" rel="noreferrer">
              <Video className="h-4 w-4" strokeWidth={2} />
              Join
            </a>
          </Button>
        ) : null}
      </div>
    </BrandSurface>
  )
}
