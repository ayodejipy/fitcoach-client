import { Bell } from 'lucide-react'

/*
 * GreetingHeader — top of dashboard.
 *
 * Time-of-day greeting + coach mini-profile + (placeholder) notifications bell.
 * Reads ONLY what it renders — props are first_name, coach_name, program_week,
 * program_total. The dashboard route passes these from `useMe()`.
 *
 * The greeting is intentionally time-of-day (not just "Welcome, X") because
 * coaches notice when an app feels like it's talking to them, not at them.
 *
 * Notifications bell is rendered as a placeholder dot for now; the actual
 * unread-count wiring lands with Task T8 (websocket nudge) — once the WS
 * hook exists, the dot reflects real `portal/notifications/unread-count`.
 */

interface Props {
  firstName: string | null | undefined
  coachName: string | null | undefined
  programWeek: number | null | undefined
  programTotal: number | null | undefined
  /** True if there's something unread — shows the red dot on the bell. */
  hasUnread?: boolean
}

function timeOfDayGreeting(d: Date = new Date()): string {
  const h = d.getHours()
  if (h < 5) return 'Late night'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Quiet night'
}

function initials(name: string | null | undefined): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase()
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

  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-foreground">
          {greeting}
          {firstName ? `, ${firstName}.` : '.'}
        </h1>
        {(coachName || programLine) && (
          <div className="mt-1 flex items-center gap-2 text-[13px] text-[color:var(--text-secondary)]">
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
