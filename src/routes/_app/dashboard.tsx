import { createFileRoute } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { StreakHero } from '@/features/check-ins/components/StreakHero'
import { useStreak } from '@/features/check-ins/hooks/useStreak'
import { GreetingHeader } from '@/features/dashboard/components/GreetingHeader'
import { ThisWeekCard } from '@/features/dashboard/components/ThisWeekCard'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { useMe } from '@/features/profile/hooks/useMe'

/*
 * `/dashboard` — the hub.
 *
 * Priority order (locked by /plan-design-review Decision 1A):
 *   1. Greeting + coach mini
 *   2. STREAK HERO with fire-tier escalation
 *   3. "This week" check-in CTA OR submitted-state
 *   4. (Today's session — Task T5 polish or T10)
 *   5. (Latest unread coach reply — Task T8 with WS nudge)
 *   6. Bottom nav / sidebar (Task T10)
 *
 * Composition pattern: feature hooks (`useMe`, `useStreak`) supply data;
 * presentational components render it. No async logic in this file (locked
 * by MEMORY feedback_async_in_hooks).
 *
 * The sign-out button is a placeholder while the real nav lands in T10.
 */
export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: me } = useMe()
  const streak = useStreak()
  const logout = useLogout()

  return (
    <div className="space-y-5">
      <GreetingHeader
        firstName={me?.first_name}
        coachName={me?.coach_name}
        programWeek={me?.program_week}
        programTotal={me?.program_total}
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

      {/* Sign-out placeholder — replaced by real nav in T10. */}
      <div className="pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void logout()}
          className="text-[color:var(--text-muted)]"
        >
          Sign out
        </Button>
      </div>
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
