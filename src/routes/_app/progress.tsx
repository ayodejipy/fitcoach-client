import { createFileRoute } from '@tanstack/react-router'
import { LineChart } from 'lucide-react'

import { ComingSoon } from '@/features/navigation/components/ComingSoon'

/*
 * `/progress` — placeholder route.
 *
 * The real implementation lands with Task T9: a horizontally-swipable progress
 * photo timeline + Recharts trend lines for weight/energy/mood (lazy-loaded so
 * Recharts stays out of the main bundle).
 *
 * This stub exists so the nav doesn't 404 on press. Copy previews what's
 * coming so the empty state still feels intentional rather than broken.
 */
export const Route = createFileRoute('/_app/progress')({
  component: ProgressPage,
})

function ProgressPage() {
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

      <ComingSoon
        icon={<LineChart className="h-7 w-7" strokeWidth={1.8} />}
        title="Trends and photos land next"
        body="A horizontal photo timeline and weight, energy, and mood charts are on the way."
      />
    </div>
  )
}
