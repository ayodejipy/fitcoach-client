import { useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Calendar } from 'lucide-react'

import { PageShell } from '@/components/layout/PageShell'
import { EmptyState } from '@/features/progress/components/EmptyState'
import { FeaturedNextSessionHero } from '@/features/sessions/components/FeaturedNextSessionHero'
import { SessionsList } from '@/features/sessions/components/SessionsList'
import { SessionsSkeleton } from '@/features/sessions/components/SessionsSkeleton'
import { useSessions } from '@/features/sessions/hooks/useSessions'
import { categorizeSessions } from '@/features/sessions/utils/categorize-sessions'
import { useMe } from '@/features/profile/hooks/useMe'

export const Route = createFileRoute('/_app/sessions')({
  component: SessionsPage,
})

function SessionsPage() {
  const query = useSessions()
  const { data: me } = useMe()
  const categorized = useMemo(
    () => categorizeSessions(query.data?.sessions),
    [query.data],
  )

  const featured = categorized.upcoming[0] ?? null
  const upcomingRest = categorized.upcoming.slice(1)
  const past = categorized.past
  const totalCoachedHours = past.reduce(
    (sum, session) => sum + (session.duration_mins ?? 0),
    0,
  ) / 60

  const isEmpty =
    !query.isLoading &&
    !query.isError &&
    categorized.upcoming.length === 0 &&
    categorized.past.length === 0

  const upcomingTotal = categorized.upcoming.length
  const pastTotal = categorized.past.length

  return (
    <PageShell size="medium">
      <header className="mb-8">
        <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
          Schedule
        </div>
        <h1
          className="mt-2 font-display text-[34px] lg:text-[44px] font-light leading-[1.1] tracking-[-0.015em] text-foreground"
          style={{ fontVariationSettings: "'opsz' 100, 'SOFT' 40" }}
        >
          Your{' '}
          <em
            className="not-italic"
            style={{
              fontVariationSettings: "'opsz' 108, 'SOFT' 80",
              fontWeight: 400,
            }}
          >
            sessions.
          </em>
        </h1>
        {!isEmpty && (
          <p className="mt-3 text-[14px] text-[color:var(--text-secondary)]">
            {upcomingTotal} upcoming · {pastTotal} completed.
          </p>
        )}
      </header>

      {query.isLoading ? (
        <SessionsSkeleton />
      ) : query.isError ? (
        <EmptyState
          icon={<Calendar className="h-6 w-6" strokeWidth={1.8} />}
          title="Couldn't load sessions"
          body="Try refreshing the page in a moment."
        />
      ) : isEmpty ? (
        <EmptyState
          icon={<Calendar className="h-7 w-7" strokeWidth={1.8} />}
          title="No sessions yet"
          body="Your coach will book sessions here when they're scheduled."
        />
      ) : (
        <div className="space-y-8 lg:space-y-10">
          {featured && (
            <section>
              <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                Next up
              </div>
              <FeaturedNextSessionHero
                session={featured}
                coachName={me?.coach_name}
              />
            </section>
          )}
          <SessionsList
            upcomingRest={upcomingRest}
            past={past}
            totalCoachedHours={totalCoachedHours}
          />
        </div>
      )}
    </PageShell>
  )
}
