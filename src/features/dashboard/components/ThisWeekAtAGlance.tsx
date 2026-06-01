import { StatBlock } from '@/features/dashboard/components/StatBlock'
import type { ThisWeekStats } from '@/features/dashboard/hooks/useThisWeekStats'


interface Props {
  stats: ThisWeekStats
}

export function ThisWeekAtAGlance({ stats }: Props) {
  if (stats.isLoading) {
    return <div className="h-[140px] animate-pulse rounded-[22px] bg-muted" />
  }

  return (
    <section className="rounded-[22px] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-baseline justify-between">
        <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
          This week at a glance
        </div>
      </div>

      {!stats.submitted ? (
        <p className="mt-4 text-[13.5px] text-[color:var(--text-secondary)]">
          Submit this week's check-in to see your sleep, energy, and mood
          snapshot here.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <StatBlock
            label="Sleep hrs"
            value={stats.sleepHrs}
            formatValue={(value) => value.toFixed(1).replace(/\.0$/, '')}
          />
          <StatBlock
            label="Energy"
            value={stats.energyScore}
            suffix="/10"
            divider
          />
          <StatBlock label="Mood" value={stats.moodScore} suffix="/10" />
        </div>
      )}
    </section>
  )
}
