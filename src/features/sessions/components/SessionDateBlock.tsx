import { format, parseISO } from 'date-fns'

/*
 * SessionDateBlock — the small date thumbnail used on UpcomingSessionRow
 * and CompletedSessionRow. Stacks MMM (uppercase, small) over the day
 * number (Fraunces tabular-nums).
 *
 * Two sizes (`md` for upcoming, `sm` for completed) — sm is a touch more
 * compact + softer-toned because past sessions read as supporting context.
 *
 * Pure presentation. Caller passes the raw `starts_at` string.
 */
interface Props {
  startsAt: string
  size?: 'md' | 'sm'
}

export function SessionDateBlock({ startsAt, size = 'md' }: Props) {
  const date = parseISO(startsAt)
  const month = format(date, 'MMM').toUpperCase()
  const day = format(date, 'd')

  if (size === 'sm') {
    return (
      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[10px] bg-[color:var(--bg-surface-muted)]">
        <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-[color:var(--text-muted)]">
          {month}
        </div>
        <div
          className="font-display text-[16px] leading-none tabular-nums text-foreground"
          style={{ fontVariationSettings: "'opsz' 60, 'SOFT' 20" }}
        >
          {day}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-[12px] bg-card shadow-[var(--shadow-card)]">
      <div className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-[color:var(--text-muted)]">
        {month}
      </div>
      <div
        className="font-display text-[22px] leading-none tabular-nums text-[color:var(--green-deep)]"
        style={{ fontVariationSettings: "'opsz' 60, 'SOFT' 20" }}
      >
        {day}
      </div>
    </div>
  )
}
