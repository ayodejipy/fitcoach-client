import { TrendChart } from '@/features/progress/components/TrendChart'
import type { TrendPoint } from '@/features/progress/hooks/useProgressData'

/*
 * TrendCard — one metric card. Title on top, latest-value chip on the right,
 * chart underneath.
 *
 * Three of these stack vertically in `TrendsSection` (weight/energy/mood).
 * Keeping the visual treatment in this single file means changes to padding,
 * radius, or border affect all three at once.
 *
 * Empty state: when `data` has no non-null values, render a quiet placeholder
 * inside the card instead of the chart — keeps the card present in the
 * layout so the section doesn't reflow once a user logs their first datum.
 */

interface Props {
  title: string
  /** Subtitle under the title — usually the unit ("lbs") or scale ("1-10"). */
  subtitle?: string
  /** Color of the line + latest-value chip. */
  stroke?: string
  data: TrendPoint[]
  /** Optional Y-axis domain — pass [1, 10] for scores. */
  yDomain?: [number, number]
  /** Tooltip + latest-value suffix, e.g. " lbs" or " / 10". */
  valueSuffix?: string
  formatValue?: (n: number) => string
}

export function TrendCard({
  title,
  subtitle,
  stroke = 'var(--green-brand)',
  data,
  yDomain,
  valueSuffix = '',
  formatValue = (n) => String(n),
}: Props) {
  // Latest data point with an actual (non-null) value. Walking backwards is
  // cheaper than filtering + popping and reads as "find the most recent".
  let latest: number | null = null
  for (let i = data.length - 1; i >= 0; i--) {
    const v = data[i]?.value
    if (typeof v === 'number') {
      latest = v
      break
    }
  }

  const hasAnyValue = latest !== null

  return (
    <section className="rounded-[14px] border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <header className="mb-2 flex items-baseline justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-bold tracking-tight text-foreground">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[11px] text-[color:var(--text-muted)]">
              {subtitle}
            </p>
          )}
        </div>
        {hasAnyValue && (
          <div
            className="inline-flex items-baseline gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold"
            style={{
              background: 'var(--green-pale)',
              color: stroke,
            }}
          >
            <span>{formatValue(latest!)}</span>
            {valueSuffix && (
              <span className="text-[10px] opacity-80">{valueSuffix.trim()}</span>
            )}
          </div>
        )}
      </header>

      {hasAnyValue ? (
        <TrendChart
          data={data}
          stroke={stroke}
          yDomain={yDomain}
          valueSuffix={valueSuffix}
          formatValue={formatValue}
        />
      ) : (
        <div className="flex h-44 items-center justify-center rounded-[10px] bg-[color:var(--bg-surface-muted)] text-[12px] text-[color:var(--text-muted)]">
          Log a check-in to start your {title.toLowerCase()} trend.
        </div>
      )}
    </section>
  )
}
