import { createFileRoute, Link } from '@tanstack/react-router'
import { LineChart as LineChartIcon } from 'lucide-react'

import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { useStreak } from '@/features/check-ins/hooks/useStreak'
import { EmptyState } from '@/features/progress/components/EmptyState'
import { PhotosBlock } from '@/features/progress/components/PhotosBlock'
import { ProgressHero } from '@/features/progress/components/ProgressHero'
import { ProgressSkeleton } from '@/features/progress/components/ProgressSkeleton'
import { TrendsSection } from '@/features/progress/components/TrendsSection'
import { useProgressData } from '@/features/progress/hooks/useProgressData'
import { useWeightDelta } from '@/features/progress/hooks/useWeightDelta'
import { useMe } from '@/features/profile/hooks/useMe'


export const Route = createFileRoute('/_app/progress')({
  component: ProgressPage,
})

function ProgressPage() {
  const data = useProgressData()
  const weight = useWeightDelta()
  const streak = useStreak()
  const { data: me } = useMe()

  return (
    <PageShell size="medium">
      <div className="space-y-8 lg:space-y-10">
        <header>
          <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
            Your progress{me?.program_week ? ` · Week ${me.program_week} of ${me.program_total ?? '?'}` : ''}
          </div>
          <h1
            className="mt-2 font-display text-[40px] lg:text-[48px] font-light leading-[1.04] tracking-[-0.015em] text-foreground"
            style={{ fontVariationSettings: "'opsz' 100, 'SOFT' 40" }}
          >
            How far you've{' '}
            <em
              className="not-italic"
              style={{
                fontVariationSettings: "'opsz' 108, 'SOFT' 90",
                fontWeight: 400,
              }}
            >
              come.
            </em>
          </h1>
          <p className="mt-2 text-[14px] text-[color:var(--text-secondary)]">
            Your trends and photo timeline. Updated after every check-in.
          </p>
        </header>

        {data.isLoading ? (
          <ProgressSkeleton />
        ) : data.isError ? (
          <EmptyState
            icon={<LineChartIcon className="h-6 w-6" strokeWidth={1.8} />}
            title="Couldn't load progress"
            body="Try refreshing the page in a moment."
          />
        ) : data.totalCheckIns === 0 ? (
          <EmptyState
            icon={<LineChartIcon className="h-7 w-7" strokeWidth={1.8} />}
            title="No check-ins yet"
            body="Submit your first weekly check-in to start seeing trends and photos here."
            cta={
              <Button asChild size="sm">
                <Link to="/check-in">Start check-in</Link>
              </Button>
            }
          />
        ) : (
          <>
            <ProgressHero
              weight={weight}
              streak={streak}
              weeksLogged={data.totalCheckIns}
              programTotal={me?.program_total}
            />
            <PhotosBlock photos={data.photos} />
            <TrendsSection data={data} />
          </>
        )}
      </div>
    </PageShell>
  )
}
