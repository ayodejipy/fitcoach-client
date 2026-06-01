import { format } from 'date-fns'
import { Bell } from 'lucide-react'

import { initials } from '@/features/profile/utils/initials'


interface Props {
  firstName: string | null | undefined
  coachName: string | null | undefined
  programWeek: number | null | undefined
  programTotal: number | null | undefined
  /** True if there's something unread — shows the red dot on the bell. */
  hasUnread?: boolean
}

function timeOfDayGreeting(date: Date = new Date()): string {
  const hour = date.getHours()
  if (hour < 5) return 'Late night'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

export function GreetingHeader({
  firstName,
  coachName,
  programWeek,
  programTotal,
  hasUnread = false,
}: Props) {
  const greeting = timeOfDayGreeting()
  const programLine =
    programWeek && programTotal
      ? `Week ${programWeek} of ${programTotal}`
      : null
  const todayEyebrow = format(new Date(), 'EEE · MMM d').toUpperCase()

  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
          {todayEyebrow}
        </div>
        <h1
          className="mt-2 font-display text-[34px] lg:text-[38px] font-light leading-[1.05] tracking-[-0.015em] text-foreground"
          style={{ fontVariationSettings: "'opsz' 100, 'SOFT' 40" }}
        >
          {greeting}
          {firstName ? (
            <>
              ,{' '}
              <em
                className="not-italic"
                style={{
                  fontVariationSettings: "'opsz' 108, 'SOFT' 80",
                  fontWeight: 400,
                }}
              >
                {firstName}.
              </em>
            </>
          ) : (
            '.'
          )}
        </h1>
        {(coachName || programLine) && (
          <div className="mt-2 flex items-center gap-2 text-[13px] text-[color:var(--text-secondary)]">
            {coachName && (
              <>
                <span
                  className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[color:var(--green-pale)] text-[11px] font-bold text-[color:var(--green-brand)] ring-1 ring-[color:var(--green-soft)]"
                  aria-hidden
                >
                  {initials(coachName)}
                </span>
                <span>with {coachName}</span>
              </>
            )}
            {coachName && programLine && <span aria-hidden>·</span>}
            {programLine && <span>{programLine}</span>}
          </div>
        )}
      </div>

      <button
        type="button"
        aria-label={
          hasUnread ? 'Notifications, new replies waiting' : 'Notifications'
        }
        className="relative flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-border bg-card text-[color:var(--text-secondary)] transition-colors hover:bg-muted"
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
        {hasUnread && (
          <span
            aria-hidden
            className="absolute top-2 right-[9px] block h-[9px] w-[9px] rounded-full border-2 border-card bg-[color:var(--red)]"
          />
        )}
      </button>
    </header>
  )
}
