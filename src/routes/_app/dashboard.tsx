import { createFileRoute } from '@tanstack/react-router'

import { CelebrationSheet } from '@/features/check-ins/components/CelebrationSheet'
import { StreakHero } from '@/features/check-ins/components/StreakHero'
import { useStreak } from '@/features/check-ins/hooks/useStreak'
import { GreetingHeader } from '@/features/dashboard/components/GreetingHeader'
import { ThisWeekCard } from '@/features/dashboard/components/ThisWeekCard'
import { useUnreadCount } from '@/features/notifications/hooks/useUnreadCount'
import { useMe } from '@/features/profile/hooks/useMe'

/*
 * `/dashboard` — the hub.
 *
 * Priority order (locked by /plan-design-review Decision 1A):
 *   1. Greeting + coach mini
 *   2. STREAK HERO with fire-tier escalation
 *   3. "This week" check-in CTA OR submitted-state
 *   4. (Today's session — future task)
 *   5. (Latest unread coach reply — Task T8 with WS nudge)
 *
 * Composition pattern: feature hooks (`useMe`, `useStreak`) supply data;
 * presentational components render it. No async logic in this file (locked
 * by MEMORY feedback_async_in_hooks).
 *
 * Nav (bottom on mobile, sidebar on desktop) is wired by the `_app` layout —
 * the dashboard route stays focused on the hub's content.
 */
export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: me } = useMe()
  const streak = useStreak()
  const { count: unread } = useUnreadCount()

  return (
    <div className="space-y-5">
      <GreetingHeader
        firstName={me?.first_name}
        coachName={me?.coach_name}
        programWeek={me?.program_week}
        programTotal={me?.program_total}
        hasUnread={unread > 0}
      />

      <StreakHero
        streak={streak}
        coachFirstName={firstWord(me?.coach_name)}
      />

      <ThisWeekCard
        submitted={streak.hasSubmittedThisWeek}
        programWeek={me?.program_week}
        coachName={me?.coach_name}
      />

      {/*
       * Celebration sheet — renders ONLY when `useSubmitCheckIn` has pushed
       * a pending payload (right before navigating back here). Self-dismisses
       * after ~1.5s or on tap.
       */}
      <CelebrationSheet />
    </div>
  )
}

/** "Marcus Holloway" → "Marcus". Used for the coach reviewing copy. */
function firstWord(name: string | null | undefined): string | null {
  if (!name) return null
  const trimmed = name.trim()
  if (!trimmed) return null
  return trimmed.split(/\s+/)[0] ?? null
}
