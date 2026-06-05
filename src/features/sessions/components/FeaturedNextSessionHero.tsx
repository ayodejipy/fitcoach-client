import { format, parseISO } from 'date-fns'
import { Check, Video } from 'lucide-react'

import { useConfirmSession } from '@/features/sessions/hooks/useConfirmSession'
import { sessionCountdown } from '@/features/sessions/utils/session-countdown'
import { sessionTimeRange } from '@/features/sessions/utils/format-session'
import type { ModelsSession } from '@/lib/api/generated/types.gen'

/*
 * FeaturedNextSessionHero — the upcoming next session, shown at the top
 * of /sessions in the brand-surface "moment" treatment (deep forest +
 * radial glow + Fraunces).
 *
 * Layout — 3 columns at desktop, stacked at mobile:
 *   [Big date block] | [Title + countdown + meta] | [Join CTA]
 *
 * Renders nothing if `session.starts_at` is missing (can't be shown on a
 * timeline). Caller is expected to skip rendering in that case — the route
 * already filters `upcoming[0]` via `categorizeSessions` which drops
 * dateless sessions.
 *
 * The `Join` CTA falls back to a disabled-looking state when no `zoom_link`
 * is on the session — keeps the visual rhythm without misleading the user.
 */
interface Props {
  session: ModelsSession
  coachName?: string | null
}

export function FeaturedNextSessionHero({ session, coachName }: Props) {
  const confirm = useConfirmSession()

  if (!session.starts_at) return null

  const date = parseISO(session.starts_at)
  const monthShort = format(date, 'MMM').toUpperCase()
  const dayNum = format(date, 'd')
  const weekdayShort = format(date, 'EEE').toUpperCase()
  const timeRange = sessionTimeRange(session.starts_at, session.duration_mins)
  const countdown = sessionCountdown(session.starts_at)
  const title =
    session.title?.trim() || (session.session_type ?? 'Coaching session')

  const subline = [timeRange, coachName ? `with ${coachName}` : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <article
      className="relative overflow-hidden rounded-[20px] p-7 text-white shadow-[var(--shadow-card)] lg:p-10"
      style={{
        background:
          'linear-gradient(180deg, var(--green-deep) 0%, #133E26 100%)',
      }}
    >
      <div
        className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(255,200,61,.22) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="relative grid grid-cols-1 items-center gap-6 lg:grid-cols-[auto_1fr_auto] lg:gap-8">
        {/* Date block */}
        <div className="text-center lg:pr-2">
          <div className="text-[12px] font-bold uppercase tracking-[0.14em] opacity-70">
            {monthShort}
          </div>
          <div
            className="mt-1 font-display text-[64px] leading-none tabular-nums lg:text-[80px]"
            style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 60" }}
          >
            {dayNum}
          </div>
          <div className="mt-1 text-[12px] font-medium uppercase tracking-[0.14em] opacity-80">
            {weekdayShort}
          </div>
        </div>

        {/* Details */}
        <div className="min-w-0 border-t border-white/15 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          {countdown && (
            <div
              className={[
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em]',
                countdown.urgent
                  ? 'bg-[color:var(--fire-1)] text-[color:var(--green-deep)]'
                  : 'bg-white/15 text-white ring-1 ring-white/20',
              ].join(' ')}
            >
              <span
                className={[
                  'h-1.5 w-1.5 rounded-full',
                  countdown.urgent
                    ? 'bg-[color:var(--green-deep)]'
                    : 'bg-white',
                ].join(' ')}
                aria-hidden
              />
              {countdown.label}
            </div>
          )}
          <h2
            className="mt-3 font-display text-[26px] lg:text-[30px] font-normal leading-tight tracking-tight"
            style={{ fontVariationSettings: "'opsz' 84, 'SOFT' 60" }}
          >
            {title}
          </h2>
          {subline && (
            <p className="mt-2 text-[14px] opacity-85">{subline}</p>
          )}
        </div>

        {/* CTA: Confirm-first when the client hasn't accepted yet,
            then Join Zoom (if linked), then a placeholder. */}
        {!session.confirmed && session.id ? (
          <button
            type="button"
            disabled={confirm.isPending}
            aria-label="Confirm this session"
            onClick={() => confirm.mutate({ path: { id: session.id! }, body: { confirmed: true } })}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[14px] font-bold text-[color:var(--green-deep)] shadow-lg transition-transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-70 lg:w-auto"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
            {confirm.isPending ? 'Confirming…' : 'Confirm session'}
          </button>
        ) : session.zoom_link ? (
          <a
            href={session.zoom_link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[14px] font-bold text-[color:var(--green-deep)] shadow-lg transition-transform hover:scale-[1.02] lg:w-auto"
          >
            <Video className="h-4 w-4" strokeWidth={2.5} />
            Join on Zoom
          </a>
        ) : (
          <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/10 px-6 py-3.5 text-[13px] font-medium text-white/80 ring-1 ring-white/20 lg:w-auto">
            <Check className="h-3.5 w-3.5 opacity-75" strokeWidth={2.5} aria-hidden />
            Confirmed · link coming soon
          </div>
        )}
      </div>
    </article>
  )
}
