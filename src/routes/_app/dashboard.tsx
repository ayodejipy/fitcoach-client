import { createFileRoute } from '@tanstack/react-router'

import { DashboardGrid } from '@/components/layout/DashboardGrid'
import { PageShell } from '@/components/layout/PageShell'
import { CelebrationSheet } from '@/features/check-ins/components/CelebrationSheet'
import { StreakHero } from '@/features/check-ins/components/StreakHero'
import { useStreak } from '@/features/check-ins/hooks/useStreak'
import { GreetingHeader } from '@/features/dashboard/components/GreetingHeader'
import { ThisWeekAtAGlance } from '@/features/dashboard/components/ThisWeekAtAGlance'
import { ThisWeekCard } from '@/features/dashboard/components/ThisWeekCard'
import { firstWord } from '@/features/dashboard/utils/first-word'
import { useThisWeekStats } from '@/features/dashboard/hooks/useThisWeekStats'
import { RecentCoachReply } from '@/features/notifications/components/RecentCoachReply'
import { useLatestCoachReply } from '@/features/notifications/hooks/useLatestCoachReply'
import { useMe } from '@/features/profile/hooks/useMe'
import { NextSessionCard } from '@/features/sessions/components/NextSessionCard'
import { useNextSession } from '@/features/sessions/hooks/useNextSession'

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: me } = useMe()
  const streak = useStreak()
  const nextSession = useNextSession()
  const thisWeekStats = useThisWeekStats()
  const latestCoachReply = useLatestCoachReply()

  return (
    <PageShell size="wide">
      <div className="space-y-7 lg:space-y-9">
        <GreetingHeader
          firstName={me?.first_name}
          coachName={me?.coach_name}
          programWeek={me?.program_week}
          programTotal={me?.program_total}
        />

        <DashboardGrid
          hero={
            <StreakHero
              streak={streak}
              coachFirstName={firstWord(me?.coach_name)}
            />
          }
        >
          <ThisWeekCard
            submitted={streak.hasSubmittedThisWeek}
            programWeek={me?.program_week}
            coachName={me?.coach_name}
          />
          <NextSessionCard nextSession={nextSession} />
          <ThisWeekAtAGlance stats={thisWeekStats} />
          <RecentCoachReply result={latestCoachReply} />
        </DashboardGrid>

        {/*
         * Celebration sheet — renders ONLY when `useSubmitCheckIn` has pushed
         * a pending payload (right before navigating back here). Self-dismisses
         * after ~1.5s or on tap.
         */}
        <CelebrationSheet />
      </div>
    </PageShell>
  )
}
