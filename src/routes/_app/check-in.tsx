import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { CheckInForm } from '@/features/check-ins/components/CheckInForm'
import { useStreak } from '@/features/check-ins/hooks/useStreak'
import { useMe } from '@/features/profile/hooks/useMe'

/*
 * `/check-in` — the weekly habit-loop action.
 *
 * The route is gated by `_app`'s beforeLoad (must be authenticated). It pulls
 * the current week's Monday from `useStreak()` (single source of truth for
 * "what week are we in") and program metadata from `useMe()` for the label.
 *
 * Form lives in the feature folder; this route is the thin shell + nav.
 */
export const Route = createFileRoute('/_app/check-in')({
  component: CheckInPage,
})

function CheckInPage() {
  const streak = useStreak()
  const { data: me } = useMe()

  // Loading guard — the form needs the Monday to submit; show a quick skeleton
  // while the streak query is in flight. If somehow the query failed and we
  // can't get the Monday, fall back to client-side compute (defensive — the
  // streak util always returns a thisMonday, even on empty input).
  if (streak.isLoading) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-72 animate-pulse rounded-[14px] bg-muted" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <BackLink />
      <CheckInForm
        thisMonday={streak.thisMonday}
        programWeek={me?.program_week}
      />
    </div>
  )
}

function BackLink() {
  return (
    <Link
      to="/dashboard"
      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[color:var(--text-secondary)] hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={2} />
      Back to dashboard
    </Link>
  )
}
