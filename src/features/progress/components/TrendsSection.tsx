import { TrendCard } from '@/features/progress/components/TrendCard'
import type { ProgressData } from '@/features/progress/hooks/useProgressData'
import { useMe } from '@/features/profile/hooks/useMe'

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
  const { data: me } = useMe()
  const weightUnit = me?.weight_unit === 'kg' ? 'kg' : 'lbs'

  return (
    <section className="space-y-4">
      <h2
        className="font-display text-[24px] lg:text-[28px] font-normal leading-tight tracking-tight text-foreground"
        style={{ fontVariationSettings: "'opsz' 30, 'SOFT' 50" }}
      >
        Trends
      </h2>
      <div className="space-y-4">
        <TrendCard
          title="Weight"
          subtitle={weightUnit}
          stroke="var(--green-brand)"
          data={data.weightSeries}
          valueSuffix={` ${weightUnit}`}
          formatValue={(value) => value.toFixed(1)}
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
    </section>
  )
}
