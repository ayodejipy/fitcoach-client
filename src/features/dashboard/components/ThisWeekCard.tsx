import { Link } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

/*
 * ThisWeekCard — the "this week" CTA or submitted-state.
 *
 * Two states (driven by the `submitted` prop the dashboard passes from
 * `useStreak().hasSubmittedThisWeek`):
 *
 *   - !submitted: soft-mint gradient card with eyebrow "This week",
 *     "Due Sunday" pill, headline "Submit your Week N check-in",
 *     supporting line, brand-green CTA → /check-in.
 *
 *   - submitted: same surface but with a quiet "Check-in submitted"
 *     confirmation and the coach-review status (Decision 4A's calmer
 *     post-submit state, before the celebration animation lands).
 *
 * The week number shown is either the program week (from /me) or just
 * "this week" if the program info isn't loaded yet.
 */

interface Props {
  submitted: boolean
  programWeek: number | null | undefined
  coachName?: string | null | undefined
}

export function ThisWeekCard({ submitted, programWeek, coachName }: Props) {
  const weekLabel = programWeek ? `Week ${programWeek}` : 'this week'

  if (submitted) {
    return (
      <div
        className="rounded-[14px] border border-[color:var(--green-soft)] bg-gradient-to-b from-[color:var(--green-pale)] to-card p-5 shadow-[var(--shadow-card)]"
        role="status"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
            This week
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-[11.5px] font-semibold text-[color:var(--green-brand)] ring-1 ring-[color:var(--green-soft)]">
            <CheckCircle2 className="h-[14px] w-[14px]" strokeWidth={2.5} />
            Submitted
          </span>
        </div>
        <h3 className="text-[17px] font-bold tracking-tight text-foreground">
          {weekLabel} check-in is locked in
        </h3>
        <p className="mt-1 text-[13.5px] text-[color:var(--text-secondary)]">
          {coachName ? `${coachName} will reply within a day.` : 'Your coach will reply within a day.'}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[14px] border border-[color:var(--green-soft)] bg-gradient-to-b from-[color:var(--green-pale)] to-card p-5 shadow-[var(--shadow-card)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
          This week
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--green-pale)] px-2.5 py-1 text-[11.5px] font-semibold text-[color:var(--green-brand)] before:inline-block before:h-[6px] before:w-[6px] before:rounded-full before:bg-[color:var(--green-mid)] before:content-['']">
          Due Sunday
        </span>
      </div>
      <h3 className="text-[17px] font-bold tracking-tight text-foreground">
        Submit your {weekLabel} check-in
      </h3>
      <p className="mt-1 text-[13.5px] text-[color:var(--text-secondary)]">
        Weight, energy, mood, sleep, notes. Takes 90 seconds.
      </p>
      <Button
        asChild
        size="lg"
        className="mt-4 h-[50px] w-full text-[15px] shadow-[0_3px_14px_rgba(26,122,74,.32)]"
      >
        <Link to="/check-in">Start check-in →</Link>
      </Button>
    </div>
  )
}
