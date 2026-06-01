import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { PageShell } from '@/components/layout/PageShell'
import { CheckInForm } from '@/features/check-ins/components/CheckInForm'
import { useStreak } from '@/features/check-ins/hooks/useStreak'
import { useMe } from '@/features/profile/hooks/useMe'

export const Route = createFileRoute('/_app/check-in')({
  component: CheckInPage,
})

function CheckInPage() {
  const streak = useStreak()
  const { data: me } = useMe()

  if (streak.isLoading) {
    return (
      <PageShell size="narrow">
        <div className="space-y-4">
          <BackLink />
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-72 animate-pulse rounded-[14px] bg-muted" />
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell size="narrow">
      <div className="space-y-4">
        <BackLink />
        <CheckInForm
          thisMonday={streak.thisMonday}
          programWeek={me?.program_week}
        />
      </div>
    </PageShell>
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
