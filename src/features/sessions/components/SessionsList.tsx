import { CompletedSessionRow } from '@/features/sessions/components/CompletedSessionRow'
import { UpcomingSessionRow } from '@/features/sessions/components/UpcomingSessionRow'
import type { ModelsSession } from '@/lib/api/generated/types.gen'

/*
 * SessionsList — composes the "Coming up" + "Completed" sections under the
 * featured next-session hero on /sessions.
 *
 * Inputs are pre-categorized + pre-sliced by the route:
 *   - `upcomingRest`: every upcoming session AFTER the one featured in the
 *     hero. (Featured session lives in FeaturedNextSessionHero, not here.)
 *   - `past`: every past session, most-recent-first.
 *
 * Hides a section when its array is empty so the page doesn't show empty
 * headings. The route handles the "no sessions at all" case with a top-level
 * EmptyState card.
 *
 * Each section gets a Fraunces section heading + a count subline (parallel
 * to how PaymentsList sections are framed).
 */
interface Props {
  upcomingRest: ModelsSession[]
  past: ModelsSession[]
  totalCoachedHours: number
}

export function SessionsList({ upcomingRest, past, totalCoachedHours }: Props) {
  return (
    <div className="space-y-10">
      {upcomingRest.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2
              className="font-display text-[22px] lg:text-[24px] font-normal leading-tight tracking-tight text-foreground"
              style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 60" }}
            >
              Coming up
            </h2>
            <span className="text-[12.5px] font-medium text-[color:var(--text-secondary)]">
              {upcomingRest.length} more scheduled
            </span>
          </div>
          <ul className="space-y-3">
            {upcomingRest.map((session) => (
              <UpcomingSessionRow
                key={session.id ?? session.starts_at}
                session={session}
              />
            ))}
          </ul>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2
              className="font-display text-[22px] lg:text-[24px] font-normal leading-tight tracking-tight text-foreground"
              style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 60" }}
            >
              Completed
            </h2>
            <span className="text-[12.5px] font-medium text-[color:var(--text-secondary)]">
              {past.length} {past.length === 1 ? 'session' : 'sessions'} ·{' '}
              {formatHours(totalCoachedHours)} of coaching
            </span>
          </div>
          <ul className="space-y-2">
            {past.map((session) => (
              <CompletedSessionRow
                key={session.id ?? session.starts_at}
                session={session}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function formatHours(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes} min`
  }
  if (Number.isInteger(hours)) return `${hours}h`
  return `${hours.toFixed(1)}h`
}
