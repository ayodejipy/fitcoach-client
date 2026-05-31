import { createFileRoute, Link } from '@tanstack/react-router'
import { LineChart as LineChartIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/features/progress/components/EmptyState'
import { PhotosBlock } from '@/features/progress/components/PhotosBlock'
import { ProgressSkeleton } from '@/features/progress/components/ProgressSkeleton'
import { TrendsSection } from '@/features/progress/components/TrendsSection'
import { useProgressData } from '@/features/progress/hooks/useProgressData'

/*
 * `/progress` — the long-term view.
 *
 * Two stacked sections (Decision 1A):
 *   1. Photo timeline (horizontal swipe carousel of progress photos)
 *   2. Trends (weight / energy / mood line charts)
 *
 * Data: `useProgressData` reads from `useCheckIns()` and projects each into
 * the shapes the components want. The route is a thin presentational composer.
 *
 * Recharts is heavy (~80 KB gzip). Vite's `autoCodeSplitting: true` on the
 * router plugin already lazy-loads each route as its own chunk, so the
 * Recharts module only downloads when someone navigates to /progress.
 */
export const Route = createFileRoute('/_app/progress')({
  component: ProgressPage,
})

function ProgressPage() {
  const data = useProgressData()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-foreground">
          Progress
        </h1>
        <p className="mt-1 text-[13px] text-[color:var(--text-secondary)]">
          Your trends and photo timeline.
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
          <PhotosBlock photos={data.photos} />
          <TrendsSection data={data} />
        </>
      )}
    </div>
  )
}
