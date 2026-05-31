import { TrendCard } from '@/features/progress/components/TrendCard'
import type { ProgressData } from '@/features/progress/hooks/useProgressData'

/*
 * TrendsSection — the three small charts (weight/energy/mood) stacked
 * vertically on the /progress page.
 *
 * Why three separate cards rather than one combined chart: the metrics have
 * different units (lbs vs 1-10 score), so one shared Y-axis would be
 * meaningless. Three small multiples let each tell its own story while
 * still scanning in seconds.
 *
 * Colors are intentionally distinct so the user reads them as "different
 * things":
 *   - weight  → brand green (the headline metric)
 *   - energy  → fire-2 (orange — the lively one)
 *   - mood    → green-mid (the soft, gentle one)
 *
 * No props beyond the derived data — this section is a layout, not a state
 * holder.
 */
interface Props {
  data: Pick<ProgressData, 'weightSeries' | 'energySeries' | 'moodSeries'>
}

export function TrendsSection({ data }: Props) {
  return (
    <div className="space-y-3">
      <TrendCard
        title="Weight"
        subtitle="lbs"
        stroke="var(--green-brand)"
        data={data.weightSeries}
        valueSuffix=" lbs"
        formatValue={(n) => n.toFixed(1)}
      />
      <TrendCard
        title="Energy"
        subtitle="1–10"
        stroke="var(--fire-2)"
        data={data.energySeries}
        yDomain={[1, 10]}
        valueSuffix=" / 10"
      />
      <TrendCard
        title="Mood"
        subtitle="1–10"
        stroke="var(--green-mid)"
        data={data.moodSeries}
        yDomain={[1, 10]}
        valueSuffix=" / 10"
      />
    </div>
  )
}
