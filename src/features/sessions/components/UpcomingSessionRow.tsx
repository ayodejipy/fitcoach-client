import { format, parseISO } from 'date-fns'
import { Check, Video } from 'lucide-react'

import { SessionDateBlock } from '@/features/sessions/components/SessionDateBlock'
import { useConfirmSession } from '@/features/sessions/hooks/useConfirmSession'
import { sessionTimeRange } from '@/features/sessions/utils/format-session'
import type { ModelsSession } from '@/lib/api/generated/types.gen'

/*
 * UpcomingSessionRow — one upcoming session row on the /sessions page.
 *
 * Visual: brand-pale tinted card, date thumbnail on the left, title +
 * weekday/time on the right, optional Join button. Padding generous (px-5
 * py-4) so the row reads as a touch-target on mobile + a card on desktop.
 *
 * Used for every upcoming session AFTER the featured next one (which
 * renders via FeaturedNextSessionHero with bigger treatment).
 */
interface Props {
  session: ModelsSession
}

export function UpcomingSessionRow({ session }: Props) {
  const confirm = useConfirmSession()

  if (!session.starts_at) return null

  const weekday = format(parseISO(session.starts_at), 'EEE')
  const timeRange = sessionTimeRange(session.starts_at, session.duration_mins)
  const title =
    session.title?.trim() || (session.session_type ?? 'Coaching session')

  return (
    <li className="flex items-center justify-between gap-4 rounded-[16px] border border-[color:var(--green-soft)] bg-[color:var(--green-pale)] px-5 py-4">
      <div className="flex min-w-0 items-center gap-4 lg:gap-5">
        <SessionDateBlock startsAt={session.starts_at} size="md" />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold tracking-tight text-foreground">
            {title}
          </p>
          <p className="mt-0.5 text-[12.5px] text-[color:var(--text-secondary)]">
            {weekday} · {timeRange}
          </p>
        </div>
      </div>

      {!session.confirmed && session.id ? (
        <button
          type="button"
          disabled={confirm.isPending}
          aria-label={`Confirm session on ${weekday}`}
          onClick={() => confirm.mutate({ path: { id: session.id! }, body: { confirmed: true } })}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[color:var(--green-brand)] bg-white px-3.5 py-1.5 text-[12.5px] font-bold text-[color:var(--green-brand)] transition-colors hover:bg-[color:var(--green-soft)] disabled:opacity-70"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          {confirm.isPending ? 'Confirming…' : 'Confirm'}
        </button>
      ) : session.zoom_link ? (
        <a
          href={session.zoom_link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[color:var(--green-brand)] px-4 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-[color:var(--green-hover)]"
        >
          <Video className="h-3.5 w-3.5" strokeWidth={2.5} />
          Join
        </a>
      ) : session.confirmed ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11.5px] font-semibold text-[color:var(--green-brand)] ring-1 ring-[color:var(--green-soft)]">
          <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
          Confirmed
        </span>
      ) : null}
    </li>
  )
}
